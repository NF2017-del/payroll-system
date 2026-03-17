import React, { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getDepartments } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    salary: '',
    hire_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        getEmployees(),
        getDepartments()
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      department_id: employee.department_id || '',
      position: employee.position || '',
      salary: employee.salary || '',
      hire_date: employee.hire_date || '',
      status: employee.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department_id: '',
      position: '',
      salary: '',
      hire_date: '',
      status: 'active'
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchTerm || 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || emp.department_id === parseInt(filterDepartment);
    const matchesStatus = !filterStatus || emp.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary"
        >
          + Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input max-w-xs"
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Position</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </td>
                  <td>{employee.email}</td>
                  <td>{employee.phone || '-'}</td>
                  <td>{employee.position || '-'}</td>
                  <td>{employee.department?.name || '-'}</td>
                  <td>{formatCurrency(employee.salary)}</td>
                  <td>{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`badge ${
                      employee.status === 'active' ? 'badge-success' : 
                      employee.status === 'inactive' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No employees found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                      className="input"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Salary
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      className="input"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Hire Date
                    </label>
                    <input
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;