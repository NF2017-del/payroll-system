const { Attendance, Employee, Department } = require('../models');
const { Op } = require('sequelize');

exports.getAllAttendance = async (req, res) => {
  try {
    const { employee_id, date, start_date, end_date, status } = req.query;
    
    const where = {};
    
    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;

    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (date) {
      where.date = date;
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }],
      order: [['date', 'DESC'], ['clock_in', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { start_date, end_date } = req.query;

    const where = { employee_id: employeeId };
    
    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }],
      order: [['date', 'DESC']]
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { employeeId, year, month } = req.params;

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const attendance = await Attendance.findAll({
      where: {
        employee_id: employeeId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Employee,
        as: 'employee'
      }],
      order: [['date', 'ASC']]
    });

    // Calculate summary
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const lateDays = attendance.filter(a => a.status === 'late').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const totalHours = attendance.reduce((sum, a) => sum + parseFloat(a.hours_worked || 0), 0);
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(2) : 0;

    res.json({
      attendance,
      summary: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        totalHours,
        avgHours
      }
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clockIn = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    // Check if late (after 9:00 AM)
    const clockInTime = new Date(`2000-01-01 ${now}`);
    const nineAM = new Date('2000-01-01 09:00:00');
    const status = clockInTime > nineAM ? 'late' : 'present';

    const attendance = await Attendance.create({
      employee_id,
      date: today,
      clock_in: now,
      status,
      hours_worked: 0
    });

    const createdAttendance = await Attendance.findByPk(attendance.id, {
      include: [{ model: Employee, as: 'employee' }]
    });

    res.status(201).json(createdAttendance);
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clockOut = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Find today's attendance
    const attendance = await Attendance.findOne({
      where: {
        employee_id,
        date: today
      }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No clock in record found for today' });
    }

    if (attendance.clock_out) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }

    // Calculate hours worked
    const inTime = new Date(`2000-01-01 ${attendance.clock_in}`);
    const outTime = new Date(`2000-01-01 ${now}`);
    const diff = (outTime - inTime) / (1000 * 60 * 60);
    const hoursWorked = Math.max(0, diff.toFixed(2));

    await attendance.update({
      clock_out: now,
      hours_worked: hoursWorked
    });

    const updatedAttendance = await Attendance.findByPk(attendance.id, {
      include: [{ model: Employee, as: 'employee' }]
    });

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createAttendance = async (req, res) => {
  try {
    const { employee_id, date, clock_in, clock_out, status } = req.body;

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      where: {
        employee_id,
        date
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }

    let hoursWorked = 0;
    if (clock_in && clock_out) {
      const inTime = new Date(`2000-01-01 ${clock_in}`);
      const outTime = new Date(`2000-01-01 ${clock_out}`);
      const diff = (outTime - inTime) / (1000 * 60 * 60);
      hoursWorked = Math.max(0, diff.toFixed(2));
    }

    const attendance = await Attendance.create({
      employee_id,
      date,
      clock_in,
      clock_out,
      hours_worked: hoursWorked,
      status: status || 'present'
    });

    const createdAttendance = await Attendance.findByPk(attendance.id, {
      include: [{ model: Employee, as: 'employee' }]
    });

    res.status(201).json(createdAttendance);
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const { clock_in, clock_out, status } = req.body;

    let hoursWorked = attendance.hours_worked;
    const newClockIn = clock_in || attendance.clock_in;
    const newClockOut = clock_out || attendance.clock_out;

    if (newClockIn && newClockOut) {
      const inTime = new Date(`2000-01-01 ${newClockIn}`);
      const outTime = new Date(`2000-01-01 ${newClockOut}`);
      const diff = (outTime - inTime) / (1000 * 60 * 60);
      hoursWorked = Math.max(0, diff.toFixed(2));
    }

    await attendance.update({
      clock_in: newClockIn,
      clock_out: newClockOut,
      hours_worked: hoursWorked,
      status: status || attendance.status
    });

    const updatedAttendance = await Attendance.findByPk(attendance.id, {
      include: [{ model: Employee, as: 'employee' }]
    });

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
