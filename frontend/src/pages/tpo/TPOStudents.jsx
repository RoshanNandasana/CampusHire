import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { tpoAPI } from '../../services/api';
import { extractArray, getApiErrorMessage } from './tpoUtils';
import './TPOStudents.css';

const STATUS_ORDER = {
  applied: 1,
  shortlisted: 2,
  interview: 3,
  offer: 4,
  rejected: 5,
};

const TPOStudents = () => {
  const [applicationRows, setApplicationRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    company: 'all',
    status: 'all',
    minCGPA: 5,
    maxCGPA: 10,
    minApplications: 1,
    sortBy: 'status',
  });

  const [contactTarget, setContactTarget] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [uiMessage, setUiMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      setLoading(true);
      try {
        const response = await tpoAPI.getApplications();
        const items = extractArray(response, ['applications']);
        if (!isMounted) return;

        const countsByStudent = items.reduce((acc, item) => {
          const key = String(item?.email || item?.student || item?.id || 'unknown');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        const mapped = items.map((item, index) => {
          const studentName = item?.student || (item?.email ? item.email.split('@')[0] : 'Student');
          const studentKey = String(item?.email || studentName || item?.id || index);
          return {
            rowId: String(item?.id || `${studentKey}-${item?.company || 'company'}-${item?.position || 'role'}-${index}`),
            studentId: studentKey,
            studentName,
            email: item?.email || '-',
            phone: item?.phone || '-',
            cgpa: Number(item?.cgpa || 0),
            branch: item?.branch || 'Department',
            totalApplications: countsByStudent[studentKey] || 1,
            company: item?.company || 'Company',
            role: item?.position || 'Role',
            status: String(item?.status || 'applied').toLowerCase(),
            appliedOn: item?.appliedAt || item?.updatedAt || '',
          };
        });

        setApplicationRows(mapped);
      } catch (error) {
        if (!isMounted) return;
        setApplicationRows([]);
        setUiMessage(getApiErrorMessage(error, 'Unable to load student applications right now.'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  const companyOptions = useMemo(
    () => [...new Set(applicationRows.map((row) => row.company))],
    [applicationRows]
  );

  const stats = useMemo(() => {
    const offers = applicationRows.filter((row) => row.status === 'offer').length;
    const shortlisted = applicationRows.filter((row) => row.status === 'shortlisted').length;

    return {
      studentsApplied: new Set(applicationRows.map((row) => row.studentId)).size,
      totalApplications: applicationRows.length,
      companiesInDrive: new Set(applicationRows.map((row) => row.company)).size,
      offers,
      shortlisted,
    };
  }, [applicationRows]);

  const filteredRows = useMemo(() => {
    const base = applicationRows.filter((row) => {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        row.studentName.toLowerCase().includes(search) ||
        row.email.toLowerCase().includes(search) ||
        row.company.toLowerCase().includes(search) ||
        row.role.toLowerCase().includes(search);

      const matchesCompany = filters.company === 'all' || row.company === filters.company;
      const matchesStatus = filters.status === 'all' || row.status === filters.status;
      const matchesCGPA = row.cgpa >= Number(filters.minCGPA) && row.cgpa <= Number(filters.maxCGPA);
      const matchesApplications = row.totalApplications >= Number(filters.minApplications);

      return matchesSearch && matchesCompany && matchesStatus && matchesCGPA && matchesApplications;
    });

    return base.sort((a, b) => {
      if (filters.sortBy === 'cgpa') return b.cgpa - a.cgpa;
      if (filters.sortBy === 'applications') return b.totalApplications - a.totalApplications;
      if (filters.sortBy === 'company') return a.company.localeCompare(b.company);
      return (STATUS_ORDER[a.status] || 99) - (STATUS_ORDER[b.status] || 99);
    });
  }, [applicationRows, filters]);

  const statusClass = (status) => {
    if (status === 'offer') return 'badge badge-success';
    if (status === 'shortlisted') return 'badge badge-info';
    if (status === 'interview') return 'badge badge-warning';
    if (status === 'rejected') return 'badge badge-danger';
    return 'badge badge-secondary';
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      company: 'all',
      status: 'all',
      minCGPA: 5,
      maxCGPA: 10,
      minApplications: 1,
      sortBy: 'status',
    });
  };

  const sendNotification = () => {
    if (!contactTarget) return;
    if (!contactMessage.trim()) {
      setUiMessage('Please enter a message before sending notification.');
      return;
    }

    setUiMessage(`Notification sent to ${contactTarget.studentName}.`);
    setContactMessage('');
    setContactTarget(null);
  };

  return (
    <div className="tpo-students">
      <div className="header">
        <h1>Branch Application Tracker</h1>
        <p>
          Live department applications from backend with company-wise status tracking.
        </p>
      </div>

      {uiMessage && <p className="notify-banner">{uiMessage}</p>}

      <div className="summary-grid">
        <Card className="summary-card blue">
          <span>Students Applied</span>
          <strong>{stats.studentsApplied}</strong>
        </Card>
        <Card className="summary-card green">
          <span>Total Applications</span>
          <strong>{stats.totalApplications}</strong>
        </Card>
        <Card className="summary-card violet">
          <span>Companies</span>
          <strong>{stats.companiesInDrive}</strong>
        </Card>
        <Card className="summary-card amber">
          <span>Offers / Shortlists</span>
          <strong>{stats.offers} / {stats.shortlisted}</strong>
        </Card>
      </div>

      <Card title="Smart Filters" className="filter-card colorful-filter-card">
        <div className="filter-grid">
          <div className="filter-group search-group">
            <label>Search Student / Company / Role</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="form-input"
              placeholder="e.g. Raj, Google, Software Engineer"
            />
          </div>

          <div className="filter-group">
            <label>Company</label>
            <select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              className="form-input"
            >
              <option value="all">All Companies</option>
              {companyOptions.map((company) => (
                <option value={company} key={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={filters.minCGPA}
              onChange={(e) => setFilters({ ...filters, minCGPA: Number(e.target.value) || 0 })}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>Max CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={filters.maxCGPA}
              onChange={(e) => setFilters({ ...filters, maxCGPA: Number(e.target.value) || 10 })}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>Min Applied Count</label>
            <input
              type="number"
              min="1"
              value={filters.minApplications}
              onChange={(e) => setFilters({ ...filters, minApplications: Number(e.target.value) || 1 })}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="form-input"
            >
              <option value="status">Status Priority</option>
              <option value="cgpa">Highest CGPA</option>
              <option value="applications">Most Applications</option>
              <option value="company">Company Name</option>
            </select>
          </div>

          <div className="filter-group filter-action-group">
            <button className="btn btn-outlined" type="button" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </Card>

      <Card title={`Applied Records (${filteredRows.length})`} className="students-card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>CGPA</th>
                <th>Company</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied On</th>
                <th>Total Apps</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-results">
                    {loading ? 'Loading applied records...' : 'No applied records found for current filters.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.rowId}>
                    <td>
                      <strong>{row.studentName}</strong>
                      <p className="email">{row.email}</p>
                    </td>
                    <td>
                      <strong>{row.cgpa}</strong>
                    </td>
                    <td>{row.company}</td>
                    <td>{row.role}</td>
                    <td>
                      <span className={statusClass(row.status)}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td>{row.appliedOn ? new Date(row.appliedOn).toLocaleDateString() : '-'}</td>
                    <td>{row.totalApplications}</td>
                    <td>
                      <button className="btn btn-small btn-primary" onClick={() => setContactTarget(row)}>
                        Contact
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={!!contactTarget}
        title={contactTarget ? `Contact ${contactTarget.studentName}` : 'Contact Student'}
        onClose={() => {
          setContactTarget(null);
          setContactMessage('');
        }}
        onConfirm={sendNotification}
        confirmText="Send Notification"
      >
        {contactTarget && (
          <div className="contact-modal">
            <p>
              Send update to <strong>{contactTarget.studentName}</strong> regarding <strong>{contactTarget.company}</strong> ({contactTarget.role}).
            </p>
            <div className="contact-meta">
              <span>Email: {contactTarget.email}</span>
              <span>Phone: {contactTarget.phone}</span>
              <span>Current Status: {contactTarget.status}</span>
            </div>
            <label htmlFor="tpo-notify-message">Message</label>
            <textarea
              id="tpo-notify-message"
              rows={4}
              className="form-input"
              placeholder="Type notification for student"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TPOStudents;
