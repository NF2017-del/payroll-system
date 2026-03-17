const { Employee, Department, Payroll, Attendance, LeaveRequest, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

exports.getAdminDashboard = async (req, res) => {
  try {
    // Get total employees
    const totalEmployees = await Employee.count({ where: { status: 'active' } });
    
    // Get total departments
    const totalDepartments = await Department.count();
    
    // Get current month payroll
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const payrollThisMonth = await Payroll.findAll({
      where: { month: currentMonth, year: currentYear }
    });
    
    const totalPayroll = payrollThisMonth.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);
    
    // Get pending leave requests
    const pendingRequests = await LeaveRequest.count({ where: { status: 'pending' } });
    
    // Get recent employees
    const recentEmployees = await Employee.findAll({
      include: [{ model: Department, as: 'department' }],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    // Get employees by department
    const employeesByDepartment = await Department.findAll({
      include: [{ model: Employee, as: 'employees', attributes: ['id'] }],
      attributes: ['id', 'name']
    });
    
    const departmentStats = employeesByDepartment.map(dept => ({
      name: dept.name,
      count: dept.employees ? dept.employees.length : 0
    }));
    
    res.json({
      totalEmployees,
      totalDepartments,
      totalPayroll: totalPayroll.toFixed(2),
      pendingRequests,
      recentEmployees,
      departmentStats
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHRDashboard = async (req, res) => {
  try {
    // Get total employees
    const totalEmployees = await Employee.count();
    
    // Get active employees
    const activeEmployees = await Employee.count({ where: { status: 'active' } });
    
    // Get current month payroll
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const payrollThisMonth = await Payroll.findAll({
      where: { month: currentMonth, year: currentYear }
    });
    
    const totalPayroll = payrollThisMonth.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0);
    
    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.findAll({
      where: { date: today }
    });
    
    const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    
    // Get pending leave requests
    const pendingRequests = await LeaveRequest.count({ where: { status: 'pending' } });
    
    // Get recent hires
    const recentHires = await Employee.findAll({
      where: {
        hire_date: {
          [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
        }
      },
      include: [{ model: Department, as: 'department' }],
      order: [['hire_date', 'DESC']],
      limit: 5
    });
    
    res.json({
      totalEmployees,
      activeEmployees,
      totalPayroll: totalPayroll.toFixed(2),
      presentToday,
      pendingRequests,
      recentHires
    });
  } catch (error) {
    console.error('Get HR dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get employee
    const employee = await Employee.findByPk(id, {
      include: [{ model: Department, as: 'department' }]
    });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get recent payslips
    const payslips = await Payroll.findAll({
      where: { employee_id: id },
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: 6
    });
    
    // Get this month's attendance
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
    
    const attendance = await Attendance.findAll({
      where: {
        employee_id: id,
        date: { [Op.between]: [startDate, endDate] }
      }
    });
    
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const totalHours = attendance.reduce((sum, a) => sum + parseFloat(a.hours_worked || 0), 0);
    
    // Get pending leave requests
    const myPendingRequests = await LeaveRequest.count({
      where: { employee_id: id, status: 'pending' }
    });
    
    // Get approved leave requests
    const myApprovedRequests = await LeaveRequest.findAll({
      where: { employee_id: id, status: 'approved' },
      order: [['start_date', 'DESC']],
      limit: 5
    });
    
    res.json({
      employee,
      payslips,
      attendanceSummary: {
        totalDays,
        presentDays,
        totalHours: totalHours.toFixed(2)
      },
      pendingRequests: myPendingRequests,
      upcomingLeaves: myApprovedRequests
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getManagerDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get manager's department
    const department = await Department.findOne({
      where: { manager_id: id }
    });
    
    if (!department) {
      return res.json({
        department: null,
        teamSize: 0,
        attendanceToday: 0,
        pendingRequests: 0,
        teamMembers: []
      });
    }
    
    // Get department employees
    const teamMembers = await Employee.findAll({
      where: { department_id: department.id, status: 'active' },
      include: [{ model: Department, as: 'department' }]
    });
    
    // Get today's attendance for department
    const today = new Date().toISOString().split('T')[0];
    const employeeIds = teamMembers.map(e => e.id);
    
    const todayAttendance = await Attendance.findAll({
      where: {
        employee_id: { [Op.in]: employeeIds },
        date: today
      }
    });
    
    const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    
    // Get pending leave requests for department
    const pendingRequests = await LeaveRequest.count({
      where: {
        employee_id: { [Op.in]: employeeIds },
        status: 'pending'
      }
    });
    
    res.json({
      department,
      teamSize: teamMembers.length,
      attendanceToday: presentToday,
      pendingRequests,
      teamMembers
    });
  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
