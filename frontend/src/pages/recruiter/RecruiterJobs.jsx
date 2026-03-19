import React, { useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { formatDate, getRecruiterApplications, getRecruiterRequests } from './recruiterData';
import './RecruiterJobs.css';

const RecruiterJobs = () => {
  const [jobs] = useState(() => getRecruiterRequests());
  const [applications] = useState(() => getRecruiterApplications());
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const metricsByJobId = useMemo(() => {
    return applications.reduce((acc, app) => {
      const key = String(app.jobRequestId);
      const previous = acc[key] || { total: 0, shortlisted: 0, interview: 0, offer: 0 };
      previous.total += 1;
      if (app.status === 'shortlisted') previous.shortlisted += 1;
      if (app.status === 'interview') previous.interview += 1;
      if (app.status === 'offer') previous.offer += 1;
      acc[key] = previous;
      return acc;
    }, {});
  }, [applications]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        job.company.toLowerCase().includes(query) ||
        job.position.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || job.approvalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  return (
    <div className="recruiter-jobs">
      <div className="header">
        <h1>My Job Postings</h1>
        <p>Track approval status, applicant volume, and round schedules for every role.</p>
      </div>

      <Card className="filter-card" title="Filters">
        <div className="filter-grid">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Company, role, location"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Approval Status</label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Active Jobs">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Title</th>
              <th>Status</th>
              <th>Applicants</th>
              <th>Shortlisted</th>
              <th>Drive Date</th>
              <th>Deadline</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => {
              const metrics = metricsByJobId[String(job.id)] || {
                total: 0,
                shortlisted: 0,
              };

              return (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.position}</td>
                <td>
                  <span className={`badge badge-${job.approvalStatus}`}>
                    {job.approvalStatus}
                  </span>
                </td>
                <td>{metrics.total}</td>
                <td><span className="badge badge-info">{metrics.shortlisted}</span></td>
                <td>{formatDate(job.driveDate)}</td>
                <td>{formatDate(job.deadline)}</td>
                <td>
                  <button className="btn btn-small btn-outlined" onClick={() => setSelectedJob(job)}>
                    View
                  </button>
                </td>
              </tr>
              );
            })}
            {!filteredJobs.length && (
              <tr>
                <td colSpan="8" className="empty-row">No jobs match current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        closeText="Close"
        title={selectedJob ? `${selectedJob.company} - ${selectedJob.position}` : ''}
      >
        {selectedJob && (
          <div className="job-detail">
            <div className="job-detail-grid">
              <div><strong>Openings:</strong> {selectedJob.openings}</div>
              <div><strong>Location:</strong> {selectedJob.location}</div>
              <div><strong>CTC:</strong> {selectedJob.ctc}</div>
              <div><strong>Min CGPA:</strong> {selectedJob.minCGPA}</div>
              <div><strong>Drive Date:</strong> {formatDate(selectedJob.driveDate)}</div>
              <div><strong>Deadline:</strong> {formatDate(selectedJob.deadline)}</div>
              <div><strong>Bond:</strong> {selectedJob.bondDurationMonths > 0 ? `${selectedJob.bondDurationMonths} months` : 'No bond'}</div>
              <div><strong>Contact:</strong> {selectedJob.contactName} ({selectedJob.contactEmail})</div>
            </div>

            <div className="detail-block">
              <h4>Description</h4>
              <p>{selectedJob.description}</p>
            </div>

            <div className="detail-block">
              <h4>Round Schedule</h4>
              <div className="round-list">
                {(selectedJob.roundSchedule || []).map((round) => (
                  <div key={round.id} className="round-item">
                    <span>{round.name}</span>
                    <span>{formatDate(round.date)}</span>
                    <span>{round.time || 'TBA'}</span>
                    <span>{round.mode}</span>
                  </div>
                ))}
                {!selectedJob.roundSchedule?.length && <p>No rounds configured.</p>}
              </div>
            </div>

            <div className="detail-block">
              <h4>Required Student Documents</h4>
              <div className="chip-row">
                {(selectedJob.requiredDocuments || []).map((doc) => (
                  <span key={doc} className="chip">{doc}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecruiterJobs;
