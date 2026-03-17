const { Department, Employee } = require('../models');

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [
        { model: Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name'] },
        { model: Employee, as: 'employees', attributes: ['id'] }
      ],
      order: [['name', 'ASC']]
    });

    // Add employee count to each department
    const departmentsWithCount = departments.map(dept => ({
      ...dept.toJSON(),
      employee_count: dept.employees ? dept.employees.length : 0
    }));

    res.json(departmentsWithCount);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name'] },
        { model: Employee, as: 'employees' }
      ]
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description, manager_id } = req.body;

    // Check if department name already exists
    const existingDept = await Department.findOne({ where: { name } });
    if (existingDept) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    const department = await Department.create({
      name,
      description,
      manager_id: manager_id || null
    });

    const createdDepartment = await Department.findByPk(department.id, {
      include: [{ model: Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name'] }]
    });

    res.status(201).json(createdDepartment);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const { name, description, manager_id } = req.body;

    // Check if name is being changed and if it already exists
    if (name && name !== department.name) {
      const existingDept = await Department.findOne({ where: { name } });
      if (existingDept) {
        return res.status(400).json({ message: 'Department name already exists' });
      }
    }

    await department.update({
      name: name || department.name,
      description: description !== undefined ? description : department.description,
      manager_id: manager_id !== undefined ? manager_id : department.manager_id
    });

    const updatedDepartment = await Department.findByPk(department.id, {
      include: [{ model: Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name'] }]
    });

    res.json(updatedDepartment);
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has employees
    const employeeCount = await Employee.count({ where: { department_id: department.id } });
    if (employeeCount > 0) {
      return res.status(400).json({ message: 'Cannot delete department with employees' });
    }

    await department.destroy();

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
