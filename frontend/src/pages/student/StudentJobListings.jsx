import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StudentTopPanel from '../../components/student/StudentTopPanel';
import './StudentJobListings.css';

const StudentJobListings = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    companyName: '',
    minCGPA: 5.0,
    searchQuery: '',
  });

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const [jobs] = useState([
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer',
      description: 'Looking for talented software engineers to join our team.',
      minCGPA: 7.5,
      skills: ['Python', 'JavaScript', 'DSA'],
      ctc: '20 LPA',
      locations: ['Bangalore', 'Hyderabad'],
      deadline: '2024-02-28',
      bondAgreement: {
        required: true,
        durationMonths: 12,
        details: 'One-year service bond with early exit fee as per company policy.',
      },
      requirements: [
        'Strong DSA fundamentals',
        'Problem-solving round (2)',
        'System design basics',
      ],
      documents: [
        { label: 'Role Description (PDF)', url: '#' },
        { label: 'Bond Agreement (PDF)', url: '#' },
      ],
      selectionProcess: ['Online assessment', 'Technical interviews', 'HR interview'],
      tpoNote: 'Approved by TPO for 2024 CSE batch. Carry updated resume and transcript.',
      tpoCoordinator: 'Dr. R. Sharma',
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Product Manager',
      description: 'Seeking experienced product managers for our cloud division.',
      minCGPA: 7.0,
      skills: ['AWS', 'Leadership', 'Analytics'],
      ctc: '18 LPA',
      locations: ['Pune'],
      deadline: '2024-02-25',
      bondAgreement: {
        required: false,
        durationMonths: 0,
        details: 'No service bond required.',
      },
      requirements: [
        'Product case study',
        'Analytics round',
        'Stakeholder management interview',
      ],
      documents: [
        { label: 'Job Description (PDF)', url: '#' },
      ],
      selectionProcess: ['Case study', 'Panel interview', 'HR interview'],
      tpoNote: 'Open for students with Product case-study completion certificate.',
      tpoCoordinator: 'Prof. Neha Soni',
    },
    {
      id: 3,
      company: 'Amazon',
      position: 'Data Engineer',
      description: 'Help build scalable data solutions at Amazon.',
      minCGPA: 6.5,
      skills: ['SQL', 'Python', 'Spark'],
      ctc: '16 LPA',
      locations: ['Bangalore'],
      deadline: '2024-03-05',
      bondAgreement: {
        required: true,
        durationMonths: 18,
        details: '18-month bond with relocation terms as per offer letter.',
      },
      requirements: [
        'SQL + Python coding round',
        'Data modeling interview',
        'ETL pipeline discussion',
      ],
      documents: [
        { label: 'Offer Terms (PDF)', url: '#' },
        { label: 'Bond Agreement (PDF)', url: '#' },
      ],
      selectionProcess: ['Coding test', 'Technical interviews', 'HR interview'],
      tpoNote: 'Interview prep workshop mandatory before shortlist release.',
      tpoCoordinator: 'Dr. R. Sharma',
    },
    {
      id: 4,
      company: 'TCS',
      position: 'Systems Engineer',
      description: 'Join our global IT services team.',
      minCGPA: 6.0,
      skills: ['Java', 'SQL', 'OOPS'],
      ctc: '8 LPA',
      locations: ['Multiple'],
      deadline: '2024-02-20',
      bondAgreement: {
        required: true,
        durationMonths: 24,
        details: 'Two-year service bond with training recovery clause.',
      },
      requirements: [
        'Aptitude test',
        'Technical + HR interview',
      ],
      documents: [
        { label: 'Service Bond (PDF)', url: '#' },
        { label: 'Role Overview (PDF)', url: '#' },
      ],
      selectionProcess: ['Aptitude test', 'Technical interview', 'HR interview'],
      tpoNote: 'Mass recruiter drive. Document verification by TPO is required first.',
      tpoCoordinator: 'Prof. Rahul Desai',
    },
  ]);

  const filteredJobs = jobs.filter((job) => {
    const meetsMinCGPA = 8.2 >= job.minCGPA; // User's CGPA is 8.2
    const matchesSearch =
      job.company.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(filters.searchQuery.toLowerCase());
    return meetsMinCGPA && matchesSearch;
  });

  const isEligible = (job) => {
    return 8.2 >= job.minCGPA;
  };

  const handleApply = () => {
    alert(`Applied to ${selectedJob.position} at ${selectedJob.company}!`);
    setSelectedJob(null);
  };

  return (
    <div className="job-listings">
      <StudentTopPanel
        title="Available Job Openings"
        subtitle="Explore recruiter jobs with complete TPO eligibility, coordinator, and policy visibility."
        kicker="Student Jobs"
        stats={[
          { label: 'Eligible Jobs', value: filteredJobs.length },
          { label: 'Profile CGPA', value: '8.2' },
          { label: 'Current Cycle', value: '2024' },
          { label: 'Filters Applied', value: filters.searchQuery ? '1' : '0' },
        ]}
        tpoUpdates={[
          'TPO rule: Min CGPA eligibility applies before apply button',
          'All drives require verified academic records',
          'Coordinator details are shown in each job detail panel',
          'Policy notes from TPO are visible per company posting',
        ]}
      />

      <Card title="Filter Jobs" className="filter-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Search by Company or Position</label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Search..."
              className="form-input"
            />
          </div>
        </div>
      </Card>

      <div className="jobs-count">
        <p>{filteredJobs.length} eligible job(s) found</p>
      </div>

      <div className="jobs-grid">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="job-card card-interactive">
            <div className="job-header">
              <div className="job-title-section">
                <h3>{job.position}</h3>
                <p className="company-name">{job.company}</p>
              </div>
              <span className="ctc-badge">{job.ctc}</span>
            </div>

            <p className="job-summary">{job.description}</p>

            <div className="job-meta">
              <div className="meta-item">
                <span className="meta-label">Location</span>
                <span className="meta-value">{job.locations.join(', ')}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Deadline</span>
                <span className="meta-value">{formatDate(job.deadline)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Min CGPA</span>
                <span className="meta-value">{job.minCGPA}</span>
              </div>
            </div>

            <div className="job-chips">
              {job.skills.slice(0, 2).map((skill, index) => (
                <span key={index} className="chip">
                  {skill}
                </span>
              ))}
              {job.skills.length > 2 && (
                <span className="chip chip-muted">+{job.skills.length - 2} more</span>
              )}
            </div>

            <button
              className="btn btn-primary btn-small btn-full"
              onClick={() => setSelectedJob(job)}
              disabled={!isEligible(job)}
            >
              View & Apply
            </button>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedJob}
        title={selectedJob?.position}
        onClose={() => setSelectedJob(null)}
        onConfirm={handleApply}
        confirmText="Apply Now"
      >
        {selectedJob && (
          <div className="job-detail-modal">
            <div className="modal-section">
              <h4>Company</h4>
              <p>{selectedJob.company}</p>
            </div>

            <div className="modal-section">
              <h4>Description</h4>
              <p>{selectedJob.description}</p>
            </div>

            <div className="modal-section">
              <h4>Required Skills</h4>
              <div className="skills-list">
                {selectedJob.skills.map((skill, index) => (
                  <span key={index} className="skill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4>Key Details</h4>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Min CGPA</span>
                  <span className="value">{selectedJob.minCGPA}</span>
                </div>
                <div className="info-item">
                  <span className="label">CTC</span>
                  <span className="value">{selectedJob.ctc}</span>
                </div>
                <div className="info-item">
                  <span className="label">Application Deadline</span>
                  <span className="value">{formatDate(selectedJob.deadline)}</span>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h4>Bond Agreement</h4>
              <p>
                {selectedJob.bondAgreement.required
                  ? `Required (${selectedJob.bondAgreement.durationMonths} months)`
                  : 'Not required'}
              </p>
              <p>{selectedJob.bondAgreement.details}</p>
            </div>

            <div className="modal-section">
              <h4>Requirements</h4>
              <div className="skills-list">
                {selectedJob.requirements.map((item, index) => (
                  <span key={index} className="skill">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4>Selection Process</h4>
              <div className="skills-list">
                {selectedJob.selectionProcess.map((step, index) => (
                  <span key={index} className="skill">
                    {step}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4>Documents</h4>
              <div className="skills-list">
                {selectedJob.documents.map((doc, index) => (
                  <a
                    key={index}
                    className="skill"
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {doc.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4>Locations</h4>
              <p>{selectedJob.locations.join(', ')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentJobListings;
