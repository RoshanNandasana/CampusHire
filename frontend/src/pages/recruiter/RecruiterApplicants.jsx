import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { recruiterAPI } from '../../services/api';
import {
  formatDate,
  formatDateTime,
  getStatusClass,
  getStatusLabel,
} from './recruiterData';
import './RecruiterApplicants.css';

const RecruiterApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    jobId: 'all',
    status: 'all',
    minCgpa: '',
    branch: 'all',
  });

  const jobOptions = useMemo(() => {
    return jobs.map((job) => ({ value: String(job.id), label: `${job.company} - ${job.position}` }));
  }, [jobs]);

  const branchOptions = useMemo(() => {
    const unique = [...new Set(applications.map((app) => app.student.branch))];
    return unique;
  }, [applications]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [jobsResponse, appsResponse] = await Promise.all([
          recruiterAPI.getJobs(),
          recruiterAPI.getApplicants(),
        ]);
        if (!isMounted) return;
        setJobs(Array.isArray(jobsResponse?.data?.jobs) ? jobsResponse.data.jobs : []);
        setApplications(Array.isArray(appsResponse?.data?.applications) ? appsResponse.data.applications : []);
      } catch (error) {
        if (!isMounted) return;
        setJobs([]);
        setApplications([]);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const query = filters.search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        app.student.fullName.toLowerCase().includes(query) ||
        app.student.enrollmentNo.toLowerCase().includes(query) ||
        app.company.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query);

      const matchesJob = filters.jobId === 'all' || String(app.jobRequestId) === filters.jobId;
      const matchesStatus = filters.status === 'all' || app.status === filters.status;
      const matchesCgpa = !filters.minCgpa || Number(app.student.cgpa) >= Number(filters.minCgpa);
      const matchesBranch = filters.branch === 'all' || app.student.branch === filters.branch;

      return matchesSearch && matchesJob && matchesStatus && matchesCgpa && matchesBranch;
    });
  }, [applications, filters]);

  const handleStatusChange = async (applicationId, status) => {
    try {
      await recruiterAPI.updateApplicationStatus(applicationId, status);
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== applicationId) return app;
          return {
            ...app,
            status,
            result:
              status === 'offer'
                ? 'Offer released'
                : status === 'interview'
                  ? 'Interview in progress'
                  : status === 'shortlisted'
                    ? 'Shortlisted for next round'
                    : status === 'rejected'
                      ? 'Not selected for further rounds'
                      : 'Application received',
          };
        })
      );
    } catch (error) {
      // Ignore and preserve current UI state when update fails.
    }
  };

  const handleContactStudent = (applicant) => {
    const email = applicant.student.email;
    const subject = encodeURIComponent(`Campus Hiring Update: ${applicant.company} - ${applicant.position}`);
    const body = encodeURIComponent(
      `Hi ${applicant.student.fullName},\n\nThis is regarding your application (${applicant.id}) for ${applicant.position} at ${applicant.company}.\n\nRegards,\n${applicant.company} Recruitment Team`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');

    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicant.id ? { ...app, contactedAt: new Date().toISOString() } : app
      )
    );
  };

  return (
    <div className="recruiter-applicants">
      <div className="header">
        <h1>Manage Applicants</h1>
        <p>Review full student profiles, application snapshots, results, and contact details.</p>
      </div>

      <Card title="Filters" className="filter-card">
        <div className="filter-grid">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Name, enrollment, company, role"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Job</label>
            <select
              className="form-input"
              value={filters.jobId}
              onChange={(event) => setFilters((prev) => ({ ...prev, jobId: event.target.value }))}
            >
              <option value="all">All Jobs</option>
              {jobOptions.map((job) => (
                <option key={job.value} value={job.value}>{job.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="all">All</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="form-group">
            <label>Minimum CGPA</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              className="form-input"
              value={filters.minCgpa}
              onChange={(event) => setFilters((prev) => ({ ...prev, minCgpa: event.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Branch</label>
            <select
              className="form-input"
              value={filters.branch}
              onChange={(event) => setFilters((prev) => ({ ...prev, branch: event.target.value }))}
            >
              <option value="all">All Branches</option>
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Applicants">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Enrollment</th>
              <th>Company</th>
              <th>Position</th>
              <th>CGPA</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Result</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map((app) => (
              <tr key={app.id}>
                <td>{app.student.fullName}</td>
                <td>{app.student.enrollmentNo}</td>
                <td>{app.company}</td>
                <td>{app.position}</td>
                <td>{app.student.cgpa}</td>
                <td><span className={`badge ${getStatusClass(app.status)}`}>{getStatusLabel(app.status)}</span></td>
                <td>{formatDate(app.appliedAt)}</td>
                <td>{app.result}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-small btn-outlined" onClick={() => setSelectedApplicant(app)}>View</button>
                    <select
                      className="status-select"
                      value={app.status}
                      onChange={(event) => handleStatusChange(app.id, event.target.value)}
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredApplicants.length && (
              <tr>
                <td colSpan="9" className="empty-row">No applicants match current filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        closeText="Close"
        title={selectedApplicant ? `${selectedApplicant.student.fullName} - ${selectedApplicant.position}` : ''}
      >
        {selectedApplicant && (
          <div className="applicant-detail">
            <div className="detail-grid">
              <div><strong>Application ID:</strong> {selectedApplicant.id}</div>
              <div><strong>Company:</strong> {selectedApplicant.company}</div>
              <div><strong>Position:</strong> {selectedApplicant.position}</div>
              <div><strong>Status:</strong> {getStatusLabel(selectedApplicant.status)}</div>
              <div><strong>Result:</strong> {selectedApplicant.result}</div>
              <div><strong>Applied On:</strong> {formatDate(selectedApplicant.appliedAt)}</div>
              <div><strong>Last Contacted:</strong> {formatDateTime(selectedApplicant.contactedAt)}</div>
              <div><strong>Branch:</strong> {selectedApplicant.student.branch}</div>
              <div><strong>Year:</strong> {selectedApplicant.student.year}</div>
              <div><strong>CGPA:</strong> {selectedApplicant.student.cgpa}</div>
              <div><strong>Email:</strong> {selectedApplicant.student.email}</div>
              <div><strong>Phone:</strong> {selectedApplicant.student.phone}</div>
            </div>

            <div className="detail-block">
              <h4>Academics (submitted during application)</h4>
              <div className="detail-grid">
                <div><strong>10th:</strong> {selectedApplicant.academics.tenth}</div>
                <div><strong>12th:</strong> {selectedApplicant.academics.twelfth}</div>
                <div><strong>Graduation:</strong> {selectedApplicant.academics.graduation}</div>
                <div><strong>Active Backlogs:</strong> {selectedApplicant.academics.activeBacklogs}</div>
              </div>
            </div>

            <div className="detail-block">
              <h4>Uploaded Documents</h4>
              <div className="doc-list">
                {selectedApplicant.documents.map((doc) => (
                  <div key={doc.name} className="doc-item">
                    <span>{doc.name}</span>
                    <span>{doc.fileName}</span>
                    <span className={`badge ${doc.status === 'verified' ? 'badge-offer' : 'badge-pending'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <h4>Round Tracking (date and round wise)</h4>
              <div className="round-list">
                {selectedApplicant.rounds.map((round) => (
                  <div key={`${selectedApplicant.id}-${round.name}`} className="round-item">
                    <span>{round.name}</span>
                    <span>{formatDate(round.date)}</span>
                    <span>{round.time || 'TBA'}</span>
                    <span>{round.mode}</span>
                    <span>{round.status}</span>
                    <span>{round.feedback || 'No feedback yet'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <h4>Student Notes</h4>
              <p>{selectedApplicant.notes}</p>
            </div>

            <div className="detail-actions">
              <button className="btn" onClick={() => handleContactStudent(selectedApplicant)}>Contact Student</button>
              <a className="btn btn-outlined" href={selectedApplicant.student.links.linkedin} target="_blank" rel="noreferrer">
                Open LinkedIn
              </a>
              <a className="btn btn-outlined" href={selectedApplicant.student.links.github} target="_blank" rel="noreferrer">
                Open GitHub
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecruiterApplicants;
