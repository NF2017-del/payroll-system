# Payroll & HR Management System - Specification

## Project Overview
- **Project Name**: PayrollHR
- **Type**: Full-stack Web Application
- **Core Functionality**: Comprehensive HR and payroll management system for ~100 employees with multiple departments
- **Target Users**: Admin, HR Manager, Department Manager, Employees

## Tech Stack
- **Frontend**: React 18 + Tailwind CSS + React Router
- **Backend**: Node.js + Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with role-based access control

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY AUTO_INCREMENT | User ID |
| username | VARCHAR(50) UNIQUE | Login username |
| password | VARCHAR(255) | Hashed password |
| role | ENUM('admin', 'hr', 'manager', 'employee') | User role |
| employee_id | INT NULL | FK to employees |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### departments
| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Department ID |
| name | VARCHAR(100) | Department name |
| description | TEXT | Department description |
| manager_id | INT NULL | FK to employees |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### employees
| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Employee ID |
| first_name | VARCHAR(50) | First name |
| last_name | VARCHAR(50) | Last name |
| email | VARCHAR(100) UNIQUE | Email address |
| phone | VARCHAR(20) | Phone number |
| department_id | INT NULL | FK to departments |
| position | VARCHAR(100) | Job position |
| salary | DECIMAL(10,2) | Base salary |
| hire_date | DATE | Hire date |
| status | ENUM('active', 'inactive', 'terminated') | Employment status |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### payroll
| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Payroll ID |
| employee_id | INT | FK to employees |
| month | INT | Month (1-12) |
| year | INT | Year |
| base_salary | DECIMAL(10,2) | Base salary |
| overtime_hours | DECIMAL(5,2) | Overtime hours |
| overtime_rate | DECIMAL(5,2) | Hourly overtime rate |
| overtime_amount | DECIMAL(10,2) | Calculated overtime |
| bonus | DECIMAL(10,2) | Bonus amount |
| deductions | DECIMAL(10,2) | Total deductions |
| gross_salary | DECIMAL(10,2) | Gross salary |
| net_salary | DECIMAL(10,2) | Net salary |
| status | ENUM('draft', 'processed', 'paid') | Payment status |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### attendance
| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Attendance ID |
| employee_id | INT | FK to employees |
| date | DATE | Attendance date |
| clock_in | TIME | Clock in time |
| clock_out | TIME | Clock out time |
| hours_worked | DECIMAL(5,2) | Total hours |
| status | ENUM('present', 'absent', 'late') | Attendance status |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### leave_requests
| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY AUTO_INCREMENT | Request ID |
| employee_id | INT | FK to employees |
| leave_type | ENUM('vacation', 'sick', 'unpaid') | Leave type |
| start_date | DATE | Start date |
| end_date | DATE | End date |
| reason | TEXT | Reason for leave |
| status | ENUM('pending', 'approved', 'rejected') | Request status |
| approved_by | INT NULL | FK to employees (approver) |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

## API Endpoints

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/auth/me - Get current user

### Employees
- GET /api/employees - List all employees
- GET /api/employees/:id - Get employee by ID
- POST /api/employees - Create employee
- PUT /api/employees/:id - Update employee
- DELETE /api/employees/:id - Delete employee

### Departments
- GET /api/departments - List all departments
- GET /api/departments/:id - Get department by ID
- POST /api/departments - Create department
- PUT /api/departments/:id - Update department
- DELETE /api/departments/:id - Delete department

### Payroll
- GET /api/payroll - List payroll records
- GET /api/payroll/:id - Get payroll by ID
- POST /api/payroll - Create payroll record
- PUT /api/payroll/:id - Update payroll record
- GET /api/payroll/employee/:employeeId - Get employee payroll
- GET /api/payroll/month/:year/:month - Get payroll by month

### Attendance
- GET /api/attendance - List attendance records
- POST /api/attendance/clock-in - Clock in
- POST /api/attendance/clock-out - Clock out
- GET /api/attendance/employee/:employeeId - Get employee attendance
- GET /api/attendance/month/:employeeId/:year/:month - Monthly report

### Leave Requests
- GET /api/leave-requests - List leave requests
- POST /api/leave-requests - Create leave request
- PUT /api/leave-requests/:id - Update leave request (approve/reject)
- GET /api/leave-requests/employee/:employeeId - Employee's requests

### Dashboard
- GET /api/dashboard/admin - Admin dashboard stats
- GET /api/dashboard/hr - HR dashboard stats
- GET /api/dashboard/employee/:id - Employee dashboard stats

## Frontend Pages

### Layout
- Sidebar navigation (collapsible on mobile)
- Top header with user info and logout
- Main content area

### Pages
1. **Login** - /login
2. **Dashboard** - /dashboard
3. **Employees** - /employees (CRUD)
4. **Departments** - /departments (CRUD)
5. **Payroll** - /payroll (list, create, view payslip)
6. **Attendance** - /attendance (clock in/out, monthly report)
7. **Leave Requests** - /leave-requests (list, create, approve/reject)
8. **Profile** - /profile

## UI/UX Specification

### Color Palette
- Primary: #1e40af (Blue 800)
- Primary Light: #3b82f6 (Blue 500)
- Secondary: #64748b (Slate 500)
- Accent: #10b981 (Emerald 500)
- Danger: #ef4444 (Red 500)
- Warning: #f59e0b (Amber 500)
- Background: #f8fafc (Slate 50)
- Card Background: #ffffff
- Text Primary: #1e293b (Slate 800)
- Text Secondary: #64748b (Slate 500)
- Border: #e2e8f0 (Slate 200)

### Typography
- Font Family: Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- H1: 2rem (32px)
- H2: 1.5rem (24px)
- H3: 1.25rem (20px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

### Components
- Cards with subtle shadows
- Tables with hover effects
- Form inputs with focus states
- Buttons with hover/active states
- Modals for confirmations
- Toast notifications for feedback
- Loading spinners

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Roles & Permissions

### Admin
- Full access to all modules
- Manage users
- View all data

### HR
- Manage employees
- Manage departments
- Process payroll
- Approve/reject leave requests
- View attendance

### Manager
- View department employees
- View department attendance
- Approve leave requests for department

### Employee
- View own profile
- View own payslips
- Clock in/out
- Submit leave requests

## Sample Data
- 1 Admin user (admin/admin123)
- 1 HR user (hr/hr123)
- 1 Manager user (manager/manager123)
- 1 Employee user (employee/employee123)
- 3 Departments (Engineering, HR, Sales)
- 10 Sample employees
- Sample attendance records
- Sample payroll records
- Sample leave requests
