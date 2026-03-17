import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployee, getEmployeePayroll, getEmployeeAttendance, getEmployeeLeaveRequests } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const empId = user.employee?.id;
      if (!empId) return;
      
      const [empRes, payRes, attRes, leaveRes] = await Promise.all([
        getEmployee(empId),
        getEmployeePayroll(empId),
        getEmployeeAttendance(empId),
        getEmployeeLeaveRequests(empId)
      ]);
      
      setEmployee(empRes.data);
      setPayroll(payRes.data);
      setAttendance(attRes.data);
      setLeaveRequests(leaveRes.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'payroll', label: 'Payroll' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'leaves', label: 'Leave Requests' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      {/* Profile Header */}
      {employee && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
              {employee.first_name?.[0]}{employee.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{employee.first_name} {employee.last_name}</h2>
              <p className="text-slate-500">{employee.position}</p>
              <p className="text-sm text-slate-400">{employee.department?.name}</p>
            </div>
            <div className="ml-auto">
              <span className={`badge ${employee.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{employee.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && employee && (
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div><span className="text-slate-500">Email:</span> <span className="ml-2">{employee.email}</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="ml-2">{employee.phone || '-'}</span></div>
                <div><span className="text-slate-500">Hire Date:</span> <span className="ml-2">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Employment Details</h3>
              <div className="space-y-3">
                <div><span className="text-slate-500">Position:</span> <span className="ml-2">{employee.position || '-'}</span></div>
                <div><span className="text-slate-500">Department:</span> <span className="ml-2">{employee.department?.name || '-'}</span></div>
                <div><span className="text-slate-500">Salary:</span> <span className="ml-2">{formatCurrency(employee.salary)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="card overflow-hidden">
          <table className="table">
            <thead><tr><th>Period</th><th>Base</th><th>OT</th><th>Bonus</th><th>Ded.</th><th>Net</th><th>Status</th></tr></thead>
            <tbody>
              {payroll.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.year, p.month - 1).toLocaleString('default', { month: 'short' })} {p.year}</td>
                  <td>{formatCurrency(p.base_salary)}</td>
                  <td>{formatCurrency(p.overtime_amount)}</td>
                  <td>{formatCurrency(p.bonus)}</td>
                  <td>{formatCurrency(p.deductions)}</td>
                  <td className="font-semibold text-emerald-600">{formatCurrency(p.net_salary)}</td>
                  <td><span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'processed' ? 'badge-warning' : 'badge-neutral'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {payroll.length === 0 && <div className="text-center py-8 text-slate-500">No payroll records</div>}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="card overflow-hidden">
          <table className="table">
            <thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {attendance.slice(0, 30).map(a => (
                <tr key={a.id}>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.clock_in ? new Date(`2000-01-01 ${a.clock_in}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td>{a.clock_out ? new Date(`2000-01-01 ${a.clock_out}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td>{a.hours_worked || 0}</td>
                  <td><span className={`badge ${a.status === 'present' ? 'badge-success' : a.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendance.length === 0 && <div className="text-center py-8 text-slate-500">No attendance records</div>}
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="card overflow-hidden">
          <table className="table">
            <thead><tr><th>Type</th><th>Start</th><th>End</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {leaveRequests.map(l => (
                <tr key={l.id}>
                  <td><span className="badge badge-info">{l.leave_type}</span></td>
                  <td>{new Date(l.start_date).toLocaleDateString()}</td>
                  <td>{new Date(l.end_date).toLocaleDateString()}</td>
                  <td className="max-w-xs truncate">{l.reason || '-'}</td>
                  <td><span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaveRequests.length === 0 && <div className="text-center py-8 text-slate-500">No leave requests</div>}
        </div>
      )}
    </div>
  );
};

export default Profile;