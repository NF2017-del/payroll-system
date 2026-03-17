import React, { useState, useEffect } from 'react';
import { 
  getPayroll, createPayroll, updatePayroll, deletePayroll, 
  getEmployees, processPayroll 
} from '../services/api';

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [formData, setFormData] = useState({
    employee_id: '',
    month: '',
    year: '',
    base_salary: '',
    overtime_hours: '',
    overtime_rate: '',
    bonus: '',
    deductions: '',
    status: 'draft'
  });

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
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
  }, [filterMonth, filterYear]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const [payrollRes, empRes] = await Promise.all([getPayroll(params), getEmployees()]);
      setPayroll(payrollRes.data);
      setEmployees(empRes.data);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        base_salary: parseFloat(formData.base_salary) || 0,
        overtime_hours: parseFloat(formData.overtime_hours) || 0,
        overtime_rate: parseFloat(formData.overtime_rate) || 0,
        bonus: parseFloat(formData.bonus) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        employee_id: parseInt(formData.employee_id)
      };
      if (editingPayroll) await updatePayroll(editingPayroll.id, data);
      else await createPayroll(data);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error'); }
  };

  const handleEdit = (record) => {
    setEditingPayroll(record);
    setFormData({
      employee_id: record.employee_id, month: record.month, year: record.year,
      base_salary: record.base_salary, overtime_hours: record.overtime_hours,
      overtime_rate: record.overtime_rate, bonus: record.bonus,
      deductions: record.deductions, status: record.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      try { await deletePayroll(id); fetchData(); }
      catch (error) { alert(error.response?.data?.message || 'Error'); }
    }
  };

  const handleProcessPayroll = async () => {
    const month = filterMonth || new Date().getMonth() + 1;
    const year = filterYear || currentYear;
    if (window.confirm(`Process payroll for ${months.find(m => m.value === parseInt(month))?.label} ${year}?`)) {
      try { await processPayroll({ month: parseInt(month), year: parseInt(year) }); alert('Processed!'); fetchData(); }
      catch (error) { alert(error.response?.data?.message || 'Error'); }
    }
  };

  const viewPayslip = (record) => { setSelectedPayslip(record); setShowPayslip(true); };
  const resetForm = () => { setEditingPayroll(null); setFormData({ employee_id: '', month: '', year: '', base_salary: '', overtime_hours: '', overtime_rate: '', bonus: '', deductions: '', status: 'draft' }); };
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
        <div className="flex gap-2">
          <button onClick={handleProcessPayroll} className="btn btn-secondary">Process Payroll</button>
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">+ Add Payroll</button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="input max-w-xs">
            <option value="">All Months</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="input max-w-xs">
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><p className="text-sm text-slate-500">Total Records</p><p className="text-2xl font-bold">{payroll.length}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">Total Gross</p><p className="text-2xl font-bold text-primary-600">{formatCurrency(payroll.reduce((s, p) => s + parseFloat(p.gross_salary || 0), 0))}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">Total Net</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(payroll.reduce((s, p) => s + parseFloat(p.net_salary || 0), 0))}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Employee</th><th>Period</th><th>Base</th><th>OT</th><th>Bonus</th><th>Ded.</th><th>Net</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {payroll.map(r => (
                <tr key={r.id}>
                  <td className="font-medium">{r.employee?.first_name} {r.employee?.last_name}</td>
                  <td>{months.find(m => m.value === r.month)?.label} {r.year}</td>
                  <td>{formatCurrency(r.base_salary)}</td>
                  <td>{formatCurrency(r.overtime_amount)}</td>
                  <td>{formatCurrency(r.bonus)}</td>
                  <td>{formatCurrency(r.deductions)}</td>
                  <td className="font-semibold text-emerald-600">{formatCurrency(r.net_salary)}</td>
                  <td><span className={`badge ${r.status === 'paid' ? 'badge-success' : r.status === 'processed' ? 'badge-warning' : 'badge-neutral'}`}>{r.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => viewPayslip(r)} className="text-primary-600">View</button>
                      <button onClick={() => handleEdit(r)} className="text-slate-600">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payroll.length === 0 && <div className="text-center py-8 text-slate-500">No records</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{editingPayroll ? 'Edit' : 'Add'} Payroll</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Employee *</label>
                    <select value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})} className="input" required>
                      <option value="">Select</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="input">
                      <option value="draft">Draft</option><option value="processed">Processed</option><option value="paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Month *</label>
                    <select value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} className="input" required>
                      <option value="">Select</option>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm font-medium mb-1">Year *</label>
                    <select value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="input" required>
                      <option value="">Select</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Base Salary</label><input type="number" value={formData.base_salary} onChange={(e) => setFormData({...formData, base_salary: e.target.value})} className="input" step="0.01" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">OT Hours</label><input type="number" value={formData.overtime_hours} onChange={(e) => setFormData({...formData, overtime_hours: e.target.value})} className="input" step="0.01" /></div>
                  <div><label className="block text-sm font-medium mb-1">OT Rate</label><input type="number" value={formData.overtime_rate} onChange={(e) => setFormData({...formData, overtime_rate: e.target.value})} className="input" step="0.01" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Bonus</label><input type="number" value={formData.bonus} onChange={(e) => setFormData({...formData, bonus: e.target.value})} className="input" step="0.01" /></div>
                  <div><label className="block text-sm font-medium mb-1">Deductions</label><input type="number" value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} className="input" step="0.01" /></div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingPayroll ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPayslip && selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Payslip</h2>
                <button onClick={() => setShowPayslip(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg">{selectedPayslip.employee?.first_name} {selectedPayslip.employee?.last_name}</h3>
                  <p className="text-sm text-slate-500">{selectedPayslip.employee?.position}</p>
                  <p className="text-sm text-slate-500">{months.find(m => m.value === selectedPayslip.month)?.label} {selectedPayslip.year}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-slate-600">Base Salary</span><span className="font-medium">{formatCurrency(selectedPayslip.base_salary)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Overtime ({selectedPayslip.overtime_hours} hrs)</span><span className="font-medium">{formatCurrency(selectedPayslip.overtime_amount)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Bonus</span><span className="font-medium">{formatCurrency(selectedPayslip.bonus)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Deductions</span><span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.deductions)}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">Gross Salary</span><span className="font-semibold">{formatCurrency(selectedPayslip.gross_salary)}</span></div>
                  <div className="flex justify-between text-lg font-bold"><span>Net Salary</span><span className="text-emerald-600">{formatCurrency(selectedPayslip.net_salary)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;