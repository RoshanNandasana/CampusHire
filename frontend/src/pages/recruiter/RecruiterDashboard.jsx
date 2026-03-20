import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { recruiterAPI } from '../../services/api';
import { formatDate, getStatusClass, getStatusLabel } from './recruiterData';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    interviews: 0,
    offersMade: 0,
  });
  const [applications, setApplications] = useState([]);
  const [upcomingRounds, setUpcomingRounds] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const response = await recruiterAPI.getDashboard();
        const data = response?.data || {};
        if (!isMounted) return;

        setStats({
          activeJobs: data?.stats?.activeJobs || 0,
          totalApplicants: data?.stats?.totalApplicants || 0,
          shortlisted: data?.stats?.shortlisted || 0,
          interviews: data?.stats?.interviews || 0,
          offersMade: data?.stats?.offersMade || 0,
        });
        setApplications(Array.isArray(data.recentApplications) ? data.recentApplications : []);
        setUpcomingRounds(Array.isArray(data.upcomingRounds) ? data.upcomingRounds : []);
      } catch (error) {
        if (!isMounted) return;
        setStats({ activeJobs: 0, totalApplicants: 0, shortlisted: 0, interviews: 0, offersMade: 0 });
        setApplications([]);
        setUpcomingRounds([]);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleApplications = useMemo(() => {
    const filtered = applications
      .slice()
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    return filtered.slice(0, 6);
  }, [applications]);

  const normalizedRounds = useMemo(
    () =>
      upcomingRounds.map((round, index) => ({
        appId: round.appId || index,
        studentName: round.studentName || 'Student',
        company: round.company || '-',
        roundName: round.roundName || 'Round',
        roundDate: round.roundDate || '',
        roundTime: round.roundTime || '',
      })),
    [upcomingRounds]
  );

  return (
    <div className="recruiter-dashboard">
      <div className="header">
        <h1>Recruiter Dashboard</h1>
        <p>Company hiring view: jobs, applications, rounds, and student profile details.</p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card tone-blue">
          <p className="stat-label">Active Jobs</p>
          <p className="stat-value">{stats.activeJobs}</p>
        </Card>

        <Card className="stat-card tone-green">
          <p className="stat-label">Total Applicants</p>
          <p className="stat-value">{stats.totalApplicants}</p>
        </Card>

        <Card className="stat-card tone-orange">
          <p className="stat-label">Shortlisted</p>
          <p className="stat-value">{stats.shortlisted}</p>
        </Card>

        <Card className="stat-card tone-violet">
          <p className="stat-label">Interviews</p>
          <p className="stat-value">{stats.interviews}</p>
        </Card>

        <Card className="stat-card tone-cyan">
          <p className="stat-label">Offers Made</p>
          <p className="stat-value">{stats.offersMade}</p>
        </Card>
      </div>

      <Card title="Recent Applications" className="recent-applications">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {visibleApplications.map((app) => (
              <tr key={app.id}>
                <td>{app.student?.fullName || app.studentName || '-'}</td>
                <td>{app.company}</td>
                <td>{app.position}</td>
                <td>
                  <span className={`badge ${getStatusClass(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </td>
                <td>{formatDate(app.appliedAt)}</td>
                <td>{app.result}</td>
              </tr>
            ))}
            {!visibleApplications.length && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No applications for selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="dashboard-grid mt-3">
        <Card title="Upcoming Rounds" className="panel-card">
          <div className="round-list">
            {normalizedRounds.map((round) => (
              <div key={`${round.appId}-${round.roundName}`} className="round-item">
                <div>
                  <p className="round-title">{round.roundName}</p>
                  <p className="round-subtitle">
                    {round.studentName} • {round.company}
                  </p>
                </div>
                <div className="round-meta">
                  <span>{formatDate(round.roundDate)}</span>
                  <span>{round.roundTime || 'TBA'}</span>
                </div>
              </div>
            ))}
            {!normalizedRounds.length && (
              <p className="empty-text">No pending rounds.</p>
            )}
          </div>
        </Card>

        <Card title="Recruiter Actions" className="panel-card">
          <div className="action-buttons">
            <a className="btn btn-primary" href="/recruiter/post-job">Post New Job</a>
            <a className="btn btn-primary" href="/recruiter/applicants">Review Applicants</a>
            <a className="btn btn-primary" href="/recruiter/offers">Release Offers</a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
