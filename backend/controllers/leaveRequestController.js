const { LeaveRequest, Employee, Department } = require('../models');
const { Op } = require('sequelize');

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { employee_id, status, leave_type } = req.query;
    
    const where = {};
    
    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;
    if (leave_type) where.leave_type = leave_type;

    const leaveRequests = await LeaveRequest.findAll({
      where,
      include: [
        { model: Employee, as: 'employee', include: [{ model: Department, as: 'department' }] },
        { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeaveRequestById = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employee', include: [{ model: Department, as: 'department' }] },
        { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json(leaveRequest);
  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.query;

    const where = { employee_id: employeeId };
    if (status) where.status = status;

    const leaveRequests = await LeaveRequest.findAll({
      where,
      include: [
        { model: Employee, as: 'employee' },
        { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(leaveRequests);
  } catch (error) {
    console.error('Get employee leave requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check for overlapping leave requests
    const overlapping = await LeaveRequest.findOne({
      where: {
        employee_id,
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          {
            start_date: { [Op.between]: [start_date, end_date] }
          },
          {
            end_date: { [Op.between]: [start_date, end_date] }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Leave request overlaps with existing request' });
    }

    const leaveRequest = await LeaveRequest.create({
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason,
      status: 'pending'
    });

    const createdRequest = await LeaveRequest.findByPk(leaveRequest.id, {
      include: [
        { model: Employee, as: 'employee' },
        { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.status(201).json(createdRequest);
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByPk(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const { status, approved_by } = req.body;

    // Only pending requests can be updated
    if (leaveRequest.status !== 'pending' && status) {
      return res.status(400).json({ message: 'Can only update pending requests' });
    }

    await leaveRequest.update({
      status: status || leaveRequest.status,
      approved_by: approved_by !== undefined ? approved_by : leaveRequest.approved_by
    });

    const updatedRequest = await LeaveRequest.findByPk(leaveRequest.id, {
      include: [
        { model: Employee, as: 'employee', include: [{ model: Department, as: 'department' }] },
        { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByPk(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only approve pending requests' });
    }

    const { approved_by } = req.body;

    await leaveRequest.update({
      status: 'approved',
      approved_by: approved_by || req.user.employee_id
    });

    const updatedRequest = await LeaveRequest.findByPk(leaveRequest.id, {
      include: [
        { model: Employee, as: 'employee', include: [{ model: Department, as: 'department' }] },
        { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByPk(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only reject pending requests' });
    }

    const { approved_by } = req.body;

    await leaveRequest.update({
      status: 'rejected',
      approved_by: approved_by || req.user.employee_id
    });

    const updatedRequest = await LeaveRequest.findByPk(leaveRequest.id, {
      include: [
        { model: Employee, as: 'employee', include: [{ model: Department, as: 'department' }] },
        { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] }
      ]
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Reject leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findByPk(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only pending requests can be deleted
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending requests' });
    }

    await leaveRequest.destroy();

    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
