import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { tpoAPI } from '../../services/api';
import { extractArray, getApiErrorMessage } from './tpoUtils';
import './TPOJobs.css';
const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'approved') return 'status-approved';
  if (normalized === 'rejected') return 'status-rejected';
  return 'status-pending';
};

const TPOJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    setFeedbackMessage('');
    try {
      const response = await tpoAPI.getJobs();
      const items = extractArray(response, ['jobs']);
      setJobs(items);
    } catch (error) {
      setJobs([]);
      setFeedbackMessage(getApiErrorMessage(error, 'Unable to load jobs right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const stats = useMemo(() => {
    const approved = jobs.filter((job) => String(job.approval_status || '').toLowerCase() === 'approved').length;
    const pending = jobs.filter((job) => String(job.approval_status || '').toLowerCase() === 'pending').length;
    const rejected = jobs.filter((job) => String(job.approval_status || '').toLowerCase() === 'rejected').length;

    return {
      totalRequests: jobs.length,
      approved,
      pending,
      rejected,
    };
  }, [jobs]);

  const filteredRequests = useMemo(() => {
    return jobs.filter((request) => {
      const searchQuery = search.trim().toLowerCase();
      const matchesSearch =
        !searchQuery ||
        request.company?.name?.toLowerCase().includes(searchQuery) ||
        request.title?.toLowerCase().includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all' || String(request.approval_status || '').toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleApprovalChange = async (jobId, newStatus) => {
    try {
      await tpoAPI.updateJobApproval(jobId, String(newStatus).toUpperCase());
      setJobs((prev) =>
        prev.map((job) =>
          String(job.id) === String(jobId)
            ? { ...job, approval_status: String(newStatus).toUpperCase() }
            : job
        )
      );
      setFeedbackMessage(
        String(newStatus).toLowerCase() === 'approved'
          ? 'Job approved. It is now visible in student jobs.'
          : 'Job status updated successfully.'
      );
    } catch (error) {
      setFeedbackMessage(getApiErrorMessage(error, 'Unable to update job status right now.'));
    }
  };

  return (
    <div className="tpo-jobs-simple">
      <div className="jobs-simple-header">
        <h1>Company Approval Panel</h1>
        <p>
          Review recruiter job requests and approve only valid drives. Student panel shows only approved jobs.
        </p>
      </div>

      {feedbackMessage && <p className="jobs-feedback">{feedbackMessage}</p>}

      <div className="jobs-simple-stats">
        <Card className="stat-card stat-blue">
          <span className="stat-label">Total Requests</span>
          <strong>{stats.totalRequests}</strong>
        </Card>

        <Card className="stat-card stat-green">
          <span className="stat-label">Approved For Students</span>
          <strong>{stats.approved}</strong>
        </Card>

        <Card className="stat-card stat-yellow">
          <span className="stat-label">Pending TPO Approval</span>
          <strong>{stats.pending}</strong>
        </Card>

        <Card className="stat-card stat-red">
          <span className="stat-label">Rejected</span>
          <strong>{stats.rejected}</strong>
        </Card>
      </div>

      <Card title="Filters" className="jobs-simple-filter-card">
        <div className="jobs-simple-filters">
          <input
            type="text"
            className="form-input"
            placeholder="Search company, role, or contact person"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="form-input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      <Card title="Company Requests" className="jobs-simple-table-card">
        <div className="jobs-table-scroll">
          <table className="jobs-simple-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Deadline</th>
                <th>Applied</th>
                <th>Shortlisted</th>
                <th>Offered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="no-company-row">
                    Loading jobs...
                  </td>
                </tr>
              ) : null}
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-company-row">
                    No company requests match current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.company?.name || '-'}</strong>
                    </td>
                    <td>
                      <strong>{request.title || '-'}</strong>
                    </td>
                    <td>{formatDate(request.application_deadline)}</td>
                    <td>{request.pipeline?.applied || 0}</td>
                    <td>{request.pipeline?.shortlisted || 0}</td>
                    <td>{request.pipeline?.offered || 0}</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(request.approval_status)}`}>
                        {String(request.approval_status || 'PENDING').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="jobs-action-group">
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          onClick={() => handleApprovalChange(request.id, 'approved')}
                          disabled={String(request.approval_status || '').toLowerCase() === 'approved'}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => handleApprovalChange(request.id, 'rejected')}
                          disabled={String(request.approval_status || '').toLowerCase() === 'rejected'}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default TPOJobs;
