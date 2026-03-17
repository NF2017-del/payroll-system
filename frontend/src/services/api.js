import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

// Employees
export const getEmployees = (params) => api.get('/employees', { params });
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Departments
export const getDepartments = () => api.get('/departments');
export const getDepartment = (id) => api.get(`/departments/${id}`);
export const createDepartment = (data) => api.post('/departments', data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);

// Payroll
export const getPayroll = (params) => api.get('/payroll', { params });
export const getPayrollById = (id) => api.get(`/payroll/${id}`);
export const getEmployeePayroll = (employeeId, params) => api.get(`/payroll/employee/${employeeId}`, { params });
export const getPayrollByMonth = (year, month) => api.get(`/payroll/month/${year}/${month}`);
export const createPayroll = (data) => api.post('/payroll', data);
export const updatePayroll = (id, data) => api.put(`/payroll/${id}`, data);
export const deletePayroll = (id) => api.delete(`/payroll/${id}`);
export const processPayroll = (data) => api.post('/payroll/process', data);

// Attendance
export const getAttendance = (params) => api.get('/attendance', { params });
export const getEmployeeAttendance = (employeeId, params) => api.get(`/attendance/employee/${employeeId}`, { params });
export const getMonthlyReport = (employeeId, year, month) => api.get(`/attendance/month/${employeeId}/${year}/${month}`);
export const clockIn = (data) => api.post('/attendance/clock-in', data);
export const clockOut = (data) => api.post('/attendance/clock-out', data);
export const createAttendance = (data) => api.post('/attendance', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);

// Leave Requests
export const getLeaveRequests = (params) => api.get('/leave-requests', { params });
export const getLeaveRequest = (id) => api.get(`/leave-requests/${id}`);
export const getEmployeeLeaveRequests = (employeeId, params) => api.get(`/leave-requests/employee/${employeeId}`, { params });
export const createLeaveRequest = (data) => api.post('/leave-requests', data);
export const updateLeaveRequest = (id, data) => api.put(`/leave-requests/${id}`, data);
export const approveLeaveRequest = (id, data) => api.post(`/leave-requests/${id}/approve`, data);
export const rejectLeaveRequest = (id, data) => api.post(`/leave-requests/${id}/reject`, data);
export const deleteLeaveRequest = (id) => api.delete(`/leave-requests/${id}`);

// Dashboard
export const getAdminDashboard = () => api.get('/dashboard/admin');
export const getHRDashboard = () => api.get('/dashboard/hr');
export const getManagerDashboard = (id) => api.get(`/dashboard/manager/${id}`);
export const getEmployeeDashboard = (id) => api.get(`/dashboard/employee/${id}`);

export default api;