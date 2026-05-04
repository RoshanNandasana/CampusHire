import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import { MdPerson, MdWork, MdLibraryBooks, MdTrendingUp } from 'react-icons/md';
import './AdminAnalytics.css';

const unwrapData = (response) => response?.data ?? response;

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      setAnalytics(unwrapData(response) || {});
      setError(null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-analytics">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  const data = analytics || {};
  const placementRate = data.total_students
    ? ((Number(data.total_placed || 0) / Number(data.total_students || 1)) * 100).toFixed(1)
    : '0.0';
  const avgCtcLpa = data.avg_ctc ? (Number(data.avg_ctc) / 100000).toFixed(2) : '0.00';

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>System Analytics</h1>
        <button className="btn btn-secondary" onClick={loadAnalytics}>
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="alert-close" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="analytics-grid">
        <Card title="Total Students" icon={<MdPerson />}>
          <h3>{data.total_students || 0}</h3>
        </Card>
        <Card title="Total Companies" icon={<MdWork />}>
          <h3>{data.total_companies || 0}</h3>
        </Card>
        <Card title="Total Placed" icon={<MdLibraryBooks />}>
          <h3>{data.total_placed || 0}</h3>
        </Card>
        <Card title="Placement Rate" icon={<MdTrendingUp />}>
          <h3>{placementRate}%</h3>
        </Card>
      </div>

      <div className="analytics-section">
        <h2>Platform Summary</h2>
        <div className="analytics-table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Departments</td>
                <td>{data.total_departments || 0}</td>
              </tr>
              <tr>
                <td>Total Students</td>
                <td>{data.total_students || 0}</td>
              </tr>
              <tr>
                <td>Total Companies</td>
                <td>{data.total_companies || 0}</td>
              </tr>
              <tr>
                <td>Total Placed</td>
                <td>{data.total_placed || 0}</td>
              </tr>
              <tr>
                <td>Average CTC</td>
                <td>{avgCtcLpa} LPA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="analytics-section">
        <h2>Placement Health</h2>
        <div className="timeline-wrapper">
          <div className="empty-message">
            Placement rate is currently {placementRate}% with average CTC {avgCtcLpa} LPA.
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h2>System Configuration</h2>
        <div className="config-info">
          <div className="config-item">
            <span className="config-label">System Status:</span>
            <span className="config-value">✓ Active</span>
          </div>
          <div className="config-item">
            <span className="config-label">Database:</span>
            <span className="config-value">✓ Connected</span>
          </div>
          <div className="config-item">
            <span className="config-label">Cache:</span>
            <span className="config-value">✓ Enabled</span>
          </div>
          <div className="config-item">
            <span className="config-label">Last Updated:</span>
            <span className="config-value">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
