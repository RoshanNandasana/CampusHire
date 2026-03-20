import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { studentAPI } from '../../services/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    applied: 18,
    pending: 6,
    rejected: 4,
    shortlisted: 8,
    upcomingTasks: 5,
  });

  const [recentApplications, setRecentApplications] = useState([
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer',
      status: 'shortlisted',
      appliedDate: '2026-03-10',
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Product Manager',
      status: 'pending',
      appliedDate: '2026-03-08',
    },
    {
      id: 3,
      company: 'Amazon',
      position: 'Data Engineer',
      status: 'rejected',
      appliedDate: '2026-03-04',
    },
    {
      id: 4,
      company: 'TCS',
      position: 'Systems Engineer',
      status: 'applied',
      appliedDate: '2026-03-13',
    },
  ]);

  const [upcomingPlacementTasks, setUpcomingPlacementTasks] = useState([
    {
      id: 1,
      company: 'Infosys',
      task: 'Aptitude Test',
      date: '2026-03-20',
      time: '10:00 AM',
    },
    {
      id: 2,
      company: 'Wipro',
      task: 'Coding Round',
      date: '2026-03-22',
      time: '09:30 AM',
    },
    {
      id: 3,
      company: 'Accenture',
      task: 'Technical Interview',
      date: '2026-03-24',
      time: '02:00 PM',
    },
    {
      id: 4,
      company: 'Cognizant',
      task: 'HR Round',
      date: '2026-03-26',
      time: '11:00 AM',
    },
    {
      id: 5,
      company: 'Capgemini',
      task: 'Group Discussion',
      date: '2026-03-28',
      time: '03:00 PM',
    },
  ]);

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'applied':
        return 'badge badge-info';
      case 'pending':
        return 'badge badge-warning';
      case 'shortlisted':
        return 'badge badge-success';
      case 'rejected':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  const todayISO = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const getNotificationState = (taskDate) => {
    if (taskDate === todayISO) {
      return { label: 'Notification Sent Today', className: 'notify today' };
    }
    if (taskDate > todayISO) {
      return { label: 'Notification Scheduled', className: 'notify scheduled' };
    }
    return { label: 'Task Completed', className: 'notify completed' };
  };

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        const response = await studentAPI.getDashboard();
        const data = response?.data;
        if (!isMounted || !data) return;

        setStats((prev) => ({ ...prev, ...(data.stats || {}) }));
        if (Array.isArray(data.recentApplications) && data.recentApplications.length > 0) {
          setRecentApplications(data.recentApplications);
        }
        if (Array.isArray(data.upcomingPlacementTasks)) {
          setUpcomingPlacementTasks(data.upcomingPlacementTasks);
        }
      } catch (error) {
        // Keep existing UI data as fallback.
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="student-dashboard">
      <section className="student-hero-panel simple-hero">
        <div>
          <span className="hero-kicker">Placement Dashboard</span>
          <h1>Welcome back, Student</h1>
          <p>Simple placement tracking for applications, status, and upcoming tasks.</p>
        </div>
      </section>

      <div className="stats-grid simple-stats-grid">
        <Card className="stat-card stat-blue">
          <div className="stat-content">
            <div className="stat-icon">📄</div>
            <div className="stat-info">
              <p className="stat-label">Applied</p>
              <p className="stat-value">{stats.applied}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-yellow">
          <div className="stat-content">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-red">
          <div className="stat-content">
            <div className="stat-icon">✖</div>
            <div className="stat-info">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{stats.rejected}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-green">
          <div className="stat-content">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p className="stat-label">Shortlisted</p>
              <p className="stat-value">{stats.shortlisted}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-purple">
          <div className="stat-content">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <p className="stat-label">Upcoming Tasks</p>
              <p className="stat-value">{stats.upcomingTasks}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content simple-dashboard-content">
        <div className="section">
          <Card title="Recent Applications" className="card-shadow">
            <div className="applications-list">
              {recentApplications.map((app) => (
                <div key={app.id} className="application-row">
                  <div>
                    <h4>{app.company}</h4>
                    <p>{app.position}</p>
                  </div>
                  <div className="application-meta">
                    <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                    <span className={statusBadgeClass(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="section">
          <Card title="Upcoming Placement Tasks" className="card-shadow">
            <p className="task-note">Notifications are sent on the scheduled task date.</p>
            <div className="tasks-list">
              {upcomingPlacementTasks.map((task) => {
                const notify = getNotificationState(task.date);
                return (
                  <div key={task.id} className="task-row">
                    <div>
                      <h4>{task.company}</h4>
                      <p>{task.task}</p>
                      <small>
                        {new Date(task.date).toLocaleDateString()} at {task.time}
                      </small>
                    </div>
                    <span className={notify.className}>{notify.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
