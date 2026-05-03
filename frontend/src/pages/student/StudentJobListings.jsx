import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StudentTopPanel from '../../components/student/StudentTopPanel';
import { studentAPI } from '../../services/api';
import './StudentJobListings.css';


const DEFAULT_JOBS = [
  {
    id: 1,
    company: 'Google',
    position: 'Software Engineer',
    description: 'Looking for talented software engineers to join our team.',
    minCGPA: 7.5,
    skills: ['Python', 'JavaScript', 'DSA'],
    ctc: '20 LPA',
    eligible: true,
    locations: ['Bangalore', 'Hyderabad'],
    deadline: '2026-04-20',
    bondAgreement: {
      required: true,
      durationMonths: 12,
      details: 'One-year service bond with early exit fee as per company policy.',
    },
    selectionProcess: ['Online assessment', 'Technical interviews', 'HR interview'],
    documents: [
      { label: 'Role Description PDF', url: '#', type: 'PDF' },
      { label: 'Bond Agreement PDF', url: '#', type: 'PDF' },
      { label: 'Eligibility Rules PDF', url: '#', type: 'PDF' },
    ],
    tpoNote: 'Approved by TPO for 2026 CSE batch. Carry updated resume and transcript.',
    tpoCoordinator: 'Dr. R. Sharma',
  },
  {
    id: 2,
    company: 'Microsoft',
    position: 'Product Manager',
    description: 'Seeking product managers for cloud and enterprise solutions.',
    minCGPA: 7.0,
    skills: ['Analytics', 'Communication', 'Leadership'],
    ctc: '18 LPA',
    eligible: true,
    locations: ['Pune'],
    deadline: '2026-04-18',
    bondAgreement: {
      required: false,
      durationMonths: 0,
      details: 'No service bond required.',
    },
    selectionProcess: ['Case study', 'Panel interview', 'HR interview'],
    documents: [
      { label: 'Job Description PDF', url: '#', type: 'PDF' },
      { label: 'Interview Process PDF', url: '#', type: 'PDF' },
    ],
    tpoNote: 'Open for students with product case-study completion certificate.',
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
    eligible: true,
    locations: ['Bangalore'],
    deadline: '2026-04-24',
    bondAgreement: {
      required: true,
      durationMonths: 18,
      details: '18-month bond with relocation terms as per offer letter.',
    },
    selectionProcess: ['Coding test', 'Technical interviews', 'HR interview'],
    documents: [
      { label: 'Role Description PDF', url: '#', type: 'PDF' },
      { label: 'Bond Terms PDF', url: '#', type: 'PDF' },
      { label: 'Data Engineer Round Guide PDF', url: '#', type: 'PDF' },
    ],
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
    eligible: true,
    locations: ['Multiple'],
    deadline: '2026-04-14',
    bondAgreement: {
      required: true,
      durationMonths: 24,
      details: 'Two-year service bond with training recovery clause.',
    },
    selectionProcess: ['Aptitude test', 'Technical interview', 'HR interview'],
    documents: [
      { label: 'Service Bond PDF', url: '#', type: 'PDF' },
      { label: 'Role Overview PDF', url: '#', type: 'PDF' },
    ],
    tpoNote: 'Mass recruiter drive. Document verification by TPO is required first.',
    tpoCoordinator: 'Prof. Rahul Desai',
  },
];

const StudentJobListings = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalStep, setModalStep] = useState('details');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [filters, setFilters] = useState({
    searchQuery: '',
    companyName: 'all',
    location: 'all',
    skill: 'all',
    minCtc: 0,
  });

  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const [studentCgpa, setStudentCgpa] = useState(8.2);

  const [applyDraft, setApplyDraft] = useState({
    fullName: 'John Doe',
    collegeEmail: 'john.doe@college.edu',
    phone: '+91 98765 43210',
    cgpa: '8.2',
    resumeFile: 'john_doe_resume.pdf',
    tenthMarksheetFile: 'class_10_marksheet.pdf',
    twelfthMarksheetFile: 'class_12_marksheet.pdf',
    graduationMarksheetFile: 'latest_sem_marksheet.pdf',
    note: '',
    declarationAccepted: false,
  });

  const profileDefaults = useMemo(
    () => ({
      fullName: 'John Doe',
      collegeEmail: 'john.doe@college.edu',
      phone: '+91 98765 43210',
      cgpa: '8.2',
      resumeFile: 'john_doe_resume.pdf',
      tenthMarksheetFile: 'class_10_marksheet.pdf',
      twelfthMarksheetFile: 'class_12_marksheet.pdf',
      graduationMarksheetFile: 'latest_sem_marksheet.pdf',
      note: '',
      declarationAccepted: false,
    }),
    []
  );

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();
  const parseLpa = (ctc) => Number(ctc.replace(' LPA', ''));

  const extractJobMetadata = (description) => {
    if (!description) return { plainDescription: '', metadata: {} };
    
    const metaMatch = description.match(/<!--META:\s*({.*})\s*-->$/);
    if (metaMatch) {
      try {
        const plainDescription = description.replace(/<!--META:.*-->$/, '').trim();
        const metadata = JSON.parse(metaMatch[1]);
        return { plainDescription, metadata };
      } catch (e) {
        return { plainDescription: description, metadata: {} };
      }
    }
    return { plainDescription: description, metadata: {} };
  };

  const companyOptions = useMemo(
    () => [...new Set(jobs.map((job) => job.company))],
    [jobs]
  );

  const locationOptions = useMemo(
    () => [...new Set(jobs.flatMap((job) => job.locations))],
    [jobs]
  );

  const skillOptions = useMemo(
    () => [...new Set(jobs.flatMap((job) => job.skills))],
    [jobs]
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesCompany = filters.companyName === 'all' || job.company === filters.companyName;
    const matchesLocation =
      filters.location === 'all' || job.locations.includes(filters.location);
    const matchesSkill = filters.skill === 'all' || job.skills.includes(filters.skill);
    const matchesCtc = parseLpa(job.ctc) >= Number(filters.minCtc);

    return matchesSearch && matchesCompany && matchesLocation && matchesSkill && matchesCtc;
  });

  const isEligible = (job) => {
    if (typeof job?.eligible === 'boolean') return job.eligible;
    return Number(studentCgpa || 0) >= Number(job.minCGPA || 0);
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [jobsResponse, appsResponse] = await Promise.all([
          studentAPI.getJobListings(),
          studentAPI.getApplications(),
        ]);
        const data = jobsResponse?.data;
        if (!isMounted || !data) return;

        if (Array.isArray(data.jobs) && data.jobs.length > 0) {
          const mapped = data.jobs.map((job) => ({
            ...job,
            bondAgreement: job.bondAgreement || {
              required: false,
              durationMonths: 0,
              details: 'Bond details will be shared by recruiter/TPO.',
            },
            selectionProcess: job.selectionProcess || ['Application Review', 'Interview Rounds', 'Final Decision'],
            documents: job.documents || [{ label: 'Role Description', url: '#', type: 'PDF' }],
            tpoNote: job.tpoNote || 'Follow TPO instructions for drive process.',
            tpoCoordinator: job.tpoCoordinator || 'Placement Cell',
          }));
          setJobs(mapped);
        } else {
          setJobs([]);
        }
        if (typeof data.studentCgpa === 'number') {
          setStudentCgpa(data.studentCgpa);
        }

        const apps = appsResponse?.data?.applications;
        if (Array.isArray(apps)) {
          const nextAppliedIds = new Set(
            apps
              .map((item) => item?.job?.id)
              .filter(Boolean)
              .map((id) => String(id))
          );
          setAppliedJobIds(nextAppliedIds);
        }
      } catch (error) {
        // Keep fallback jobs if API is temporarily unavailable.
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setModalStep('details');
    setApplyDraft(profileDefaults);
    setApplicationMessage('');
  };

  const handleReplaceFile = (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setApplyDraft((prev) => ({ ...prev, [field]: file.name }));
  };

  const resetToPrefilled = () => {
    setApplyDraft(profileDefaults);
  };

  const handleApply = async () => {
    if (!applyDraft.resumeFile || !applyDraft.graduationMarksheetFile) {
      setApplicationMessage('Resume and graduation marksheet are required to apply.');
      return;
    }

    if (!applyDraft.declarationAccepted) {
      setApplicationMessage('Please verify and accept declaration before applying.');
      return;
    }

    try {
      await studentAPI.applyForJob(selectedJob.id);
      setAppliedJobIds((prev) => new Set([...prev, String(selectedJob.id)]));
      setApplicationMessage('Application submitted successfully with verified profile documents.');
      setTimeout(() => {
        setSelectedJob(null);
        setApplicationMessage('');
      }, 800);
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Unable to submit application. Please try again.';
      if (String(detail).toLowerCase().includes('already applied')) {
        setAppliedJobIds((prev) => new Set([...prev, String(selectedJob.id)]));
      }
      setApplicationMessage(detail);
    }
  };

  const handleModalConfirm = () => {
    if (modalStep === 'details') {
      setModalStep('apply');
      return;
    }
    handleApply();
  };

  const handleFilterReset = () => {
    setFilters({
      searchQuery: '',
      companyName: 'all',
      location: 'all',
      skill: 'all',
      minCtc: 0,
    });
  };

  return (
    <div className="job-listings">
      <StudentTopPanel
        title="Available Job Openings"
        subtitle="Filter quickly, verify profile documents, and apply with prefilled data in one flow."
        kicker="Student Jobs"
        stats={[
          { label: 'Available Jobs', value: filteredJobs.length },
          { label: 'Profile CGPA', value: String(studentCgpa) },
          { label: 'Current Cycle', value: '2026' },
          { label: 'Filters Applied', value: Object.values(filters).some((value) => value && value !== 'all' && value !== 0) ? 'Yes' : 'No' },
        ]}
      />

      <Card title="Smart Filters" className="filter-card colorful-filter-card">
        <div className="filter-grid enhanced-filter-grid">
          <div className="filter-group">
            <label>Search Job</label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Company or position"
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>Company</label>
            <select
              className="form-input"
              value={filters.companyName}
              onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
            >
              <option value="all">All Companies</option>
              {companyOptions.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select
              className="form-input"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="all">All Locations</option>
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Skill</label>
            <select
              className="form-input"
              value={filters.skill}
              onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
            >
              <option value="all">All Skills</option>
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Minimum CTC (LPA)</label>
            <input
              type="number"
              min="0"
              max="50"
              className="form-input"
              value={filters.minCtc}
              onChange={(e) => setFilters({ ...filters, minCtc: Number(e.target.value) || 0 })}
            />
          </div>

          <div className="filter-group filter-action-group">
            <button type="button" className="btn btn-outlined filter-reset-btn" onClick={handleFilterReset}>
              Reset Filters
            </button>
          </div>
        </div>
      </Card>

      <div className="jobs-count">
        <p>{filteredJobs.length} job(s) found</p>
      </div>

      <div className="jobs-grid">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="job-card card-interactive">
            {appliedJobIds.has(String(job.id)) && (
              <div className="status-badge status-applied">Applied</div>
            )}
            <div className="job-header">
              <div className="job-title-section">
                <h3>{job.position}</h3>
                <p className="company-name">{job.company}</p>
              </div>
              <span className="ctc-badge">{job.ctc}</span>
            </div>

            <div className="job-quick-details">
              <div className="detail-row">
                <span className="detail-label">📍 Locations:</span>
                <span className="detail-value">{job.locations?.join(', ') || 'TBD'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">⏰ Deadline:</span>
                <span className="detail-value">{formatDate(job.deadline)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📊 Min CGPA:</span>
                <span className="detail-value">{job.minCGPA}</span>
              </div>
              {job.skills?.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">🛠️ Skills:</span>
                  <span className="detail-value">{job.skills.slice(0, 3).join(', ')}{job.skills.length > 3 ? '...' : ''}</span>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-small btn-full"
              onClick={() => handleOpenApply(job)}
              disabled={!isEligible(job) || appliedJobIds.has(String(job.id))}
            >
              {appliedJobIds.has(String(job.id)) ? 'Applied' : 'View & Apply'}
            </button>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedJob}
        title={selectedJob ? `${selectedJob.position} - Apply` : 'Apply'}
        onClose={() => {
          setSelectedJob(null);
          setModalStep('details');
        }}
        onConfirm={handleModalConfirm}
        confirmText={modalStep === 'details' ? 'Continue to Apply' : 'Verify & Apply'}
      >
        {selectedJob && (
          <div className="job-detail-modal enhanced-job-modal">
            <div className="modal-step-tabs">
              <button
                type="button"
                className={`step-tab ${modalStep === 'details' ? 'active' : ''}`}
                onClick={() => setModalStep('details')}
              >
                1. Job Details & Documents
              </button>
              <button
                type="button"
                className={`step-tab ${modalStep === 'apply' ? 'active' : ''}`}
                onClick={() => setModalStep('apply')}
              >
                2. Verify & Apply
              </button>
            </div>

            <div className="modal-highlight-bar">
              <span>{selectedJob.company}</span>
              <span>{selectedJob.ctc}</span>
              <span>Deadline: {formatDate(selectedJob.deadline)}</span>
            </div>

            {modalStep === 'details' ? (
              <>
                <div className="modal-section">
                  <h4>Job Summary</h4>
                  {(() => {
                    const { plainDescription, metadata } = extractJobMetadata(selectedJob.description);
                    return (
                      <>
                        <p>{plainDescription || 'No description available'}</p>
                        {metadata.openings && (
                          <div className="job-details-grid">
                            <div className="detail-item">
                              <span className="detail-label">Openings</span>
                              <span className="detail-value">{metadata.openings}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Salary</span>
                              <span className="detail-value">{selectedJob.ctc}</span>
                            </div>
                            {metadata.bondDurationMonths > 0 && (
                              <div className="detail-item">
                                <span className="detail-label">Bond Duration</span>
                                <span className="detail-value">{metadata.bondDurationMonths} months</span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="criteria-grid">
                  <div className="criteria-card">
                    <span>Required CGPA</span>
                      <strong>{selectedJob.minCGPA ?? 'Department specific'}</strong>
                  </div>
                  <div className="criteria-card">
                    <span>Your CGPA</span>
                    <strong>{applyDraft.cgpa}</strong>
                  </div>
                  <div className="criteria-card">
                    <span>Eligibility</span>
                      <strong>{isEligible(selectedJob) ? 'Eligible' : 'Not Eligible'}</strong>
                  </div>
                </div>

                <div className="modal-section">
                  <h4>Bond Agreement</h4>
                  {(() => {
                    const { metadata } = extractJobMetadata(selectedJob.description);
                    return (
                      <>
                        <p>
                          {metadata.bondDurationMonths > 0
                            ? `Required (${metadata.bondDurationMonths} months)`
                            : 'Not required'}
                        </p>
                        <p>{metadata.bondDetails || 'No bond details available.'}</p>
                      </>
                    );
                  })()}
                </div>

                <div className="modal-section">
                  <h4>Selection Process</h4>
                  {(() => {
                    const { metadata } = extractJobMetadata(selectedJob.description);
                    const rounds = metadata.roundSchedule || [];
                    return rounds.length > 0 ? (
                      <ol className="process-list">
                        {rounds.map((round, idx) => (
                          <li key={idx}>
                            {round.name} - {round.date} at {round.time} ({round.mode})
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p>Selection process details will be shared by TPO.</p>
                    );
                  })()}
                </div>

                <div className="modal-section">
                  <h4>Required PDFs & Documents</h4>
                  <div className="required-docs-list">
                    {(() => {
                      const { metadata } = extractJobMetadata(selectedJob.description);
                      const requiredDocs = metadata.requiredDocuments || selectedJob.documents || [];
                      return requiredDocs.length > 0 ? (
                        requiredDocs.map((doc, idx) => {
                          const url = doc.url || '#';
                          const label = doc.label || doc;
                          return (
                            <a 
                              key={idx} 
                              href={url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="required-doc-item"
                              title={url !== '#' ? 'Click to open PDF' : 'Document link not available'}
                            >
                              <span className="doc-label-text">📄 {label}</span>
                              <span className="doc-type-badge">PDF</span>
                            </a>
                          );
                        })
                      ) : (
                        <p className="no-docs-message">No documents specified for this job.</p>
                      );
                    })()}
                  </div>
                </div>

                <p className="tpo-note">
                  <strong>TPO Note:</strong> {selectedJob.tpoNote}
                </p>
              </>
            ) : (
              <div className="modal-section application-verify-section">
                <div className="verify-head">
                  <h4>Profile Verification Before Apply</h4>
                  <button type="button" className="btn btn-outlined btn-small" onClick={resetToPrefilled}>
                    Use Prefilled Data
                  </button>
                </div>

                <div className="verify-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      className="form-input"
                      value={applyDraft.fullName}
                      onChange={(e) => setApplyDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>College Email</label>
                    <input
                      className="form-input"
                      value={applyDraft.collegeEmail}
                      onChange={(e) => setApplyDraft((prev) => ({ ...prev, collegeEmail: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      className="form-input"
                      value={applyDraft.phone}
                      onChange={(e) => setApplyDraft((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>CGPA</label>
                    <input
                      className="form-input"
                      value={applyDraft.cgpa}
                      onChange={(e) => setApplyDraft((prev) => ({ ...prev, cgpa: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="doc-grid">
                  <div className="doc-tile">
                    <span className="doc-label">Resume</span>
                    <strong>{applyDraft.resumeFile || 'Not uploaded'}</strong>
                    <label className="btn btn-outlined btn-small upload-doc-btn">
                      Replace
                      <input type="file" hidden onChange={(e) => handleReplaceFile('resumeFile', e)} />
                    </label>
                  </div>

                  <div className="doc-tile">
                    <span className="doc-label">10th Marksheet</span>
                    <strong>{applyDraft.tenthMarksheetFile || 'Not uploaded'}</strong>
                    <label className="btn btn-outlined btn-small upload-doc-btn">
                      Replace
                      <input type="file" hidden onChange={(e) => handleReplaceFile('tenthMarksheetFile', e)} />
                    </label>
                  </div>

                  <div className="doc-tile">
                    <span className="doc-label">12th Marksheet</span>
                    <strong>{applyDraft.twelfthMarksheetFile || 'Not uploaded'}</strong>
                    <label className="btn btn-outlined btn-small upload-doc-btn">
                      Replace
                      <input type="file" hidden onChange={(e) => handleReplaceFile('twelfthMarksheetFile', e)} />
                    </label>
                  </div>

                  <div className="doc-tile">
                    <span className="doc-label">Graduation Marksheet</span>
                    <strong>{applyDraft.graduationMarksheetFile || 'Not uploaded'}</strong>
                    <label className="btn btn-outlined btn-small upload-doc-btn">
                      Replace
                      <input type="file" hidden onChange={(e) => handleReplaceFile('graduationMarksheetFile', e)} />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Note for Recruiter (Optional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={applyDraft.note}
                    onChange={(e) => setApplyDraft((prev) => ({ ...prev, note: e.target.value }))}
                    placeholder="Add any project or achievement highlight"
                  />
                </div>

                <label className="verify-check">
                  <input
                    type="checkbox"
                    checked={applyDraft.declarationAccepted}
                    onChange={(e) =>
                      setApplyDraft((prev) => ({ ...prev, declarationAccepted: e.target.checked }))
                    }
                  />
                  I verify all details and documents are correct for this application.
                </label>
              </div>
            )}

            {applicationMessage && <p className="apply-message">{applicationMessage}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentJobListings;
