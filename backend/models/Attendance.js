const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  clock_in: {
    type: DataTypes.TIME,
    allowNull: true
  },
  clock_out: {
    type: DataTypes.TIME,
    allowNull: true
  },
  hours_worked: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    defaultValue: 'present'
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['employee_id', 'date']
    }
  ]
});

// Calculate hours worked
Attendance.prototype.calculateHours = function() {
  if (this.clock_in && this.clock_out) {
    const inTime = new Date(`2000-01-01 ${this.clock_in}`);
    const outTime = new Date(`2000-01-01 ${this.clock_out}`);
    const diff = (outTime - inTime) / (1000 * 60 * 60); // hours
    this.hours_worked = Math.max(0, diff.toFixed(2));
  }
  return this;
};

module.exports = Attendance;