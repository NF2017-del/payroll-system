const { sequelize, User, Employee, Department, Payroll, Attendance, LeaveRequest } = require('../models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create departments
    const departments = await Department.bulkCreate([
      { name: 'Engineering', description: 'Software Development and IT' },
      { name: 'Human Resources', description: 'HR and People Operations' },
      { name: 'Sales', description: 'Sales and Marketing' },
      { name: 'Finance', description: 'Financial Management' },
      { name: 'Operations', description: 'Operations and Logistics' }
    ]);
    console.log('Departments created');

    // Create employees
    const employees = await Employee.bulkCreate([
      { first_name: 'John', last_name: 'Smith', email: 'john.smith@company.com', phone: '555-0101', department_id: departments[0].id, position: 'Software Engineer', salary: 7500.00, hire_date: '2023-01-15', status: 'active' },
      { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@company.com', phone: '555-0102', department_id: departments[0].id, position: 'Senior Developer', salary: 9500.00, hire_date: '2022-06-01', status: 'active' },
      { first_name: 'Michael', last_name: 'Williams', email: 'michael.williams@company.com', phone: '555-0103', department_id: departments[0].id, position: 'Tech Lead', salary: 12000.00, hire_date: '2021-03-20', status: 'active' },
      { first_name: 'Emily', last_name: 'Brown', email: 'emily.brown@company.com', phone: '555-0104', department_id: departments[1].id, position: 'HR Manager', salary: 8500.00, hire_date: '2022-01-10', status: 'active' },
      { first_name: 'David', last_name: 'Davis', email: 'david.davis@company.com', phone: '555-0105', department_id: departments[1].id, position: 'HR Specialist', salary: 5500.00, hire_date: '2023-08-01', status: 'active' },
      { first_name: 'Jessica', last_name: 'Miller', email: 'jessica.miller@company.com', phone: '555-0106', department_id: departments[2].id, position: 'Sales Manager', salary: 9000.00, hire_date: '2022-04-15', status: 'active' },
      { first_name: 'Robert', last_name: 'Wilson', email: 'robert.wilson@company.com', phone: '555-0107', department_id: departments[2].id, position: 'Sales Representative', salary: 5000.00, hire_date: '2023-11-01', status: 'active' },
      { first_name: 'Amanda', last_name: 'Taylor', email: 'amanda.taylor@company.com', phone: '555-0108', department_id: departments[3].id, position: 'Financial Analyst', salary: 7000.00, hire_date: '2022-09-01', status: 'active' },
      { first_name: 'Christopher', last_name: 'Anderson', email: 'christopher.anderson@company.com', phone: '555-0109', department_id: departments[4].id, position: 'Operations Manager', salary: 8000.00, hire_date: '2021-11-15', status: 'active' },
      { first_name: 'Jennifer', last_name: 'Thomas', email: 'jennifer.thomas@company.com', phone: '555-0110', department_id: departments[0].id, position: 'Junior Developer', salary: 4500.00, hire_date: '2024-01-08', status: 'active' }
    ]);
    console.log('Employees created');

    // Update department managers
    await departments[0].update({ manager_id: employees[2].id }); // Engineering - Michael
    await departments[1].update({ manager_id: employees[3].id }); // HR - Emily
    await departments[2].update({ manager_id: employees[5].id }); // Sales - Jessica
    console.log('Department managers assigned');

    // Create users with individual hooks to hash passwords
    for (const userData of [
      { username: 'admin', password: 'admin123', role: 'admin', employee_id: null },
      { username: 'hr', password: 'hr123', role: 'hr', employee_id: employees[3].id },
      { username: 'manager', password: 'manager123', role: 'manager', employee_id: employees[2].id },
      { username: 'employee', password: 'employee123', role: 'employee', employee_id: employees[0].id },
      { username: 'john.smith', password: 'password123', role: 'employee', employee_id: employees[0].id },
      { username: 'sarah.johnson', password: 'password123', role: 'employee', employee_id: employees[1].id },
      { username: 'michael.williams', password: 'password123', role: 'manager', employee_id: employees[2].id },
      { username: 'emily.brown', password: 'password123', role: 'hr', employee_id: employees[3].id },
      { username: 'david.davis', password: 'password123', role: 'employee', employee_id: employees[4].id },
      { username: 'jessica.miller', password: 'password123', role: 'manager', employee_id: employees[5].id }
    ]) {
      await User.create(userData);
    }
    console.log('Users created');

    // Create payroll records for current and past months
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const payrollData = [];
    for (let i = 0; i < 3; i++) {
      const month = currentMonth - i || 12;
      const year = i === 0 ? currentYear : (currentMonth - i < 0 ? currentYear - 1 : currentYear);
      
      for (const emp of employees) {
        if (emp.status === 'active') {
          const baseSalary = parseFloat(emp.salary);
          const overtime = Math.random() * 10;
          const bonus = Math.random() > 0.7 ? 500 : 0;
          const deductions = baseSalary * 0.2; // 20% tax
          const overtimeAmount = overtime * 50;
          const grossSalary = baseSalary + overtimeAmount + bonus;
          const netSalary = grossSalary - deductions;

          payrollData.push({
            employee_id: emp.id,
            month: month,
            year: year,
            base_salary: baseSalary,
            overtime_hours: overtime.toFixed(2),
            overtime_rate: 50.00,
            overtime_amount: overtimeAmount.toFixed(2),
            bonus: bonus,
            deductions: deductions.toFixed(2),
            gross_salary: grossSalary.toFixed(2),
            net_salary: netSalary.toFixed(2),
            status: i === 0 ? 'processed' : 'paid'
          });
        }
      }
    }

    await Payroll.bulkCreate(payrollData);
    console.log('Payroll records created');

    // Create attendance records for current month
    const attendanceData = [];
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    for (const emp of employees) {
      for (let day = 1; day <= daysInMonth; day++) {
        // Skip weekends
        const date = new Date(currentYear, currentMonth - 1, day);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        // Random attendance (90% present/late, 10% absent)
        const rand = Math.random();
        const status = rand > 0.9 ? 'absent' : (rand > 0.7 ? 'late' : 'present');
        
        if (status !== 'absent') {
          const hour = status === 'late' ? Math.floor(Math.random() * 2) + 9 : Math.floor(Math.random() * 2) + 8;
          const minute = Math.floor(Math.random() * 60);
          const clockIn = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
          
          const outHour = hour + 8 + Math.floor(Math.random() * 2);
          const outMinute = Math.floor(Math.random() * 60);
          const clockOut = `${String(outHour).padStart(2, '0')}:${String(outMinute).padStart(2, '0')}:00`;
          
          const inTime = new Date(`2000-01-01 ${clockIn}`);
          const outTime = new Date(`2000-01-01 ${clockOut}`);
          const hoursWorked = ((outTime - inTime) / (1000 * 60 * 60)).toFixed(2);

          attendanceData.push({
            employee_id: emp.id,
            date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            clock_in: clockIn,
            clock_out: clockOut,
            hours_worked: hoursWorked,
            status: status
          });
        } else {
          attendanceData.push({
            employee_id: emp.id,
            date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            clock_in: null,
            clock_out: null,
            hours_worked: 0,
            status: 'absent'
          });
        }
      }
    }

    await Attendance.bulkCreate(attendanceData);
    console.log('Attendance records created');

    // Create leave requests
    await LeaveRequest.bulkCreate([
      { employee_id: employees[0].id, leave_type: 'vacation', start_date: '2026-03-20', end_date: '2026-03-25', reason: 'Family vacation', status: 'approved', approved_by: employees[2].id },
      { employee_id: employees[1].id, leave_type: 'sick', start_date: '2026-03-10', end_date: '2026-03-11', reason: 'Not feeling well', status: 'approved', approved_by: employees[2].id },
      { employee_id: employees[4].id, leave_type: 'vacation', start_date: '2026-04-01', end_date: '2026-04-05', reason: 'Personal leave', status: 'pending' },
      { employee_id: employees[6].id, leave_type: 'unpaid', start_date: '2026-03-15', end_date: '2026-03-16', reason: 'Personal matters', status: 'pending' },
      { employee_id: employees[0].id, leave_type: 'sick', start_date: '2026-02-15', end_date: '2026-02-15', reason: 'Doctor appointment', status: 'approved', approved_by: employees[2].id },
      { employee_id: employees[8].id, leave_type: 'vacation', start_date: '2026-05-10', end_date: '2026-05-15', reason: 'Annual vacation', status: 'pending' }
    ]);
    console.log('Leave requests created');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
