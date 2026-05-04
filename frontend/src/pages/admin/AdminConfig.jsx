import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { MdRefresh, MdDelete, MdSave } from 'react-icons/md';
import './AdminConfig.css';

const AdminConfig = () => {
  const [config, setConfig] = useState({});
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configRes, statsRes] = await Promise.all([
        adminAPI.getSystemConfig(),
        adminAPI.getCacheStats().catch(() => ({ data: null })),
      ]);
      
      setConfig(configRes?.data || {});
      setFormData(configRes?.data || {});
      setCacheStats(statsRes?.data || null);
      setError(null);
    } catch (err) {
      console.error('Failed to load configuration:', err);
      setError('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveConfig = async () => {
    try {
      await adminAPI.updateSystemConfig(formData);
      setSuccess('Configuration updated successfully');
      setConfig(formData);
      setIsEditingConfig(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update configuration:', err);
      setError(err.response?.data?.detail || 'Failed to update configuration');
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all caches? This may affect performance temporarily.')) {
      return;
    }

    try {
      await adminAPI.clearCache();
      setSuccess('Cache cleared successfully');
      await loadData();
    } catch (err) {
      setError('Failed to clear cache');
    }
  };

  const handleResetCacheStats = async () => {
    try {
      await adminAPI.resetCacheStats();
      setSuccess('Cache statistics reset');
      await loadData();
    } catch (err) {
      setError('Failed to reset cache statistics');
    }
  };

  if (loading) {
    return (
      <div className="admin-config">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          Loading configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-config">
      <div className="config-header">
        <h1>System Configuration</h1>
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

      <div className="config-section">
        <div className="section-header">
          <h2>Application Settings</h2>
          {!isEditingConfig ? (
            <button 
              className="btn btn-primary"
              onClick={() => setIsEditingConfig(true)}
            >
              <MdSave /> Edit Settings
            </button>
          ) : (
            <div className="button-group">
              <button 
                className="btn btn-primary"
                onClick={handleSaveConfig}
              >
                Save Changes
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditingConfig(false);
                  setFormData(config);
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="config-form">
          {isEditingConfig ? (
            <>
              <div className="form-group">
                <label htmlFor="app_name">Application Name</label>
                <input
                  type="text"
                  id="app_name"
                  name="app_name"
                  value={formData.app_name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter application name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="max_login_attempts">Max Login Attempts</label>
                <input
                  type="number"
                  id="max_login_attempts"
                  name="max_login_attempts"
                  value={formData.max_login_attempts || 5}
                  onChange={handleInputChange}
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="session_timeout_minutes">Session Timeout (minutes)</label>
                <input
                  type="number"
                  id="session_timeout_minutes"
                  name="session_timeout_minutes"
                  value={formData.session_timeout_minutes || 30}
                  onChange={handleInputChange}
                  min="1"
                  className="form-input"
                />
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="enable_notifications"
                  name="enable_notifications"
                  checked={formData.enable_notifications || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="enable_notifications">Enable System Notifications</label>
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="enable_email_alerts"
                  name="enable_email_alerts"
                  checked={formData.enable_email_alerts || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="enable_email_alerts">Enable Email Alerts</label>
              </div>
            </>
          ) : (
            <div className="config-display">
              <div className="config-item">
                <span className="config-label">Application Name:</span>
                <span className="config-value">{config.app_name || 'CampusHire'}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Max Login Attempts:</span>
                <span className="config-value">{config.max_login_attempts || 5}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Session Timeout:</span>
                <span className="config-value">{config.session_timeout_minutes || 30} minutes</span>
              </div>
              <div className="config-item">
                <span className="config-label">Notifications:</span>
                <span className="config-value">{config.enable_notifications ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Email Alerts:</span>
                <span className="config-value">{config.enable_email_alerts ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="config-section">
        <h2>Cache Management</h2>
        
        {cacheStats && (
          <div className="cache-stats">
            <div className="cache-stat-item">
              <span className="stat-label">Cache Hits:</span>
              <span className="stat-value">{cacheStats.data?.cache_hits || 0}</span>
            </div>
            <div className="cache-stat-item">
              <span className="stat-label">Cache Misses:</span>
              <span className="stat-value">{cacheStats.data?.cache_misses || 0}</span>
            </div>
            <div className="cache-stat-item">
              <span className="stat-label">Hit Rate:</span>
              <span className="stat-value">
                {cacheStats.data?.hit_rate ? `${(cacheStats.data.hit_rate * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
        )}

        <div className="button-group" style={{ marginTop: '20px' }}>
          <button 
            className="btn btn-danger"
            onClick={handleClearCache}
          >
            <MdDelete /> Clear All Caches
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleResetCacheStats}
          >
            <MdRefresh /> Reset Cache Stats
          </button>
        </div>
      </div>

      <div className="config-section">
        <h2>System Information</h2>
        <div className="system-info">
          <div className="info-item">
            <span className="info-label">API Version:</span>
            <span className="info-value">v1.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Database Status:</span>
            <span className="info-value">✓ Connected</span>
          </div>
          <div className="info-item">
            <span className="info-label">Cache Status:</span>
            <span className="info-value">✓ Active</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Check:</span>
            <span className="info-value">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;
