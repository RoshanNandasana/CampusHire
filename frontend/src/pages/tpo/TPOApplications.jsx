import React, { useEffect } from 'react';
import Card from '../../components/common/Card';
import { tpoAPI } from '../../services/api';
import { extractArray, getApiErrorMessage } from './tpoUtils';
import './TPOApplications.css';

const TPOApplications = () => {
  const [applications, setApplications] = React.useState([
    {
      id: 'APP-1001',
      student: 'Raj Kumar',
      email: 'raj@example.com',
      branch: 'CSE',
      cgpa: 8.5,
      company: 'Google',
      position: 'SWE',
      status: 'shortlisted',
      appliedAt: '2024-01-15',
      updatedAt: '2024-01-22',
      nextStep: 'Technical Interview',
    },
    {
      id: 'APP-1002',
      student: 'Priya Singh',
      email: 'priya@example.com',
      branch: 'CSE',
      cgpa: 8.2,
      company: 'Microsoft',
      position: 'PM',
      status: 'interview',
      appliedAt: '2024-01-10',
      updatedAt: '2024-01-25',
      nextStep: 'HR Round',
    },
    {
      id: 'APP-1003',
      student: 'Amit Patel',
      email: 'amit@example.com',
      branch: 'ECE',
      cgpa: 7.8,
      company: 'Amazon',
      position: 'DE',
      status: 'applied',
      appliedAt: '2024-01-20',
      updatedAt: '2024-01-21',
      nextStep: 'Shortlisting',
    },
    {
      id: 'APP-1004',
      student: 'Neha Verma',
      email: 'neha@example.com',
      branch: 'CSE',
      cgpa: 8.9,
      company: 'Google',
      position: 'SWE',
      status: 'offer',
      appliedAt: '2024-01-05',
      updatedAt: '2024-02-03',
      nextStep: 'Offer Acceptance',
    },
    {
      id: 'APP-1005',
      student: 'Anjali Sharma',
      email: 'anjali@example.com',
      branch: 'ECE',
      cgpa: 8.0,
      company: 'TCS',
      position: 'Systems Engineer',
      status: 'applied',
      appliedAt: '2024-01-28',
      updatedAt: '2024-01-29',
      nextStep: 'Aptitude Test',
    },
    {
      id: 'APP-1006',
      student: 'Vikram Singh',
      email: 'vikram@example.com',
      branch: 'ME',
      cgpa: 7.2,
      company: 'Infosys',
      position: 'SE',
      status: 'shortlisted',
      appliedAt: '2024-01-18',
      updatedAt: '2024-01-30',
      nextStep: 'Technical Interview',
    },
  ]);

  const [filters, setFilters] = React.useState({
    search: '',
    company: 'all',
    status: 'all',
    branch: 'all',
    sort: 'latest',
  });
  const [uiMessage, setUiMessage] = React.useState('');

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'applied': return 'badge badge-info';
      case 'shortlisted': return 'badge badge-warning';
      case 'interview': return 'badge badge-secondary';
      case 'offer': return 'badge badge-success';
      default: return 'badge';
    }
  };

  const companies = Array.from(new Set(applications.map((item) => item.company)));
  const branches = Array.from(new Set(applications.map((item) => item.branch)));

  const summary = {
    total: applications.length,
    applied: applications.filter((item) => item.status === 'applied').length,
    shortlisted: applications.filter((item) => item.status === 'shortlisted').length,
    interview: applications.filter((item) => item.status === 'interview').length,
    offer: applications.filter((item) => item.status === 'offer').length,
  };

  const filteredApplications = applications
    .filter((item) => {
      const searchText = filters.search.toLowerCase();
      const matchesSearch =
        item.student.toLowerCase().includes(searchText) ||
        item.id.toLowerCase().includes(searchText) ||
        item.position.toLowerCase().includes(searchText) ||
        item.company.toLowerCase().includes(searchText);

      const matchesCompany = filters.company === 'all' || item.company === filters.company;
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesBranch = filters.branch === 'all' || item.branch === filters.branch;

      return matchesSearch && matchesCompany && matchesStatus && matchesBranch;
    })
    .sort((left, right) => {
      if (filters.sort === 'latest') {
        return new Date(right.appliedAt) - new Date(left.appliedAt);
      }
      if (filters.sort === 'oldest') {
        return new Date(left.appliedAt) - new Date(right.appliedAt);
      }
      if (filters.sort === 'cgpa-high') {
        return right.cgpa - left.cgpa;
      }
      if (filters.sort === 'cgpa-low') {
        return left.cgpa - right.cgpa;
      }
      return 0;
    });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        const response = await tpoAPI.getApplications();
        const items = extractArray(response, ['applications']);
        if (!isMounted) return;

        const mapped = items.map((item, index) => ({
          id: item.id || `APP-${index + 1}`,
          student: item.student || 'Student',
          email: item.email || '-',
          branch: item.branch || '-',
          cgpa: Number(item.cgpa || 0),
          company: item.company || 'Company',
          position: item.position || 'Role',
          status: item.status || 'applied',
          appliedAt: item.appliedAt || item.updatedAt,
          updatedAt: item.updatedAt || item.appliedAt,
          nextStep: item.nextStep || 'Recruiter review',
        }));

        setApplications(mapped);
      } catch (error) {
        if (!isMounted) return;
        setUiMessage(getApiErrorMessage(error, 'Unable to load applications right now.'));
      }
    };

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="tpo-applications">
      <div className="applications-header">
        <h1>Application Tracking</h1>
        <p>Monitor all student applications and statuses</p>
      </div>

      {uiMessage && <p className="notify-banner">{uiMessage}</p>}

      <div className="summary-grid">
        <Card className="summary-card summary-total">
          <div className="summary-content">
            <p>Total Applications</p>
            <h3>{summary.total}</h3>
          </div>
        </Card>
        <Card className="summary-card summary-applied">
          <div className="summary-content">
            <p>Applied</p>
            <h3>{summary.applied}</h3>
          </div>
        </Card>
        <Card className="summary-card summary-shortlisted">
          <div className="summary-content">
            <p>Shortlisted</p>
            <h3>{summary.shortlisted}</h3>
          </div>
        </Card>
        <Card className="summary-card summary-interview">
          <div className="summary-content">
            <p>Interview</p>
            <h3>{summary.interview}</h3>
          </div>
        </Card>
        <Card className="summary-card summary-offer">
          <div className="summary-content">
            <p>Offers</p>
            <h3>{summary.offer}</h3>
          </div>
        </Card>
      </div>

      <Card title="Filters" className="filter-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Student, App ID, Company, Position"
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Company</label>
            <select
              className="form-input"
              value={filters.company}
              onChange={(event) => updateFilter('company', event.target.value)}
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              className="form-input"
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Branch</label>
            <select
              className="form-input"
              value={filters.branch}
              onChange={(event) => updateFilter('branch', event.target.value)}
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              className="form-input"
              value={filters.sort}
              onChange={(event) => updateFilter('sort', event.target.value)}
            >
              <option value="latest">Latest Applied</option>
              <option value="oldest">Oldest Applied</option>
              <option value="cgpa-high">CGPA High to Low</option>
              <option value="cgpa-low">CGPA Low to High</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title={`All Applications (${filteredApplications.length})`}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Student</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Company</th>
                <th>Position</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Updated Date</th>
                <th>Next Step</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.id}>
                  <td className="mono">{app.id}</td>
                  <td>
                    <div className="student-cell">
                      <strong>{app.student}</strong>
                      <span>{app.email}</span>
                    </div>
                  </td>
                  <td>{app.branch}</td>
                  <td><strong>{app.cgpa}</strong></td>
                  <td>{app.company}</td>
                  <td>{app.position}</td>
                  <td><span className={getStatusBadgeClass(app.status)}>{app.status}</span></td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                  <td>{new Date(app.updatedAt).toLocaleDateString()}</td>
                  <td>{app.nextStep}</td>
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty-cell">
                    No applications match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TPOApplications;
