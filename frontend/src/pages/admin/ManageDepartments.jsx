import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import { MdAdd } from 'react-icons/md';
import './ManageDepartments.css';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    head: '',
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDepartments();
      setDepartments(Array.isArray(response?.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name || '',
        description: dept.description || '',
        code: dept.code || '',
        head: dept.head || '',
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        description: '',
        code: '',
        head: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      head: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        setError('Please enter department name');
        return;
      }

      if (editingDept) {
        await adminAPI.updateDepartment(editingDept.id, formData);
        setSuccess('Department updated successfully');
      } else {
        await adminAPI.createDepartment(formData);
        setSuccess('Department created successfully');
      }

      handleCloseModal();
      await loadDepartments();
      setError(null);
    } catch (err) {
      console.error('Failed to save department:', err);
      setError(err.response?.data?.detail || 'Failed to save department');
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete department ${dept.name}?`)) {
      return;
    }

    try {
      await adminAPI.deleteDepartment(dept.id);
      setSuccess('Department deleted successfully');
      await loadDepartments();
    } catch (err) {
      console.error('Failed to delete department:', err);
      setError('Failed to delete department. It may have associated data.');
    }
  };

  const columns = [
    { key: 'name', label: 'Department Name', width: '200px' },
    { key: 'code', label: 'Code', width: '120px' },
    { 
      key: 'description', 
      label: 'Description', 
      width: '250px',
      render: (value) => value ? value.substring(0, 60) + (value.length > 60 ? '...' : '') : '-'
    },
    { key: 'head', label: 'Department Head', width: '200px' },
    { 
      key: 'created_at', 
      label: 'Created', 
      width: '180px',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
  ];

  return (
    <div className="manage-departments">
      <div className="manage-header">
        <h1>Manage Departments</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <MdAdd /> Add New Department
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="alert-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button className="alert-close" onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}

      <div className="manage-content">
        <AdminTable
          columns={columns}
          data={departments}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No departments found"
        />
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitText={editingDept ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label htmlFor="name">Department Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Computer Science"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="code">Department Code</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., CSE"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="head">Department Head</label>
          <input
            type="text"
            id="head"
            name="head"
            value={formData.head}
            onChange={handleInputChange}
            placeholder="Enter department head name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter department description"
            className="form-input"
            rows="4"
          />
        </div>
      </AdminModal>
    </div>
  );
};

export default ManageDepartments;
