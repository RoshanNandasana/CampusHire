import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import { MdAdd } from 'react-icons/md';
import './ManageCompanies.css';

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

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCompanies();
      const data = response?.data ?? response;
      setCompanies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name || '',
        email: company.email || '',
        password: '',
        website: company.website || '',
        description: company.description || '',
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        website: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      website: '',
      description: '',
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
      if (!formData.name || !formData.email) {
        setError('Please fill in all required fields');
        return;
      }

      if (!editingCompany && !formData.password) {
        setError('Password is required while creating a company');
        return;
      }

      if (formData.password && formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (editingCompany) {
        const payload = {
          name: formData.name,
          website: formData.website,
          description: formData.description,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await adminAPI.updateCompany(editingCompany.id, payload);
        setSuccess('Company updated successfully');
      } else {
        await adminAPI.createCompany({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          website: formData.website,
          description: formData.description,
        });
        setSuccess('Company created successfully');
      }

      handleCloseModal();
      await loadCompanies();
      setError(null);
    } catch (err) {
      console.error('Failed to save company:', err);
      setError(getErrorMessage(err, 'Failed to save company'));
    }
  };

  const handleDelete = async (company) => {
    if (!window.confirm(`Are you sure you want to delete company ${company.name}?`)) {
      return;
    }

    try {
      if (company.user_id) {
        await adminAPI.deactivateUser(company.user_id);
        setSuccess('Company deactivated successfully');
        await loadCompanies();
      }
    } catch (err) {
      console.error('Failed to delete company:', err);
      setError('Failed to delete company');
    }
  };

  const columns = [
    { key: 'name', label: 'Company Name', width: '200px' },
    { 
      key: 'email', 
      label: 'Email', 
      width: '250px',
      render: (value) => <a href={`mailto:${value}`}>{value}</a>
    },
    { 
      key: 'website', 
      label: 'Website', 
      width: '200px',
      render: (value) => value ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a> : '-'
    },
    { 
      key: 'description', 
      label: 'Description', 
      width: '250px',
      render: (value) => value ? value.substring(0, 60) + (value.length > 60 ? '...' : '') : '-'
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      width: '180px',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
  ];

  return (
    <div className="manage-companies">
      <div className="manage-header">
        <h1>Manage Companies</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <MdAdd /> Add New Company
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
          data={companies}
          loading={loading}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          emptyMessage="No companies found"
        />
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitText={editingCompany ? 'Update' : 'Create'}
        size="large"
      >
        <div className="form-group">
          <label htmlFor="name">Company Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter company name"
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
            disabled={editingCompany}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{editingCompany ? 'Password (optional)' : 'Password *'}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={editingCompany ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website URL</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://example.com"
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
            placeholder="Enter company description"
            className="form-input"
            rows="4"
          />
        </div>
      </AdminModal>
    </div>
  );
};

export default ManageCompanies;
