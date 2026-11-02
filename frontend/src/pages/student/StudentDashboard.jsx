import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import { studentAPI } from '../../services/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    applied: 0,
    pending: 0,
    rejected: 0,
    shortlisted: 0,
    upcomingTasks: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingPlacementTasks, setUpcomingPlacementTasks] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const displayName = useMemo(() => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Student';
  }, [user]);

  const todayISO = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const statusPillClass = (status) => {
    switch (status) {
      case 'applied':    return 'sdash-pill sdash-pill--blue';
      case 'pending':    return 'sdash-pill sdash-pill--amber';
      case 'shortlisted':return 'sdash-pill sdash-pill--violet';
      case 'rejected':   return 'sdash-pill sdash-pill--red';
      case 'offer':      return 'sdash-pill sdash-pill--green';
      default:           return 'sdash-pill sdash-pill--blue';
    }
  };

  const getTaskState = (taskDate) => {
    if (taskDate === todayISO) return { label: 'Today', cls: 'sdash-pill sdash-pill--amber' };
    if (taskDate > todayISO)   return { label: 'Scheduled', cls: 'sdash-pill sdash-pill--violet' };
    return { label: 'Completed', cls: 'sdash-pill sdash-pill--green' };
  };

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        setLoadError('');
        const response = await studentAPI.getDashboard();
        const data = response?.data;
        if (!isMounted || !data) return;

        setStats({
          applied:       Number(data?.stats?.applied       || 0),
          pending:       Number(data?.stats?.pending       || 0),
          rejected:      Number(data?.stats?.rejected      || 0),
          shortlisted:   Number(data?.stats?.shortlisted   || 0),
          upcomingTasks: Number(data?.stats?.upcomingTasks || 0),
        });
        setRecentApplications(Array.isArray(data?.recentApplications)     ? data.recentApplications     : []);
        setUpcomingPlacementTasks(Array.isArray(data?.upcomingPlacementTasks) ? data.upcomingPlacementTasks : []);
      } catch (error) {
        if (!isMounted) return;
        setStats({ applied: 0, pending: 0, rejected: 0, shortlisted: 0, upcomingTasks: 0 });
        setRecentApplications([]);
        setUpcomingPlacementTasks([]);
        setLoadError(error?.response?.data?.detail || 'Unable to load dashboard data right now.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => { isMounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statCards = [
    { label: 'Applied',        value: stats.applied,       tone: 'tone-blue',   icon: '📄' },
    { label: 'Pending',        value: stats.pending,       tone: 'tone-amber',  icon: '⏳' },
    { label: 'Rejected',       value: stats.rejected,      tone: 'tone-red',    icon: '✖' },
    { label: 'Shortlisted',    value: stats.shortlisted,   tone: 'tone-green',  icon: '✅' },
    { label: 'Upcoming Tasks', value: stats.upcomingTasks, tone: 'tone-violet', icon: '📅' },
  ];

  return (
    <div className="sdash">
      {/* ── Hero ── */}
      <section className="sdash-hero">
        <div>
          <span className="sdash-kicker">Student Dashboard</span>
          <h1>Welcome back, {displayName}</h1>
          <p>Track your applications, placement status, and upcoming tasks in one place.</p>
        </div>
      </section>

      {loadError  && <div className="sdash-alert sdash-alert--error">{loadError}</div>}
      {isLoading  && <div className="sdash-alert sdash-alert--info">Loading dashboard…</div>}

      {/* ── Stats ── */}
      <div className="sdash-stats-grid">
        {statCards.map(({ label, value, tone, icon }) => (
          <Card key={label} className={`sdash-stat-card ${tone}`}>
            <div className="sdash-stat-icon">{icon}</div>
            <p className="sdash-stat-label">{label}</p>
            <h3>{value}</h3>
          </Card>
        ))}
      </div>

      {/* ── Panels ── */}
      <div className="sdash-main-grid">
        {/* Recent Applications */}
        <Card title="Recent Applications" className="sdash-panel-card sdash-panel-card--blue">
          <div className="sdash-row-list">
            {recentApplications.length === 0 ? (
              <p className="sdash-empty">No applications yet. Browse Job Listings to get started.</p>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id} className="sdash-data-row">
                  <div>
                    <h4>{app.company}</h4>
                    <p>{app.position}</p>
                    <small>{new Date(app.appliedDate).toLocaleDateString()}</small>
                  </div>
                  <div className="sdash-row-right">
                    <span className={statusPillClass(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card title="Upcoming Placement Tasks" className="sdash-panel-card sdash-panel-card--violet">
          <p className="sdash-task-note">Notifications are sent on the scheduled task date.</p>
          <div className="sdash-row-list">
            {upcomingPlacementTasks.length === 0 ? (
              <p className="sdash-empty">No upcoming placement tasks at this time.</p>
            ) : (
              upcomingPlacementTasks.map((task) => {
                const notify = getTaskState(task.date);
                return (
                  <div key={task.id} className="sdash-data-row">
                    <div>
                      <h4>{task.company}</h4>
                      <p>{task.task}</p>
                      <small>{new Date(task.date).toLocaleDateString()} at {task.time}</small>
                    </div>
                    <div className="sdash-row-right">
                      <span className={notify.cls}>{notify.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
