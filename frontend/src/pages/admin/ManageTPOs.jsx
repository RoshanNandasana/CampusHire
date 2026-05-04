import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import { MdAdd } from 'react-icons/md';
import './ManageTPOs.css';

const getErrorMessage = (err, fallback) => {
  const detail = err?.response?.data?.detail;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.msg || item.message || item.detail || JSON.stringify(item);
        }
        return null;
      })
      .filter(Boolean)
      .join(', ');
  }

  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || detail.detail || fallback;
  }

  return err?.message || fallback;
};

const ManageTPOs = () => {
  const [tpos, setTpos] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTPO, setEditingTPO] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department_id: '',
    password: '',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tpoResponse, deptResponse] = await Promise.all([
        adminAPI.getTPOs(),
        adminAPI.getDepartments(),
      ]);

      const tpoData = tpoResponse?.data ?? tpoResponse;
      const deptData = deptResponse?.data ?? deptResponse;
      setTpos(Array.isArray(tpoData) ? tpoData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setError(null);
    } catch (err) {
      console.error('Failed to load initial admin data:', err);
      setError('Failed to load TPO data');
    } finally {
      setLoading(false);
    }
  };

  const loadTPOs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTPOs();
      const data = response?.data ?? response;
      setTpos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to load TPOs:', err);
      setError('Failed to load TPO coordinators');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tpo = null) => {
    if (tpo) {
      setEditingTPO(tpo);
      setFormData({
        name: tpo.name || '',
        email: tpo.email || '',
        department_id: tpo.department_id || '',
        password: '',
      });
    } else {
      setEditingTPO(null);
      setFormData({
        name: '',
        email: '',
        department_id: '',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTPO(null);
    setFormData({
      name: '',
      email: '',
      department_id: '',
      password: '',
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
      if (!formData.name || !formData.email || !formData.department_id) {
        setError('Please fill in all required fields');
        return;
      }

      if (!editingTPO && !formData.password) {
        setError('Password is required while creating a TPO coordinator');
        return;
      }

      if (formData.password && formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (editingTPO) {
        const payload = {
          name: formData.name,
          department_id: formData.department_id,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await adminAPI.updateTPO(editingTPO.id, payload);
        setSuccess('TPO coordinator updated successfully');
      } else {
        await adminAPI.createTPO({
          name: formData.name,
          email: formData.email,
          department_id: formData.department_id,
          password: formData.password,
        });
        setSuccess('TPO coordinator created successfully');
      }

      handleCloseModal();
      await loadTPOs();
      setError(null);
    } catch (err) {
      console.error('Failed to save TPO:', err);
      setError(getErrorMessage(err, 'Failed to save TPO coordinator'));
    }
  };

  const handleDelete = async (tpo) => {
    if (!window.confirm(`Are you sure you want to delete TPO coordinator ${tpo.name}?`)) {
      return;
    }

    try {
      // Since there's no delete endpoint for TPO, we'll deactivate the user instead
      if (tpo.user_id) {
        await adminAPI.deactivateUser(tpo.user_id);
        setSuccess('TPO coordinator deactivated successfully');
        await loadTPOs();
      }
    } catch (err) {
      console.error('Failed to delete TPO:', err);
      setError('Failed to delete TPO coordinator');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', width: '200px' },
    { 
      key: 'email', 
      label: 'Email', 
      width: '250px',
      render: (value) => <a href={`mailto:${value}`}>{value}</a>
    },
    {
      key: 'department_id',
      label: 'Department',
      width: '220px',
      render: (value) => {
        const dept = departments.find((item) => String(item.id) === String(value));
        return dept?.name || value || '-';
      },
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      width: '180px',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
  ];

  return (
    <div className="manage-tpos">
      <div className="manage-header">
        <h1>Manage TPO Coordinators</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <MdAdd /> Add New TPO
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
          data={tpos}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No TPO coordinators found"
        />
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingTPO ? 'Edit TPO Coordinator' : 'Add New TPO Coordinator'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitText={editingTPO ? 'Update' : 'Create'}
      >
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter TPO name"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            className="form-input"
            disabled={editingTPO} // Email shouldn't be changed
          />
        </div>

        <div className="form-group">
          <label htmlFor="department_id">Department *</label>
          <select
            id="department_id"
            name="department_id"
            value={formData.department_id}
            onChange={handleInputChange}
            className="form-input"
          >
            <option value="">Select department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="password">{editingTPO ? 'Password (optional)' : 'Password *'}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={editingTPO ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
            className="form-input"
          />
        </div>
      </AdminModal>
    </div>
  );
};

export default ManageTPOs;
