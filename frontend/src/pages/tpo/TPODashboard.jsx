import React, { useState } from 'react';
import Card from '../../components/common/Card';
import './TPODashboard.css';

const TPODashboard = () => {
  const [stats] = useState({
    totalStudents: 485,
    totalApplications: 1250,
    placedStudents: 312,
    pendingPlacements: 173,
    placementRate: 64.3,
  });

  const [topRecruiters] = useState([
    { id: 1, name: 'Google', applicants: 145, placed: 32 },
    { id: 2, name: 'Microsoft', applicants: 128, placed: 28 },
    { id: 3, name: 'Amazon', applicants: 115, placed: 25 },
    { id: 4, name: 'TCS', applicants: 210, placed: 85 },
    { id: 5, name: 'Infosys', applicants: 180, placed: 75 },
  ]);

  const [branchStats] = useState([
    { branch: 'CSE', students: 180, placed: 125, rate: 69.4 },
    { branch: 'ECE', students: 120, placed: 70, rate: 58.3 },
    { branch: 'ME', students: 100, placed: 55, rate: 55.0 },
    { branch: 'CIVIL', students: 85, placed: 62, rate: 72.9 },
  ]);

  return (
    <div className="tpo-dashboard">
      <div className="dashboard-header">
        <h1>TPO Dashboard</h1>
        <p>Monitor college placement statistics and metrics</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <p>Total Students</p>
              <p className="stat-value">{stats.totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <p>Total Applications</p>
              <p className="stat-value">{stats.totalApplications}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🎉</div>
            <div className="stat-info">
              <p>Placed Students</p>
              <p className="stat-value">{stats.placedStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p>Pending Placements</p>
              <p className="stat-value">{stats.pendingPlacements}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <p>Placement Rate</p>
              <p className="stat-value">{stats.placementRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-content">
        <div className="section">
          <Card title="🏢 Top Recruiting Companies" className="card-shadow">
            <table className="table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Total Applicants</th>
                  <th>Students Placed</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {topRecruiters.map((recruiter) => (
                  <tr key={recruiter.id}>
                    <td>{recruiter.name}</td>
                    <td>{recruiter.applicants}</td>
                    <td>{recruiter.placed}</td>
                    <td>
                      <span className="badge badge-success">
                        {((recruiter.placed / recruiter.applicants) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="section">
          <Card title="Placement by Branch" className="card-shadow">
            <div className="branch-list">
              {branchStats.map((branch, index) => (
                <div key={index} className="branch-item">
                  <div className="branch-header">
                    <h4>{branch.branch}</h4>
                    <span className="rate-badge">
                      {branch.rate}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${branch.rate}%` }}
                    ></div>
                  </div>
                  <p className="branch-stats">
                    {branch.placed} / {branch.students} students placed
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="quick-actions mt-3">
        <Card title="⚡ Quick Actions" className="card-shadow">
          <div className="actions-grid">
            <button className="btn btn-primary">📊 View Analytics</button>
            <button className="btn btn-primary">👥 Manage Students</button>
            <button className="btn btn-primary">📝 View Jobs</button>
            <button className="btn btn-primary">⚙️ Set Rules</button>
            <button className="btn btn-primary">📧 Send Notification</button>
            <button className="btn btn-primary">📄 Generate Report</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TPODashboard;
