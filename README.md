# Payroll & HR Management System

A comprehensive full-stack web application for managing HR and payroll operations. Built with React, Node.js, Express, and MySQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [Database](#database)
- [Running the Application](#running-the-application)
- [Default Credentials](#default-credentials)
- [API Documentation](#api-documentation)
- [Frontend Pages](#frontend-pages)
- [Roles \& Permissions](#roles--permissions)
- [Troubleshooting](#troubleshooting)

---

## Features

### Core Features
- **User Authentication** - JWT-based login with role-based access control
- **Employee Management** - Full CRUD operations for employee records
- **Department Management** - Create and manage departments with managers
- **Payroll Processing** - Calculate and manage employee salaries
- **Attendance Tracking** - Clock in/out functionality with monthly reports
- **Leave Management** - Submit and approve leave requests

### User Roles
| Role | Description |
|------|-------------|
| Admin | Full system access, manage users, view all data |
| HR | Manage employees, departments, process payroll |
| Manager | View department employees, approve leave requests |
| Employee | View profile, payslips, clock in/out, request leave |

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **React Scripts** - Build tooling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - ORM for MySQL
- **JSON Web Token (JWT)** - Authentication
- **bcryptjs** - Password hashing
- **MySQL** - Database

---

## Project Structure

```
payroll_system/
├── backend/                  # Backend application
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware (auth)
│   ├── models/             # Sequelize models
│   ├── routes/            # API routes
│   ├── utils/             # Database utilities
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Entry point
│
├── frontend/               # Frontend application
│   ├── public/            # Static assets
│   ├── src/               # React source code
│   ├── package.json
│   └── tailwind.config.js
│
├── setup.sh               # Easy setup script
├── README.md              # This file
└── SPEC.md                # Detailed specification
```

---

## Prerequisites

Before installing, ensure you have the following:

| Software | Version | Required |
|----------|---------|----------|
| Node.js | 18.x or higher | Yes |
| MySQL | 8.0 or higher | Yes |
| npm | 9.x or higher | Yes (comes with Node.js) |

### Installing Prerequisites

**Node.js:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**MySQL:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS
brew install mysql
brew services start mysql
```

---

## Quick Start

### 1. Clone and Navigate
```bash
cd payroll_system
```

### 2. Run Setup Script
```bash
# Make script executable
chmod +x setup.sh

# Run the setup
./setup.sh
```

The setup script will:
- Install backend dependencies
- Install frontend dependencies
- Prompt for MySQL configuration
- Create the database and tables
- Optionally seed sample data

### 3. Start the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

---

## Manual Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=payroll_hr
DB_USER=root
DB_PASSWORD=root

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Create Database

```bash
cd backend
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS payroll_hr;"
```

### 4. Sync Database Tables

```bash
node utils/syncDatabase.js
```

### 5. (Optional) Seed Sample Data

```bash
node utils/seedDatabase.js
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | MySQL host | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_NAME | Database name | payroll_hr |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | root |
| JWT_SECRET | Secret key for JWT | (generated) |
| JWT_EXPIRES_IN | JWT expiration time | 24h |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |

---

## Database

### Database Scripts

| Command | Description |
|---------|-------------|
| `npm run db:create` | Create the database |
| `npm run db:sync` | Create/update tables |
| `npm run db:seed` | Insert sample data |

### Database Tables
- `users` - User accounts with roles
- `departments` - Company departments
- `employees` - Employee information
- `payroll` - Salary records
- `attendance` - Clock in/out records
- `leave_requests` - Leave applications

---

## Running the Application

### Development Mode

```bash
# Backend (with auto-reload)
cd backend
npm run dev

# Frontend (with hot reload)
cd frontend
npm start
```

---

## Default Credentials

After seeding the database, you can log in with these accounts:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| HR | hr | hr123 |
| Manager | manager | manager123 |
| Employee | employee | employee123 |

> **Security Note:** Change these passwords in production!

---

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Employee Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees |
| GET | `/api/employees/:id` | Get employee by ID |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Department Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/departments` | List all departments |
| POST | `/api/departments` | Create department |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |

### Payroll Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payroll` | List payroll records |
| POST | `/api/payroll` | Create payroll record |
| PUT | `/api/payroll/:id` | Update payroll record |
| GET | `/api/payroll/employee/:employeeId` | Get employee payroll |

### Attendance Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | List attendance records |
| POST | `/api/attendance/clock-in` | Clock in |
| POST | `/api/attendance/clock-out` | Clock out |

### Leave Request Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leave-requests` | List leave requests |
| POST | `/api/leave-requests` | Create leave request |
| PUT | `/api/leave-requests/:id` | Update request status |

---

## Frontend Pages

| Page | Route | Access |
|------|-------|--------|
| Login | `/login` | All |
| Dashboard | `/dashboard` | All authenticated |
| Employees | `/employees` | Admin, HR, Manager |
| Departments | `/departments` | Admin, HR |
| Payroll | `/payroll` | Admin, HR |
| Attendance | `/attendance` | All |
| Leave Requests | `/leave-requests` | All |
| Profile | `/profile` | All authenticated |

---

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

### Manager
- View department employees
- Approve leave requests (department only)

### Employee
- View own profile
- View own payslips
- Clock in/out
- Submit leave requests

---

## Troubleshooting

### Common Issues

**MySQL Connection Error**
```
Error: connect ECONNREFUSED
```
Solution: Ensure MySQL is running and credentials in `.env` are correct.

**Port Already in Use**
```
Error: listen EADDRINUSE :::5000
```
Solution: 
```bash
lsof -i :5000
kill -9 <PID>
```

**Database Not Found**
```
Error: Unknown database 'payroll_hr'
```
Solution: Run `npm run db:create`

---

**Version:** 1.0.0  
**Last Updated:** March 2026
