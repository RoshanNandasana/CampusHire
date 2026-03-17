import React from 'react';
import Card from '../../components/common/Card';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
  const [stats] = React.useState({
    activeJobs: 5,
    totalApplicants: 324,
    shortlisted: 45,
    offersMade: 12,
  });

  const [recentApplications] = React.useState([
    { id: 1, name: 'Raj Kumar', position: 'SWE', status: 'shortlisted', appliedAt: '2024-02-09' },
    { id: 2, name: 'Priya Singh', position: 'SWE', status: 'applied', appliedAt: '2024-02-08' },
    { id: 3, name: 'Neha Verma', position: 'PM', status: 'interview', appliedAt: '2024-02-07' },
  ]);

  return (
    <div className="recruiter-dashboard">
      <div className="header">
        <h1>Recruiter Dashboard 🏢</h1>
        <p>Manage your job postings and applicants</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-box">
            <span className="stat-icon">📝</span>
            <div>
              <p className="stat-label">Active Jobs</p>
              <p className="stat-value">{stats.activeJobs}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-box">
            <span className="stat-icon">👥</span>
            <div>
              <p className="stat-label">Total Applicants</p>
              <p className="stat-value">{stats.totalApplicants}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-box">
            <span className="stat-icon">⭐</span>
            <div>
              <p className="stat-label">Shortlisted</p>
              <p className="stat-value">{stats.shortlisted}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-box">
            <span className="stat-icon">🎁</span>
            <div>
              <p className="stat-label">Offers Made</p>
              <p className="stat-value">{stats.offersMade}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="📋 Recent Applications" className="recent-applications">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Status</th>
              <th>Applied</th>
            </tr>
          </thead>
          <tbody>
            {recentApplications.map((app) => (
              <tr key={app.id}>
                <td>{app.name}</td>
                <td>{app.position}</td>
                <td>
                  <span className={`badge badge-${app.status}`}>{app.status}</span>
                </td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="quick-actions mt-3">
        <Card title="⚡ Quick Actions">
          <div className="action-buttons">
            <button className="btn btn-primary">➕ Post New Job</button>
            <button className="btn btn-primary">👥 View All Applicants</button>
            <button className="btn btn-primary">🎁 Manage Offers</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
