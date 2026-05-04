import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import { MdAdd, MdCheckCircle, MdCancel } from 'react-icons/md';
import './ManageCycles.css';

const ManageCycles = () => {
  const [cycles, setCycles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [actionType, setActionType] = useState('create'); // create, edit, enroll
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [enrollData, setEnrollData] = useState({
    department_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cyclesRes, deptsRes] = await Promise.all([
        adminAPI.getCycles(),
        adminAPI.getDepartments(),
      ]);
      setCycles(Array.isArray(cyclesRes?.data) ? cyclesRes.data : []);
      setDepartments(Array.isArray(deptsRes?.data) ? deptsRes.data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load placement cycles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cycle = null, type = 'create') => {
    if (cycle && type === 'edit') {
      setEditingCycle(cycle);
      setFormData({
        name: cycle.name || '',
        start_date: cycle.start_date ? cycle.start_date.split('T')[0] : '',
        end_date: cycle.end_date ? cycle.end_date.split('T')[0] : '',
        description: cycle.description || '',
      });
    } else if (cycle && type === 'enroll') {
      setEditingCycle(cycle);
      setEnrollData({ department_id: '' });
    } else {
      setEditingCycle(null);
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
        description: '',
      });
    }
    setActionType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCycle(null);
    setActionType('create');
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
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

  const handleEnrollChange = (e) => {
    const { name, value } = e.target;
    setEnrollData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (actionType === 'create' || actionType === 'edit') {
        if (!formData.name || !formData.start_date || !formData.end_date) {
          setError('Please fill in all required fields');
          return;
        }

        if (editingCycle && actionType === 'edit') {
          await adminAPI.updateCycle(editingCycle.id, formData);
          setSuccess('Cycle updated successfully');
        } else {
          await adminAPI.createCycle(formData);
          setSuccess('Cycle created successfully');
        }
      } else if (actionType === 'enroll') {
        if (!enrollData.department_id) {
          setError('Please select a department');
          return;
        }
        await adminAPI.enrollDepartment(editingCycle.id, enrollData);
        setSuccess('Department enrolled successfully');
      }

      handleCloseModal();
      await loadData();
      setError(null);
    } catch (err) {
      console.error('Failed to perform action:', err);
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleActivate = async (cycle) => {
    if (!window.confirm(`Activate cycle "${cycle.name}"?`)) return;
    try {
      await adminAPI.activateCycle(cycle.id);
      setSuccess('Cycle activated successfully');
      await loadData();
    } catch (err) {
      setError('Failed to activate cycle');
    }
  };

  const handleClose = async (cycle) => {
    if (!window.confirm(`Close cycle "${cycle.name}"?`)) return;
    try {
      await adminAPI.closeCycle(cycle.id);
      setSuccess('Cycle closed successfully');
      await loadData();
    } catch (err) {
      setError('Failed to close cycle');
    }
  };

  const columns = [
    { key: 'name', label: 'Cycle Name', width: '200px' },
    { 
      key: 'status', 
      label: 'Status', 
      width: '120px',
      render: (value) => {
        const statusClass = value === 'active' ? 'status-active' : value === 'closed' ? 'status-closed' : 'status-planned';
        return <span className={`status-badge ${statusClass}`}>{value?.toUpperCase() || 'PLANNED'}</span>;
      }
    },
    { 
      key: 'start_date', 
      label: 'Start Date', 
      width: '150px',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'end_date', 
      label: 'End Date', 
      width: '150px',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'description', 
      label: 'Description', 
      width: '200px',
      render: (value) => value ? value.substring(0, 40) + (value.length > 40 ? '...' : '') : '-'
    },
  ];

  const getRowActions = (cycle) => (
    <div className="cycle-actions">
      <button 
        className="btn-sm btn-success" 
        onClick={() => handleActivate(cycle)}
        disabled={cycle.status === 'active'}
        title="Activate cycle"
      >
        <MdCheckCircle /> Activate
      </button>
      <button 
        className="btn-sm btn-secondary" 
        onClick={() => handleOpenModal(cycle, 'enroll')}
        title="Enroll department"
      >
        <MdAdd /> Enroll
      </button>
      <button 
        className="btn-sm btn-danger" 
        onClick={() => handleClose(cycle)}
        disabled={cycle.status === 'closed'}
        title="Close cycle"
      >
        <MdCancel /> Close
      </button>
    </div>
  );

  return (
    <div className="manage-cycles">
      <div className="manage-header">
        <h1>Manage Placement Cycles</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal(null, 'create')}>
          <MdAdd /> Create New Cycle
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
          data={cycles}
          loading={loading}
          onEdit={(cycle) => handleOpenModal(cycle, 'edit')}
          emptyMessage="No placement cycles found"
        />
        {cycles.map((cycle) => (
          <div key={cycle.id} className="cycle-custom-actions">
            {getRowActions(cycle)}
          </div>
        ))}
      </div>

      <AdminModal
        isOpen={isModalOpen}
        title={
          actionType === 'create' ? 'Create Placement Cycle' :
          actionType === 'edit' ? 'Edit Placement Cycle' :
          'Enroll Department'
        }
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        submitText={actionType === 'enroll' ? 'Enroll' : 'Save'}
      >
        {actionType === 'enroll' ? (
          <div className="form-group">
            <label htmlFor="department_id">Select Department *</label>
            <select
              id="department_id"
              name="department_id"
              value={enrollData.department_id}
              onChange={handleEnrollChange}
              className="form-input"
            >
              <option value="">-- Select a Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="name">Cycle Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., 2024 Placement Drive"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start_date">Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="end_date">End Date *</label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter cycle description"
                className="form-input"
                rows="4"
              />
            </div>
          </>
        )}
      </AdminModal>
    </div>
  );
};

export default ManageCycles;
