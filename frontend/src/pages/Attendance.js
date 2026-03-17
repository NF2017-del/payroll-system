import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAttendance, getEmployeeAttendance, getMonthlyReport, clockIn, clockOut, getEmployees } from '../services/api';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1];
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEmployee, filterMonth, filterYear]);

  const fetchData = async () => {
    try {
      if (user.role === 'employee') {
        const empId = user.employee?.id;
        const [attRes, reportRes] = await Promise.all([
          getEmployeeAttendance(empId),
          getMonthlyReport(empId, filterYear, filterMonth)
        ]);
        setAttendance(attRes.data);
        setSummary(reportRes.data.summary);

        // Check today's clock in status using fresh data
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = attRes.data.find(a => a.date === today);
        setTodayStatus(todayRecord);
      } else {
        const params = {};
        if (filterEmployee) params.employee_id = filterEmployee;
        const [attRes, empRes] = await Promise.all([
          getAttendance(params),
          getEmployees()
        ]);
        setAttendance(attRes.data);
        setEmployees(empRes.data);
      }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleClockIn = async () => {
    try {
      await clockIn({ employee_id: user.employee?.id });
      alert('Clocked in successfully!');
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error clocking in'); }
  };

  const handleClockOut = async () => {
    try {
      await clockOut({ employee_id: user.employee?.id });
      alert('Clocked out successfully!');
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error clocking out'); }
  };

  const formatTime = (time) => time ? new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
        {user.role === 'employee' && (
          <div className="flex gap-2">
            {!todayStatus?.clock_in ? (
              <button onClick={handleClockIn} className="btn btn-primary">Clock In</button>
            ) : !todayStatus?.clock_out ? (
              <button onClick={handleClockOut} className="btn btn-primary">Clock Out</button>
            ) : (
              <span className="badge badge-success">Completed for today</span>
            )}
          </div>
        )}
      </div>

      {user.role === 'employee' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4"><p className="text-sm text-slate-500">Work Days</p><p className="text-2xl font-bold">{summary.totalDays}</p></div>
          <div className="card p-4"><p className="text-sm text-slate-500">Present</p><p className="text-2xl font-bold text-emerald-600">{summary.presentDays}</p></div>
          <div className="card p-4"><p className="text-sm text-slate-500">Late</p><p className="text-2xl font-bold text-amber-600">{summary.lateDays}</p></div>
          <div className="card p-4"><p className="text-sm text-slate-500">Total Hours</p><p className="text-2xl font-bold text-primary-600">{summary.totalHours}</p></div>
        </div>
      )}

      {user.role !== 'employee' && (
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className="input max-w-xs">
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="input max-w-xs">
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input max-w-xs">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {user.role !== 'employee' && <th>Employee</th>}
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id}>
                  {user.role !== 'employee' && <td className="font-medium">{a.employee?.first_name} {a.employee?.last_name}</td>}
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{formatTime(a.clock_in)}</td>
                  <td>{formatTime(a.clock_out)}</td>
                  <td>{a.hours_worked || 0}</td>
                  <td><span className={`badge ${a.status === 'present' ? 'badge-success' : a.status === 'late' ? 'badge-warning' : 'badge-danger'}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {attendance.length === 0 && <div className="text-center py-8 text-slate-500">No records</div>}
      </div>
    </div>
  );
};

export default Attendance;