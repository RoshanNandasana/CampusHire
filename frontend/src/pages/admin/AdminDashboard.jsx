import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import Card from '../../components/common/Card';
import { MdPeople, MdFileOpen, MdLocationCity, MdEvent, MdAnalytics, MdSettings } from 'react-icons/md';
import './AdminDashboard.css';

const unwrapData = (response) => response?.data ?? response;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTPOs: 0,
    totalCompanies: 0,
    totalDepartments: 0,
    activeCycles: 0,
    totalStudents: 0,
    totalOffers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const [tpos, companies, depts, cycles, analytics] = await Promise.all([
          adminAPI.getTPOs(),
          adminAPI.getCompanies(),
          adminAPI.getDepartments(),
          adminAPI.getCycles(),
          adminAPI.getAnalytics(),
        ]);

        const tpoData = unwrapData(tpos);
        const companyData = unwrapData(companies);
        const deptData = unwrapData(depts);
        const cycleData = unwrapData(cycles);
        const analyticsData = unwrapData(analytics);

        const tpoCount = Array.isArray(tpoData) ? tpoData.length : 0;
        const companyCount = Array.isArray(companyData) ? companyData.length : 0;
        const deptCount = Array.isArray(deptData) ? deptData.length : 0;
        const cycleCount = Array.isArray(cycleData)
          ? cycleData.filter((c) => String(c.status || '').toLowerCase() === 'active').length
          : 0;

        setStats({
          totalTPOs: tpoCount,
          totalCompanies: companyCount,
          totalDepartments: deptCount,
          activeCycles: cycleCount,
          totalStudents: analyticsData.total_students || 0,
          totalOffers: analyticsData.total_placed || 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  const quickActions = [
    {
      title: 'Manage TPO Coordinators',
      description: 'Create and manage TPO coordinators',
      icon: MdPeople,
      path: '/admin/tpos',
      color: '#2196F3',
    },
    {
      title: 'Manage Companies',
      description: 'Create and manage company partners',
      icon: MdLocationCity,
      path: '/admin/companies',
      color: '#FF9800',
    },
    {
      title: 'Manage Departments',
      description: 'Create and manage departments',
      icon: MdFileOpen,
      path: '/admin/departments',
      color: '#4CAF50',
    },
    {
      title: 'Placement Cycles',
      description: 'Configure placement cycles',
      icon: MdEvent,
      path: '/admin/cycles',
      color: '#9C27B0',
    },
    {
      title: 'Analytics',
      description: 'View system analytics',
      icon: MdAnalytics,
      path: '/admin/analytics',
      color: '#F44336',
    },
    {
      title: 'System Config',
      description: 'Configure system settings',
      icon: MdSettings,
      path: '/admin/config',
      color: '#607D8B',
    },
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Super Admin Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back, {user?.name}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="dashboard-stats">
        <Card title="TPO Coordinators" icon={<MdPeople />}>
          <h3>{stats.totalTPOs}</h3>
        </Card>
        <Card title="Companies" icon={<MdLocationCity />}>
          <h3>{stats.totalCompanies}</h3>
        </Card>
        <Card title="Departments" icon={<MdFileOpen />}>
          <h3>{stats.totalDepartments}</h3>
        </Card>
        <Card title="Active Cycles" icon={<MdEvent />}>
          <h3>{stats.activeCycles}</h3>
        </Card>
        <Card title="Total Students" icon={<MdPeople />}>
          <h3>{stats.totalStudents}</h3>
        </Card>
        <Card title="Total Offers" icon={<MdFileOpen />}>
          <h3>{stats.totalOffers}</h3>
        </Card>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <a
                key={index}
                href={action.path}
                className="quick-action-card"
                style={{ '--accent-color': action.color }}
              >
                <div className="action-icon" style={{ color: action.color }}>
                  <Icon />
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>System Information</h2>
        <div className="system-info">
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">{user?.role?.toUpperCase()}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Login:</span>
            <span className="info-value">{user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
