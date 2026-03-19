import React, { useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import './TPOStudents.css';

const STATUS_ORDER = {
  applied: 1,
  shortlisted: 2,
  interview: 3,
  offer: 4,
  rejected: 5,
};

const TPOStudents = () => {
  const { user } = useAuth();

  const assignedBranch = useMemo(() => {
    if (!user?.email) return 'CSE';
    const email = user.email.toLowerCase();
    if (email.includes('ece')) return 'ECE';
    if (email.includes('me')) return 'ME';
    if (email.includes('civil')) return 'Civil';
    if (email.includes('it')) return 'IT';
    return 'CSE';
  }, [user]);

  const [students] = useState([
    {
      id: 1,
      name: 'Raj Kumar',
      email: 'raj@example.com',
      phone: '+91 98765 00001',
      branch: 'CSE',
      cgpa: 8.5,
      applications: [
        { company: 'Google', role: 'Software Engineer', status: 'shortlisted', appliedOn: '2026-03-02' },
        { company: 'Amazon', role: 'Data Engineer', status: 'interview', appliedOn: '2026-03-08' },
      ],
    },
    {
      id: 2,
      name: 'Priya Singh',
      email: 'priya@example.com',
      phone: '+91 98765 00002',
      branch: 'CSE',
      cgpa: 8.2,
      applications: [
        { company: 'Microsoft', role: 'Product Manager', status: 'offer', appliedOn: '2026-03-04' },
      ],
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '+91 98765 00003',
      branch: 'ECE',
      cgpa: 7.8,
      applications: [{ company: 'TCS', role: 'Systems Engineer', status: 'applied', appliedOn: '2026-03-06' }],
    },
    {
      id: 4,
      name: 'Neha Verma',
      email: 'neha@example.com',
      phone: '+91 98765 00004',
      branch: 'CSE',
      cgpa: 8.9,
      applications: [
        { company: 'Google', role: 'Software Engineer', status: 'offer', appliedOn: '2026-03-01' },
        { company: 'Deloitte', role: 'Business Analyst', status: 'shortlisted', appliedOn: '2026-03-10' },
      ],
    },
    {
      id: 5,
      name: 'Sonal Shah',
      email: 'sonal@example.com',
      phone: '+91 98765 00006',
      branch: 'CSE',
      cgpa: 7.4,
      applications: [{ company: 'Infosys', role: 'Software Developer', status: 'interview', appliedOn: '2026-03-09' }],
    },
    {
      id: 6,
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      phone: '+91 98765 00005',
      branch: 'ME',
      cgpa: 7.2,
      applications: [],
    },
  ]);

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

  const branchStudents = useMemo(
    () => students.filter((student) => student.branch === assignedBranch),
    [students, assignedBranch]
  );

  const applicationRows = useMemo(() => {
    return branchStudents.flatMap((student) =>
      student.applications.map((application) => ({
        rowId: `${student.id}-${application.company}-${application.role}`,
        studentId: student.id,
        studentName: student.name,
        email: student.email,
        phone: student.phone,
        cgpa: student.cgpa,
        branch: student.branch,
        totalApplications: student.applications.length,
        ...application,
      }))
    );
  }, [branchStudents]);

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
          Showing <strong>{assignedBranch}</strong> students and exactly which company they applied to.
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
                  <td colSpan={8} className="no-results">No applied records found for current filters.</td>
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
                    <td>{new Date(row.appliedOn).toLocaleDateString()}</td>
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
