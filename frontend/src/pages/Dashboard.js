import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard, getHRDashboard, getEmployeeDashboard, getManagerDashboard } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      let response;
      if (user.role === 'admin') {
        response = await getAdminDashboard();
      } else if (user.role === 'hr') {
        response = await getHRDashboard();
      } else if (user.role === 'manager') {
        response = await getManagerDashboard(user.employee?.id);
      } else {
        response = await getEmployeeDashboard(user.employee?.id);
      }
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getMonthName = (month) => {
    const date = new Date(2024, month - 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.employee?.first_name || user?.username}!
        </h1>
        <p className="text-slate-500">Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {(user.role === 'admin' || user.role === 'hr') && (
          <>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.totalEmployees || data?.activeEmployees || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Departments</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.totalDepartments || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                  🏢
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Payroll This Month</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatCurrency(data?.totalPayroll || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                  💰
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.pendingRequests || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                  📝
                </div>
              </div>
            </div>
          </>
        )}

        {user.role === 'manager' && (
          <>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Team Size</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.teamSize || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                  👥
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Present Today</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.attendanceToday || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                  ✓
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending Leaves</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.pendingRequests || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                  📝
                </div>
              </div>
            </div>
          </>
        )}

        {user.role === 'employee' && (
          <>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Work Days This Month</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.attendanceSummary?.totalDays || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                  📅
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Days Present</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.attendanceSummary?.presentDays || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                  ✓
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Hours Worked</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.attendanceSummary?.totalHours || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                  ⏰
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {data?.pendingRequests || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                  📝
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Employee Dashboard - Payslips */}
      {user.role === 'employee' && data?.payslips && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Payslips</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Base Salary</th>
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td>{getMonthName(payslip.month)} {payslip.year}</td>
                    <td>{formatCurrency(payslip.base_salary)}</td>
                    <td>{formatCurrency(payslip.bonus)}</td>
                    <td>{formatCurrency(payslip.deductions)}</td>
                    <td className="font-semibold text-emerald-600">
                      {formatCurrency(payslip.net_salary)}
                    </td>
                    <td>
                      <span className={`badge ${
                        payslip.status === 'paid' ? 'badge-success' : 
                        payslip.status === 'processed' ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {payslip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Dashboard - Department Stats */}
      {user.role === 'admin' && data?.departmentStats && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Employees by Department</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.departmentStats.map((dept, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">{dept.name}</span>
                  <span className="text-primary-600 font-bold">{dept.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Employees / Recent Hires */}
      {(user.role === 'admin' || user.role === 'hr') && (data?.recentEmployees || data?.recentHires) && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {user.role === 'hr' ? 'Recent Hires' : 'Recent Employees'}
          </h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.recentEmployees || data.recentHires).map((emp) => (
                  <tr key={emp.id}>
                    <td className="font-medium">
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td>{emp.position}</td>
                    <td>{emp.department?.name || '-'}</td>
                    <td>{new Date(emp.hire_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        emp.status === 'active' ? 'badge-success' : 
                        emp.status === 'inactive' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manager Dashboard - Team Members */}
      {user.role === 'manager' && data?.teamMembers && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Team Members</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="font-medium">
                      {member.first_name} {member.last_name}
                    </td>
                    <td>{member.position}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`badge ${
                        member.status === 'active' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;