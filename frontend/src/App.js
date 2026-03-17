import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Profile from './pages/Profile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<ProtectedRoute roles={['admin', 'hr', 'manager']}><Employees /></ProtectedRoute>} />
            <Route path="departments" element={<ProtectedRoute roles={['admin', 'hr']}><Departments /></ProtectedRoute>} />
            <Route path="payroll" element={<ProtectedRoute roles={['admin', 'hr', 'manager']}><Payroll /></ProtectedRoute>} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;