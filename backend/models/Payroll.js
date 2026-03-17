const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payroll = sequelize.define('Payroll', {
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
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  base_salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  overtime_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  overtime_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  bonus: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  deductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  gross_salary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  net_salary: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'processed', 'paid'),
    defaultValue: 'draft'
  }
}, {
  tableName: 'payroll',
  timestamps: true
});

// Calculate gross and net salary
Payroll.prototype.calculateSalary = function() {
  this.overtime_amount = this.overtime_hours * this.overtime_rate;
  this.gross_salary = parseFloat(this.base_salary) + parseFloat(this.overtime_amount) + parseFloat(this.bonus);
  this.net_salary = this.gross_salary - parseFloat(this.deductions);
  return this;
};

module.exports = Payroll;
