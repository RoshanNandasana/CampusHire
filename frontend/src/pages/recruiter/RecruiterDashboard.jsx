import React, { useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import {
  formatDate,
  getRecruiterApplications,
  getRecruiterRequests,
  getRecruiterScope,
  getScopedApplicationsForRecruiter,
  getScopedRequestsForRecruiter,
  getStatusClass,
  getStatusLabel,
} from './recruiterData';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const scope = useMemo(() => getRecruiterScope(user), [user]);

  const [allJobs] = useState(() => getRecruiterRequests());
  const [allApplications] = useState(() => getRecruiterApplications());

  const jobs = useMemo(
    () => getScopedRequestsForRecruiter(allJobs, scope),
    [allJobs, scope]
  );
  const applications = useMemo(
    () => getScopedApplicationsForRecruiter(allApplications, jobs, scope),
    [allApplications, jobs, scope]
  );

  const stats = useMemo(() => {
    const activeJobs = jobs.filter((job) => job.approvalStatus !== 'rejected').length;
    const totalApplicants = applications.length;
    const shortlisted = applications.filter((app) => app.status === 'shortlisted').length;
    const interviews = applications.filter((app) => app.status === 'interview').length;
    const offersMade = applications.filter((app) => app.status === 'offer').length;

    return {
      activeJobs,
      totalApplicants,
      shortlisted,
      interviews,
      offersMade,
    };
  }, [applications, jobs]);

  const visibleApplications = useMemo(() => {
    const filtered = applications
      .slice()
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    return filtered.slice(0, 6);
  }, [applications]);

  const upcomingRounds = useMemo(() => {
    const rows = applications
      .flatMap((app) =>
        (app.rounds || []).map((round) => ({
          appId: app.id,
          studentName: app.student.fullName,
          company: app.company,
          position: app.position,
          roundName: round.name,
          roundDate: round.date,
          roundTime: round.time,
          roundStatus: round.status,
        }))
      )
      .filter((round) => round.roundStatus !== 'completed')
      .sort((a, b) => new Date(a.roundDate).getTime() - new Date(b.roundDate).getTime());

    return rows.slice(0, 5);
  }, [applications]);

  return (
    <div className="recruiter-dashboard">
      <div className="header">
        <h1>Recruiter Dashboard</h1>
        <p>
          {scope.companyName} hiring view: jobs, applications, rounds, and student profile details.
        </p>
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
                <td>{app.student.fullName}</td>
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
            {upcomingRounds.map((round) => (
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
            {!upcomingRounds.length && (
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
