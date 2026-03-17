const sequelize = require('../config/database');
const User = require('./User');
const Employee = require('./Employee');
const Department = require('./Department');
const Payroll = require('./Payroll');
const Attendance = require('./Attendance');
const LeaveRequest = require('./LeaveRequest');

// Define associations

// User - Employee (one-to-one)
User.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });
Employee.hasOne(User, { foreignKey: 'employee_id', as: 'user' });

// Department - Employee (one-to-many)
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Department - Manager (self-referential)
Department.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
Employee.hasMany(Department, { foreignKey: 'manager_id', as: 'managedDepartments' });

// Employee - Payroll (one-to-many)
Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payrollRecords' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Employee - Attendance (one-to-many)
Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendanceRecords' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// Employee - LeaveRequest (one-to-many)
Employee.hasMany(LeaveRequest, { foreignKey: 'employee_id', as: 'leaveRequests' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// LeaveRequest - Approver (self-referential)
LeaveRequest.belongsTo(Employee, { foreignKey: 'approved_by', as: 'approver' });
Employee.hasMany(LeaveRequest, { foreignKey: 'approved_by', as: 'approvedLeaves' });

module.exports = {
  sequelize,
  User,
  Employee,
  Department,
  Payroll,
  Attendance,
  LeaveRequest
};
