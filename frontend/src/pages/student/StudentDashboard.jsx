import React, { useState } from 'react';
import Card from '../../components/common/Card';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [stats] = useState({
    profileCompletion: 75,
    placementReadiness: 68,
    appliedJobs: 12,
    upcomingDrives: 3,
    shortlisted: 2,
    interviews: 1,
  });

  const [recentApplications] = useState([
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer',
      status: 'shortlisted',
      appliedDate: '2024-01-15',
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Product Manager',
      status: 'applied',
      appliedDate: '2024-01-10',
    },
    {
      id: 3,
      company: 'Amazon',
      position: 'Data Engineer',
      status: 'interview',
      appliedDate: '2024-01-05',
    },
  ]);

  const [upcomingDrives] = useState([
    {
      id: 1,
      company: 'TCS',
      date: '2024-02-15',
      minCGPA: 7.0,
      position: 'Systems Engineer',
    },
    {
      id: 2,
      company: 'Infosys',
      date: '2024-02-20',
      minCGPA: 6.5,
      position: 'Software Developer',
    },
    {
      id: 3,
      company: 'Wipro',
      date: '2024-03-01',
      minCGPA: 6.0,
      position: 'IT Professional',
    },
  ]);

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'applied':
        return 'badge badge-info';
      case 'shortlisted':
        return 'badge badge-warning';
      case 'interview':
        return 'badge badge-info';
      case 'offer':
        return 'badge badge-success';
      default:
        return 'badge badge-secondary';
    }
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, Student! 👋</h1>
        <p>Track your placement journey and stay updated</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card highlighted">
          <div className="stat-content">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <p className="stat-label">Profile Complete</p>
              <p className="stat-value">{stats.profileCompletion}%</p>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.profileCompletion}%` }}
            ></div>
          </div>
        </Card>

        <Card className="stat-card highlighted">
          <div className="stat-content">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <p className="stat-label">Readiness Score</p>
              <p className="stat-value">{stats.placementReadiness}%</p>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.placementReadiness}%` }}
            ></div>
          </div>
        </Card>

        <Card className="stat-card highlighted">
          <div className="stat-content">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <p className="stat-label">Applications</p>
              <p className="stat-value">{stats.appliedJobs}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card highlighted">
          <div className="stat-content">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <p className="stat-label">Upcoming Drives</p>
              <p className="stat-value">{stats.upcomingDrives}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <Card title="📊 Recent Applications" className="card-shadow">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.company}</td>
                    <td>{app.position}</td>
                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <span className={statusBadgeClass(app.status)}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="section">
          <Card title="🚀 Upcoming Placement Drives" className="card-shadow">
            <div className="drives-list">
              {upcomingDrives.map((drive) => (
                <div key={drive.id} className="drive-card">
                  <div className="drive-header">
                    <h4>{drive.company}</h4>
                    <span className="badge badge-info">
                      {new Date(drive.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="drive-position">{drive.position}</p>
                  <div className="drive-requirements">
                    <span className="requirement">
                      Min CGPA: <strong>{drive.minCGPA}</strong>
                    </span>
                  </div>
                  <button className="btn btn-primary btn-small mt-2">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
