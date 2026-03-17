import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getEmployees } from '../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        getDepartments(),
        getEmployees()
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        manager_id: formData.manager_id || null
      };
      
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, data);
      } else {
        await createDepartment(data);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving department');
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      manager_id: department.manager_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting department');
      }
    }
  };

  const resetForm = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      manager_id: ''
    });
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
        <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn btn-primary"
        >
          + Add Department
        </button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(department => (
          <div key={department.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{department.name}</h3>
                <p className="text-sm text-slate-500">{department.description || 'No description'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(department)}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(department.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Manager</span>
                <span className="text-sm font-medium text-slate-700">
                  {department.manager ? `${department.manager.first_name} ${department.manager.last_name}` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Employees</span>
                <span className="text-sm font-medium text-primary-600">
                  {department.employee_count || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="card p-8 text-center text-slate-500">
          No departments found
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingDepartment ? 'Edit Department' : 'Add Department'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Manager
                  </label>
                  <select
                    value={formData.manager_id}
                    onChange={(e) => setFormData({...formData, manager_id: e.target.value})}
                    className="input"
                  >
                    <option value="">Select Manager</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
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
                    {editingDepartment ? 'Update' : 'Create'}
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

export default Departments;