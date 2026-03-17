const { Payroll, Employee, Department } = require('../models');
const { Op } = require('sequelize');

exports.getAllPayroll = async (req, res) => {
  try {
    const { month, year, employee_id, status } = req.query;
    
    const where = {};
    
    if (month) where.month = month;
    if (year) where.year = year;
    if (employee_id) where.employee_id = employee_id;
    if (status) where.status = status;

    const payroll = await Payroll.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json(payroll);
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }]
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json(payroll);
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEmployeePayroll = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    const where = { employee_id: employeeId };
    if (year) where.year = year;

    const payroll = await Payroll.findAll({
      where,
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json(payroll);
  } catch (error) {
    console.error('Get employee payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPayrollByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;

    const payroll = await Payroll.findAll({
      where: { year, month },
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }],
      order: [['employee', 'last_name', 'ASC']]
    });

    res.json(payroll);
  } catch (error) {
    console.error('Get payroll by month error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPayroll = async (req, res) => {
  try {
    const { employee_id, month, year, base_salary, overtime_hours, overtime_rate, bonus, deductions, status } = req.body;

    // Check if payroll already exists for this employee/month/year
    const existingPayroll = await Payroll.findOne({
      where: {
        employee_id,
        month,
        year
      }
    });

    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll already exists for this period' });
    }

    // Get employee to verify
    const employee = await Employee.findByPk(employee_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const salary = base_salary || employee.salary;
    const overtimeAmount = (overtime_hours || 0) * (overtime_rate || 0);
    const grossSalary = parseFloat(salary) + overtimeAmount + (bonus || 0);
    const netSalary = grossSalary - (deductions || 0);

    const payroll = await Payroll.create({
      employee_id,
      month,
      year,
      base_salary: salary,
      overtime_hours: overtime_hours || 0,
      overtime_rate: overtime_rate || 0,
      overtime_amount: overtimeAmount,
      bonus: bonus || 0,
      deductions: deductions || 0,
      gross_salary: grossSalary,
      net_salary: netSalary,
      status: status || 'draft'
    });

    const createdPayroll = await Payroll.findByPk(payroll.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }]
    });

    res.status(201).json(createdPayroll);
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const { base_salary, overtime_hours, overtime_rate, bonus, deductions, status } = req.body;

    const salary = base_salary !== undefined ? base_salary : payroll.base_salary;
    const overtimeHours = overtime_hours !== undefined ? overtime_hours : payroll.overtime_hours;
    const overtimeRate = overtime_rate !== undefined ? overtime_rate : payroll.overtime_rate;
    const bonusAmount = bonus !== undefined ? bonus : payroll.bonus;
    const deductionAmount = deductions !== undefined ? deductions : payroll.deductions;

    const overtimeAmount = overtimeHours * overtimeRate;
    const grossSalary = parseFloat(salary) + overtimeAmount + parseFloat(bonusAmount);
    const netSalary = grossSalary - parseFloat(deductionAmount);

    await payroll.update({
      base_salary: salary,
      overtime_hours: overtimeHours,
      overtime_rate: overtimeRate,
      overtime_amount: overtimeAmount,
      bonus: bonusAmount,
      deductions: deductionAmount,
      gross_salary: grossSalary,
      net_salary: netSalary,
      status: status || payroll.status
    });

    const updatedPayroll = await Payroll.findByPk(payroll.id, {
      include: [{
        model: Employee,
        as: 'employee',
        include: [{ model: Department, as: 'department' }]
      }]
    });

    res.json(updatedPayroll);
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    await payroll.destroy();

    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error('Delete payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.processPayroll = async (req, res) => {
  try {
    const { year, month } = req.body;

    // Get all active employees
    const employees = await Employee.findAll({
      where: { status: 'active' }
    });

    const results = [];
    for (const employee of employees) {
      // Check if payroll already exists
      const existingPayroll = await Payroll.findOne({
        where: {
          employee_id: employee.id,
          month,
          year
        }
      });

      if (!existingPayroll) {
        const grossSalary = parseFloat(employee.salary);
        const deductions = grossSalary * 0.2; // 20% tax deduction
        const netSalary = grossSalary - deductions;

        const payroll = await Payroll.create({
          employee_id: employee.id,
          month,
          year,
          base_salary: employee.salary,
          overtime_hours: 0,
          overtime_rate: 0,
          overtime_amount: 0,
          bonus: 0,
          deductions,
          gross_salary: grossSalary,
          net_salary: netSalary,
          status: 'processed'
        });

        results.push(payroll);
      }
    }

    res.json({ message: `Processed payroll for ${results.length} employees`, results });
  } catch (error) {
    console.error('Process payroll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
