import React, { useState, useMemo } from 'react';
import {
  MdBusinessCenter, MdCheckCircle, MdEvent, MdPeople, MdPlaylistAddCheck,
  MdLocalOffer, MdEmojiEvents, MdAccessTime, MdSearch, MdClose,
  MdAdd, MdLocationOn, MdVisibility, MdEdit, MdGroup,
  MdBarChart, MdSchool, MdRepeat, MdDescription,
  MdArrowUpward, MdArrowDownward,
} from 'react-icons/md';
import './TPOJobs.css';

const JOBS_DATA = [
  {
    id: 1, company: 'Google', companyLogo: 'G', logoColor: '#4285F4',
    position: 'Software Engineer', type: 'Full Time',
    department: ['CSE', 'IT'], location: 'Bangalore', ctc: '18 LPA',
    postedDate: '2024-01-10', deadline: '2024-02-10', status: 'active',
    applicants: 145, shortlisted: 32, interviewed: 22, offered: 8, joined: 6,
    rounds: ['Online Test', 'Technical Round 1', 'Technical Round 2', 'HR Round'],
    minCGPA: 7.5, backlogsAllowed: false,
    description: 'Google is hiring strong Software Engineers to build products used by billions. Looking for problem solvers with excellent coding and system design skills.',
  },
  {
    id: 2, company: 'Microsoft', companyLogo: 'M', logoColor: '#00A4EF',
    position: 'Product Manager', type: 'Full Time',
    department: ['CSE', 'ECE'], location: 'Hyderabad', ctc: '22 LPA',
    postedDate: '2024-01-15', deadline: '2024-02-20', status: 'active',
    applicants: 98, shortlisted: 15, interviewed: 10, offered: 5, joined: 4,
    rounds: ['Aptitude Test', 'Case Study Round', 'Technical Interview', 'HR Round'],
    minCGPA: 8.0, backlogsAllowed: false,
    description: 'Microsoft seeks dynamic product thinkers who can bridge technical and business goals. Strong analytical and communication skills required.',
  },
  {
    id: 3, company: 'Amazon', companyLogo: 'A', logoColor: '#FF9900',
    position: 'Data Engineer', type: 'Full Time',
    department: ['CSE', 'IT', 'ECE'], location: 'Chennai', ctc: '15 LPA',
    postedDate: '2024-01-12', deadline: '2024-01-30', status: 'closed',
    applicants: 125, shortlisted: 28, interviewed: 18, offered: 9, joined: 7,
    rounds: ['Online Assessment', 'Technical Interview', 'Bar Raiser Round'],
    minCGPA: 7.0, backlogsAllowed: false,
    description: 'Amazon Data team is expanding rapidly. Looking for engineers skilled in data pipelines, SQL, Python, and distributed systems.',
  },
  {
    id: 4, company: 'TCS', companyLogo: 'T', logoColor: '#0A2D8A',
    position: 'Systems Engineer', type: 'Full Time',
    department: ['CSE', 'ECE', 'ME', 'Civil'], location: 'Pune', ctc: '7 LPA',
    postedDate: '2024-01-08', deadline: '2024-03-01', status: 'active',
    applicants: 210, shortlisted: 85, interviewed: 70, offered: 55, joined: 48,
    rounds: ['TCS National Qualifier', 'Technical Interview', 'HR Round'],
    minCGPA: 6.0, backlogsAllowed: true,
    description: 'TCS Systems Engineer profile is open to all branches. Candidates will work on diverse enterprise client projects across India.',
  },
  {
    id: 5, company: 'Infosys', companyLogo: 'I', logoColor: '#007CC3',
    position: 'Software Developer', type: 'Full Time',
    department: ['CSE', 'IT', 'ECE'], location: 'Mumbai', ctc: '8 LPA',
    postedDate: '2024-01-20', deadline: '2024-04-01', status: 'upcoming',
    applicants: 0, shortlisted: 0, interviewed: 0, offered: 0, joined: 0,
    rounds: ['InfyTQ Certification', 'Technical Interview', 'HR Round'],
    minCGPA: 6.5, backlogsAllowed: false,
    description: 'Infosys is hiring Software Developers for the upcoming batch. Candidates with Infosys InfyTQ certification will be given preference.',
  },
  {
    id: 6, company: 'Wipro', companyLogo: 'W', logoColor: '#341F6D',
    position: 'Project Engineer', type: 'Full Time',
    department: ['CSE', 'ECE', 'ME'], location: 'Noida', ctc: '6.5 LPA',
    postedDate: '2024-01-05', deadline: '2024-02-01', status: 'paused',
    applicants: 76, shortlisted: 20, interviewed: 0, offered: 0, joined: 0,
    rounds: ['Written Test', 'Technical Interview', 'HR Round'],
    minCGPA: 6.0, backlogsAllowed: true,
    description: 'Wipro Project Engineer role is currently paused pending drive schedule confirmation. Registration is open.',
  },
  {
    id: 7, company: 'Deloitte', companyLogo: 'D', logoColor: '#86BC25',
    position: 'Business Analyst', type: 'Full Time',
    department: ['CSE', 'IT', 'ECE', 'ME'], location: 'Delhi', ctc: '10 LPA',
    postedDate: '2024-01-18', deadline: '2024-02-28', status: 'active',
    applicants: 88, shortlisted: 24, interviewed: 16, offered: 7, joined: 6,
    rounds: ['Aptitude Test', 'Group Discussion', 'Technical Interview', 'HR Round'],
    minCGPA: 7.0, backlogsAllowed: false,
    description: 'Deloitte is seeking Business Analysts to work on digital transformation and consulting projects for large enterprises.',
  },
  {
    id: 8, company: 'Accenture', companyLogo: 'Ac', logoColor: '#A100FF',
    position: 'Associate Software Engineer', type: 'Full Time',
    department: ['CSE', 'IT', 'ECE', 'ME', 'Civil'], location: 'Bengaluru', ctc: '6.5 LPA',
    postedDate: '2024-01-22', deadline: '2024-04-15', status: 'upcoming',
    applicants: 0, shortlisted: 0, interviewed: 0, offered: 0, joined: 0,
    rounds: ['Cognitive Assessment', 'Coding Test', 'Technical Interview', 'HR'],
    minCGPA: 6.0, backlogsAllowed: false,
    description: 'Accenture is hiring ASE candidates through campus drive. Open to all technical branches with strong fundamentals.',
  },
];

const STATUS_CONFIG = {
  active:   { label: 'Active',   color: '#059669', bg: 'rgba(5,150,105,0.10)'   },
  closed:   { label: 'Closed',   color: '#DC2626', bg: 'rgba(220,38,38,0.10)'   },
  upcoming: { label: 'Upcoming', color: '#D97706', bg: 'rgba(217,119,6,0.10)'   },
  paused:   { label: 'Paused',   color: '#6B7280', bg: 'rgba(107,114,128,0.10)' },
};

const DEPARTMENTS = ['All Departments', 'CSE', 'ECE', 'ME', 'Civil', 'IT'];
const TABS = ['All', 'Active', 'Closed', 'Upcoming', 'Paused'];

const fmt = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

const pct = (num, den) => (den > 0 ? ((num / den) * 100).toFixed(1) : '0.0');

const TPOJobs = () => {
  const [search, setSearch]         = useState('');
  const [activeTab, setActiveTab]   = useState('All');
  const [department, setDepartment] = useState('All Departments');
  const [sortBy, setSortBy]         = useState('postedDate');
  const [sortDir, setSortDir]       = useState('desc');
  const [selectedJob, setSelectedJob] = useState(null);

  /* ─── Summary stats ─────────────────────────────────────── */
  const stats = useMemo(() => {
    const all   = JOBS_DATA;
    const today = new Date();
    return {
      total:           all.length,
      active:          all.filter(j => j.status === 'active').length,
      upcoming:        all.filter(j => j.status === 'upcoming').length,
      totalApplicants: all.reduce((s, j) => s + j.applicants, 0),
      totalShortlisted:all.reduce((s, j) => s + j.shortlisted, 0),
      totalOffers:     all.reduce((s, j) => s + j.offered, 0),
      totalJoined:     all.reduce((s, j) => s + j.joined, 0),
      expiringSoon:    all.filter(j => j.status === 'active' && (new Date(j.deadline) - today) / 86400000 <= 7).length,
    };
  }, []);

  /* ─── Filtered + sorted list ─────────────────────────────── */
  const filteredJobs = useMemo(() => {
    let list = [...JOBS_DATA];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(j =>
        j.company.toLowerCase().includes(q) ||
        j.position.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    }
    if (activeTab !== 'All') list = list.filter(j => j.status === activeTab.toLowerCase());
    if (department !== 'All Departments') list = list.filter(j => j.department.includes(department));
    list.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [search, activeTab, department, sortBy, sortDir]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const sortIcon = (col) => {
    if (sortBy !== col) return null;
    return sortDir === 'asc'
      ? <MdArrowUpward className="sort-arrow" />
      : <MdArrowDownward className="sort-arrow" />;
  };

  const tabCount = (tab) =>
    tab === 'All' ? JOBS_DATA.length : JOBS_DATA.filter(j => j.status === tab.toLowerCase()).length;

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="tpo-jobs">

      {/* ── Header ── */}
      <div className="jobs-header">
        <div>
          <h1>Job Monitoring</h1>
          <p>Track all job postings, application pipelines &amp; placement funnels</p>
        </div>
        <button className="jm-btn-primary">
          <MdAdd size={18} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Post New Job
        </button>
      </div>

      {/* ── KPI Stats ── */}
      <div className="jobs-stats-grid">
        {[
          { label: 'Total Jobs',       value: stats.total,            icon: <MdBusinessCenter size={22} />, cls: 'blue'   },
          { label: 'Active Jobs',      value: stats.active,           icon: <MdCheckCircle size={22} />,    cls: 'green'  },
          { label: 'Upcoming Drives',  value: stats.upcoming,         icon: <MdEvent size={22} />,          cls: 'yellow' },
          { label: 'Total Applicants', value: stats.totalApplicants,  icon: <MdPeople size={22} />,         cls: 'purple' },
          { label: 'Shortlisted',      value: stats.totalShortlisted, icon: <MdPlaylistAddCheck size={22}/>,cls: 'orange' },
          { label: 'Offers Made',      value: stats.totalOffers,      icon: <MdLocalOffer size={22} />,     cls: 'teal'   },
          { label: 'Students Joined',  value: stats.totalJoined,      icon: <MdEmojiEvents size={22} />,    cls: 'indigo' },
          { label: 'Expiring Soon',    value: stats.expiringSoon,     icon: <MdAccessTime size={22} />,     cls: 'red'    },
        ].map(s => (
          <div key={s.label} className={`job-stat-card ${s.cls}`}>
            <div className="job-stat-icon">{s.icon}</div>
            <div className="job-stat-info">
              <span className="job-stat-label">{s.label}</span>
              <span className="job-stat-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="jobs-filter-bar">
        <div className="jobs-search-wrap">
          <MdSearch size={20} className="jobs-search-icon" />
          <input
            className="jobs-search"
            placeholder="Search company, position, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="jobs-search-clear" onClick={() => setSearch('')}>
              <MdClose size={15} />
            </button>
          )}
        </div>
        <select className="jobs-select" value={department} onChange={e => setDepartment(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="jobs-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="postedDate">Sort: Posted Date</option>
          <option value="applicants">Sort: Applicants</option>
          <option value="offered">Sort: Offers</option>
          <option value="company">Sort: Company A–Z</option>
          <option value="ctc">Sort: CTC</option>
        </select>
      </div>

      {/* ── Tabs ── */}
      <div className="jobs-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`jobs-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} <span className="tab-count">{tabCount(tab)}</span>
          </button>
        ))}
        <span className="results-count">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* ── Table ── */}
      <div className="jobs-table-wrap">
        <table className="jobs-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('company')}>Company{sortIcon('company')}</th>
              <th className="sortable" onClick={() => handleSort('position')}>Position{sortIcon('position')}</th>
              <th>Dept / Type</th>
              <th className="sortable" onClick={() => handleSort('postedDate')}>Posted{sortIcon('postedDate')}</th>
              <th>Deadline</th>
              <th className="sortable" onClick={() => handleSort('ctc')}>CTC{sortIcon('ctc')}</th>
              <th className="sortable" onClick={() => handleSort('applicants')}>Applied{sortIcon('applicants')}</th>
              <th>Pipeline</th>
              <th className="sortable" onClick={() => handleSort('offered')}>Offers{sortIcon('offered')}</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={11} className="no-results">
                  <div className="no-results-inner">
                    <div className="no-results-icon"><MdSearch size={44} /></div>
                    <p>No jobs found matching your filters.</p>
                    <button className="jm-btn-outlined" onClick={() => { setSearch(''); setActiveTab('All'); setDepartment('All Departments'); }}>Clear Filters</button>
                  </div>
                </td>
              </tr>
            ) : filteredJobs.map(job => (
              <tr key={job.id} className="job-row" onClick={() => setSelectedJob(job)}>

                {/* Company */}
                <td>
                  <div className="company-cell">
                    <div className="co-logo" style={{ background: job.logoColor + '22', color: job.logoColor }}>
                      {job.companyLogo}
                    </div>
                    <span className="co-name">{job.company}</span>
                  </div>
                </td>

                {/* Position */}
                <td>
                  <div className="pos-cell">
                    <span className="pos-title">{job.position}</span>
                    <span className="pos-loc">
                      <MdLocationOn size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                      {job.location}
                    </span>
                  </div>
                </td>

                {/* Dept / Type */}
                <td>
                  <div className="dept-cell">
                    {job.department.slice(0, 2).map(d => <span key={d} className="dept-tag">{d}</span>)}
                    {job.department.length > 2 && <span className="dept-tag more">+{job.department.length - 2}</span>}
                    <span className="type-tag">{job.type}</span>
                  </div>
                </td>

                {/* Dates */}
                <td className="date-cell">{fmt(job.postedDate)}</td>
                <td>
                  <span className={`deadl ${new Date(job.deadline) < new Date() && job.status !== 'upcoming' ? 'expired' : ''}`}>
                    {fmt(job.deadline)}
                  </span>
                </td>

                {/* CTC */}
                <td className="ctc-cell">{job.ctc}</td>

                {/* Applied count */}
                <td className="count-cell">{job.applicants}</td>

                {/* Pipeline mini-chart */}
                <td>
                  <div className="pipeline-cell">
                    <div className="pipeline-row">
                      <span className="pl-label">Applied</span>
                      <div className="pl-track"><div className="pl-bar pl-applied" style={{ width: '100%' }} /></div>
                      <span className="pl-num">{job.applicants}</span>
                    </div>
                    <div className="pipeline-row">
                      <span className="pl-label">Shortlisted</span>
                      <div className="pl-track"><div className="pl-bar pl-short" style={{ width: `${pct(job.shortlisted, job.applicants)}%` }} /></div>
                      <span className="pl-num">{job.shortlisted}</span>
                    </div>
                    <div className="pipeline-row">
                      <span className="pl-label">Offered</span>
                      <div className="pl-track"><div className="pl-bar pl-offer" style={{ width: `${pct(job.offered, job.applicants)}%` }} /></div>
                      <span className="pl-num">{job.offered}</span>
                    </div>
                  </div>
                </td>

                {/* Offers */}
                <td>
                  <div className="offer-cell">
                    <span className="offer-num">{job.offered}</span>
                    <span className="offer-rate">{pct(job.offered, job.applicants)}%</span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <span
                    className="status-badge"
                    style={{ color: STATUS_CONFIG[job.status].color, background: STATUS_CONFIG[job.status].bg }}
                  >
                    {STATUS_CONFIG[job.status].label}
                  </span>
                </td>

                {/* Actions */}
                <td onClick={e => e.stopPropagation()}>
                  <div className="action-btns">
                    <button className="act-btn view" title="View Details" onClick={() => setSelectedJob(job)}>
                      <MdVisibility size={15} />
                    </button>
                    <button className="act-btn edit" title="Edit Job">
                      <MdEdit size={15} />
                    </button>
                    <button className="act-btn apps" title="View Applicants">
                      <MdGroup size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ══════════ Job Detail Modal ══════════ */}
      {selectedJob && (
        <div className="jm-overlay" onClick={() => setSelectedJob(null)}>
          <div className="jm-modal" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="jm-modal-head" style={{ borderBottom: `3px solid ${selectedJob.logoColor}` }}>
              <div className="jm-head-row">
                <div className="jm-modal-logo" style={{ background: selectedJob.logoColor + '22', color: selectedJob.logoColor }}>
                  {selectedJob.companyLogo}
                </div>
                <div className="jm-head-text">
                  <h2>{selectedJob.position}</h2>
                  <p>{selectedJob.company} &nbsp;·&nbsp; {selectedJob.location} &nbsp;·&nbsp; {selectedJob.type}</p>
                </div>
                <span
                  className="status-badge"
                  style={{ color: STATUS_CONFIG[selectedJob.status].color, background: STATUS_CONFIG[selectedJob.status].bg, marginLeft: 'auto', marginRight: '2.5rem' }}
                >
                  {STATUS_CONFIG[selectedJob.status].label}
                </span>
              </div>
              <button className="jm-modal-close" onClick={() => setSelectedJob(null)}>
                <MdClose size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="jm-modal-body">

              {/* Quick Eligibility Stats */}
              <div className="jm-quick-stats">
                {[
                  { label: 'CTC Package',   value: selectedJob.ctc,                         color: '#2FBF71'             },
                  { label: 'Min CGPA',      value: selectedJob.minCGPA,                     color: 'var(--primary-color)' },
                  { label: 'Backlogs',      value: selectedJob.backlogsAllowed ? 'Allowed' : 'Not Allowed', color: selectedJob.backlogsAllowed ? '#059669' : '#DC2626' },
                  { label: 'Deadline',      value: fmt(selectedJob.deadline),               color: 'var(--text-color)'    },
                  { label: 'Posted On',     value: fmt(selectedJob.postedDate),             color: 'var(--text-color)'    },
                  { label: 'Interview Rounds', value: selectedJob.rounds.length + ' rounds', color: 'var(--primary-color)' },
                ].map(s => (
                  <div key={s.label} className="qs-item">
                    <span className="qs-label">{s.label}</span>
                    <span className="qs-value" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Placement Funnel */}
              <div className="jm-section">
                <h4><MdBarChart size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />Placement Funnel</h4>
                <div className="modal-funnel">
                  {[
                    { label: 'Applied',      value: selectedJob.applicants,  color: '#5A77DF' },
                    { label: 'Shortlisted',  value: selectedJob.shortlisted, color: '#F39C12' },
                    { label: 'Interviewed',  value: selectedJob.interviewed, color: '#9B59B6' },
                    { label: 'Offered',      value: selectedJob.offered,     color: '#2FBF71' },
                    { label: 'Joined',       value: selectedJob.joined,      color: '#1ABC9C' },
                  ].map(step => (
                    <div key={step.label} className="mf-step">
                      <div className="mf-step-info">
                        <span className="mf-step-label">{step.label}</span>
                        <span className="mf-step-num" style={{ color: step.color }}>{step.value}</span>
                        <span className="mf-step-pct">{pct(step.value, selectedJob.applicants)}%</span>
                      </div>
                      <div className="mf-track">
                        <div
                          className="mf-bar"
                          style={{
                            width: selectedJob.applicants > 0
                              ? `${Math.max(parseFloat(pct(step.value, selectedJob.applicants)), 1)}%`
                              : '1%',
                            background: step.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two-col: Departments + Rounds */}
              <div className="jm-two-col">
                <div className="jm-section">
                  <h4><MdSchool size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />Eligible Departments</h4>
                  <div className="modal-dept-tags">
                    {selectedJob.department.map(d => (
                      <span key={d} className="dept-tag-lg">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="jm-section">
                  <h4><MdRepeat size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />Interview Rounds</h4>
                  <div className="rounds-list">
                    {selectedJob.rounds.map((r, i) => (
                      <div key={i} className="round-item">
                        <span className="round-num">{i + 1}</span>
                        <span className="round-name">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="jm-section">
                <h4><MdDescription size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />About the Role</h4>
                <p className="jm-desc">{selectedJob.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="jm-modal-actions">
                <button className="jm-btn-primary">View Applicants</button>
                <button className="jm-btn-outlined">Edit Eligibility</button>
                <button className="jm-btn-outlined">Export Data</button>
                {selectedJob.status === 'active' && (
                  <button className="jm-btn-danger">Close Job</button>
                )}
                {selectedJob.status === 'paused' && (
                  <button className="jm-btn-success">Resume Job</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TPOJobs;
