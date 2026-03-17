const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  position: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'terminated'),
    defaultValue: 'active'
  }
}, {
  tableName: 'employees',
  timestamps: true
});

module.exports = Employee;
