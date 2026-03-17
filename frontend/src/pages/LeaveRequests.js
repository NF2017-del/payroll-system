import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaveRequests, getEmployeeLeaveRequests, createLeaveRequest, approveLeaveRequest, rejectLeaveRequest, deleteLeaveRequest } from '../services/api';

const LeaveRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({ leave_type: 'vacation', start_date: '', end_date: '', reason: '' });

  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      if (user.role === 'employee') {
        const res = await getEmployeeLeaveRequests(user.employee?.id, { status: filterStatus });
        setRequests(res.data);
      } else {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        const [reqRes] = await Promise.all([getLeaveRequests(params)]);
        setRequests(reqRes.data);
      }
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLeaveRequest({ ...formData, employee_id: user.employee?.id });
      setShowModal(false);
      setFormData({ leave_type: 'vacation', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this request?')) {
      try { await approveLeaveRequest(id, { approved_by: user.employee?.id }); fetchData(); }
      catch (error) { alert(error.response?.data?.message || 'Error'); }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this request?')) {
      try { await rejectLeaveRequest(id, { approved_by: user.employee?.id }); fetchData(); }
      catch (error) { alert(error.response?.data?.message || 'Error'); }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this request?')) {
      try { await deleteLeaveRequest(id); fetchData(); }
      catch (error) { alert(error.response?.data?.message || 'Error'); }
    }
  };

  const getLeaveTypeLabel = (type) => ({ vacation: 'Vacation', sick: 'Sick', unpaid: 'Unpaid' }[type] || type);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
        {user.role === 'employee' && <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Request Leave</button>}
      </div>

      <div className="card p-4 mb-6">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input max-w-xs">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {user.role !== 'employee' && <th>Employee</th>}
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                {user.role !== 'employee' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  {user.role !== 'employee' && <td className="font-medium">{r.employee?.first_name} {r.employee?.last_name}</td>}
                  <td><span className="badge badge-info">{getLeaveTypeLabel(r.leave_type)}</span></td>
                  <td>{new Date(r.start_date).toLocaleDateString()}</td>
                  <td>{new Date(r.end_date).toLocaleDateString()}</td>
                  <td className="max-w-xs truncate">{r.reason || '-'}</td>
                  <td><span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                  {user.role !== 'employee' && (
                    <td>
                      {r.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(r.id)} className="text-emerald-600 hover:text-emerald-800">Approve</button>
                          <button onClick={() => handleReject(r.id)} className="text-red-600 hover:text-red-800">Reject</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {requests.length === 0 && <div className="text-center py-8 text-slate-500">No requests</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Request Leave</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Leave Type *</label>
                  <select value={formData.leave_type} onChange={(e) => setFormData({...formData, leave_type: e.target.value})} className="input" required>
                    <option value="vacation">Vacation</option>
                    <option value="sick">Sick</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Start Date *</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="input" required /></div>
                  <div><label className="block text-sm font-medium mb-1">End Date *</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="input" required /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Reason</label><textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="input" rows="3" /></div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;