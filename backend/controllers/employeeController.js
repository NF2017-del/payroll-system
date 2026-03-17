const { Employee, Department, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (department) {
      where.department_id = department;
    }
    
    if (status) {
      where.status = status;
    }

    const employees = await Employee.findAll({
      where,
      include: [
        { model: Department, as: 'department' },
        { model: User, as: 'user' }
      ],
      order: [['last_name', 'ASC']]
    });

    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        { model: Department, as: 'department' },
        { model: User, as: 'user' }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department_id, position, salary, hire_date, status } = req.body;

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const employee = await Employee.create({
      first_name,
      last_name,
      email,
      phone,
      department_id,
      position,
      salary: salary || 0,
      hire_date,
      status: status || 'active'
    });

    const createdEmployee = await Employee.findByPk(employee.id, {
      include: [{ model: Department, as: 'department' }]
    });

    res.status(201).json(createdEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { first_name, last_name, email, phone, department_id, position, salary, hire_date, status } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email !== employee.email) {
      const existingEmployee = await Employee.findOne({ where: { email } });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    await employee.update({
      first_name: first_name || employee.first_name,
      last_name: last_name || employee.last_name,
      email: email || employee.email,
      phone: phone !== undefined ? phone : employee.phone,
      department_id: department_id !== undefined ? department_id : employee.department_id,
      position: position !== undefined ? position : employee.position,
      salary: salary !== undefined ? salary : employee.salary,
      hire_date: hire_date || employee.hire_date,
      status: status || employee.status
    });

    const updatedEmployee = await Employee.findByPk(employee.id, {
      include: [{ model: Department, as: 'department' }]
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee has a user account
    const user = await User.findOne({ where: { employee_id: employee.id } });
    if (user) {
      await user.destroy();
    }

    await employee.destroy();

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
