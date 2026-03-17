import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/employees', label: 'Employees', icon: '👥', roles: ['admin', 'hr', 'manager'] },
    { path: '/departments', label: 'Departments', icon: '🏢', roles: ['admin', 'hr'] },
    { path: '/payroll', label: 'Payroll', icon: '💰', roles: ['admin', 'hr', 'manager'] },
    { path: '/attendance', label: 'Attendance', icon: '⏰', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/leave-requests', label: 'Leave Requests', icon: '📝', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/profile', label: 'Profile', icon: '👤', roles: ['admin', 'hr', 'manager', 'employee'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {sidebarOpen && (
            <span className="text-xl font-bold text-primary-800">PayrollHR</span>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-slate-100"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="border-t border-slate-200 p-4">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {user?.employee?.first_name} {user?.employee?.last_name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 text-center text-red-600 hover:bg-red-50 rounded-lg"
              title="Logout"
            >
              ⏻
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;