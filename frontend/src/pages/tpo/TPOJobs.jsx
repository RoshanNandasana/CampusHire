import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import './TPOJobs.css';

const REQUESTS_STORAGE_KEY = 'campusHireCompanyRequests';
const STUDENT_JOBS_STORAGE_KEY = 'campusHireApprovedStudentJobs';
const COLLEGE_RULES_STORAGE_KEY = 'campusHireCollegeEligibilityRules';

const BASE_REQUIRED_DOCUMENTS = [
  'Resume PDF',
  '10th Marksheet PDF',
  '12th Marksheet PDF',
  'Graduation Marksheet PDF',
  'Job Description PDF',
  'Eligibility Rules PDF',
  'Bond Agreement PDF',
];

const getRequiredDocuments = (bondDurationMonths) =>
  BASE_REQUIRED_DOCUMENTS.filter((doc) => (bondDurationMonths > 0 ? true : doc !== 'Bond Agreement PDF'));

const normalizeRequest = (request) => ({
  ...request,
  requiredDocuments:
    Array.isArray(request.requiredDocuments) && request.requiredDocuments.length
      ? request.requiredDocuments
      : getRequiredDocuments(request.bondDurationMonths),
  tpoExtraNotice: request.tpoExtraNotice || '',
});

const PREFILLED_COMPANY_REQUESTS = [
  {
    id: 1,
    company: 'Google',
    position: 'Software Engineer',
    openings: 24,
    location: 'Bangalore',
    ctc: '20 LPA',
    minCGPA: 7.5,
    skills: ['DSA', 'JavaScript', 'System Design'],
    bondDurationMonths: 0,
    bondDetails: 'No bond. Standard offer terms apply.',
    driveDate: '2026-04-24',
    deadline: '2026-04-20',
    contactName: 'Ananya Mehta',
    contactRole: 'University Relations Lead',
    contactEmail: 'ananya.mehta@google.com',
    contactPhone: '+91 98111 22550',
    description: 'Campus hiring for software roles in backend and product engineering teams.',
    selectionProcess: ['Online coding test', 'Technical interviews', 'HR discussion'],
    requiredDocuments: getRequiredDocuments(0),
    tpoExtraNotice: '',
    approvalStatus: 'pending',
  },
  {
    id: 2,
    company: 'Infosys',
    position: 'Software Developer',
    openings: 60,
    location: 'Pune',
    ctc: '8 LPA',
    minCGPA: 6.5,
    skills: ['Java', 'DBMS', 'OOPS'],
    bondDurationMonths: 12,
    bondDetails: 'One-year service bond for fresh graduate onboarding.',
    driveDate: '2026-04-28',
    deadline: '2026-04-25',
    contactName: 'Ravi Kulkarni',
    contactRole: 'Talent Acquisition Manager',
    contactEmail: 'ravi.kulkarni@infosys.com',
    contactPhone: '+91 98222 10045',
    description: 'Large-scale campus hiring for software developer roles across business units.',
    selectionProcess: ['Aptitude test', 'Technical interview', 'HR interview'],
    requiredDocuments: getRequiredDocuments(12),
    tpoExtraNotice: '',
    approvalStatus: 'approved',
  },
  {
    id: 3,
    company: 'Deloitte',
    position: 'Business Analyst',
    openings: 18,
    location: 'Delhi',
    ctc: '10 LPA',
    minCGPA: 7.0,
    skills: ['Excel', 'Analytics', 'Communication'],
    bondDurationMonths: 0,
    bondDetails: 'No bond required for this role.',
    driveDate: '2026-05-02',
    deadline: '2026-04-29',
    contactName: 'Shruti Jain',
    contactRole: 'Campus Program Manager',
    contactEmail: 'shruti.jain@deloitte.com',
    contactPhone: '+91 99201 66772',
    description: 'Hiring for analyst positions with focus on consulting and digital delivery.',
    selectionProcess: ['Aptitude round', 'Case interview', 'HR round'],
    requiredDocuments: getRequiredDocuments(0),
    tpoExtraNotice: '',
    approvalStatus: 'pending',
  },
  {
    id: 4,
    company: 'TCS',
    position: 'Systems Engineer',
    openings: 120,
    location: 'Chennai',
    ctc: '7 LPA',
    minCGPA: 6.0,
    skills: ['Programming Basics', 'SQL', 'Communication'],
    bondDurationMonths: 24,
    bondDetails: 'Two-year bond with training and project deployment clause.',
    driveDate: '2026-05-05',
    deadline: '2026-05-01',
    contactName: 'Priyanka Sharma',
    contactRole: 'Regional Recruitment SPOC',
    contactEmail: 'priyanka.sharma@tcs.com',
    contactPhone: '+91 98900 88310',
    description: 'Pan-campus hiring for systems engineer role open for multiple departments.',
    selectionProcess: ['National qualifier test', 'Technical + managerial round', 'HR round'],
    requiredDocuments: getRequiredDocuments(24),
    tpoExtraNotice: '',
    approvalStatus: 'rejected',
  },
];

const TARGET_COMPANIES_THIS_SEMESTER = 12;

const DEFAULT_COLLEGE_RULES = {
  minCGPA: 6,
  maxOffersPerStudent: 2,
};

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const getStatusClass = (status) => {
  if (status === 'approved') return 'status-approved';
  if (status === 'rejected') return 'status-rejected';
  return 'status-pending';
};

const getStatusLabel = (status) => {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
};

const mapApprovedCompanyToStudentJob = (company, collegeRules) => ({
  id: Number(`${company.id}${company.openings}`),
  company: company.company,
  position: company.position,
  description: company.description,
  minCGPA: Math.max(Number(company.minCGPA), Number(collegeRules.minCGPA)),
  skills: company.skills,
  ctc: company.ctc,
  locations: [company.location],
  deadline: company.deadline,
  bondAgreement: {
    required: company.bondDurationMonths > 0,
    durationMonths: company.bondDurationMonths,
    details: company.bondDetails,
  },
  selectionProcess: company.selectionProcess,
  documents: company.requiredDocuments.map((doc) => ({ label: doc, url: '#', type: 'PDF' })),
  tpoNote: `Approved by TPO. Branch-specific rules applied: Min CGPA ${collegeRules.minCGPA}, Max Offers ${collegeRules.maxOffersPerStudent}. Drive date: ${formatDate(company.driveDate)}. Contact: ${company.contactName}.${company.tpoExtraNotice ? ` Notice: ${company.tpoExtraNotice}` : ''}`,
  tpoCoordinator: 'Campus TPO Office',
});

const TPOJobs = () => {
  const [requests, setRequests] = useState(() => {
    const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeRequest);
        }
      } catch (error) {
        return PREFILLED_COMPANY_REQUESTS;
      }
    }
    return PREFILLED_COMPANY_REQUESTS.map(normalizeRequest);
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [collegeRules, setCollegeRules] = useState(() => {
    const storedRules = localStorage.getItem(COLLEGE_RULES_STORAGE_KEY);
    if (storedRules) {
      try {
        const parsedRules = JSON.parse(storedRules);
        if (parsedRules && typeof parsedRules === 'object') {
          return {
            minCGPA: Number(parsedRules.minCGPA) || DEFAULT_COLLEGE_RULES.minCGPA,
            maxOffersPerStudent:
              Number(parsedRules.maxOffersPerStudent) || DEFAULT_COLLEGE_RULES.maxOffersPerStudent,
          };
        }
      } catch (error) {
        return DEFAULT_COLLEGE_RULES;
      }
    }
    return DEFAULT_COLLEGE_RULES;
  });

  useEffect(() => {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    localStorage.setItem(COLLEGE_RULES_STORAGE_KEY, JSON.stringify(collegeRules));

    const approvedJobs = requests
      .filter((request) => request.approvalStatus === 'approved')
      .map((request) => mapApprovedCompanyToStudentJob(request, collegeRules));

    localStorage.setItem(STUDENT_JOBS_STORAGE_KEY, JSON.stringify(approvedJobs));
  }, [requests, collegeRules]);

  const stats = useMemo(() => {
    const approved = requests.filter((request) => request.approvalStatus === 'approved').length;
    const pending = requests.filter((request) => request.approvalStatus === 'pending').length;
    const rejected = requests.filter((request) => request.approvalStatus === 'rejected').length;

    return {
      totalRequests: requests.length,
      approved,
      pending,
      rejected,
      targetRemaining: Math.max(TARGET_COMPANIES_THIS_SEMESTER - approved, 0),
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchQuery = search.trim().toLowerCase();
      const matchesSearch =
        !searchQuery ||
        request.company.toLowerCase().includes(searchQuery) ||
        request.position.toLowerCase().includes(searchQuery) ||
        request.contactName.toLowerCase().includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || request.approvalStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const handleApprovalChange = (requestId, newStatus) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              approvalStatus: newStatus,
            }
          : request
      )
    );

    if (newStatus === 'approved') {
      setFeedbackMessage('Company approved. It is now visible on the student jobs panel.');
      return;
    }

    setFeedbackMessage('Company status updated successfully.');
  };

  const openCompanyDetails = (request) => {
    setSelectedCompany(request);
    setEditDraft({
      openings: request.openings,
      minCGPA: request.minCGPA,
      driveDate: request.driveDate,
      deadline: request.deadline,
      contactName: request.contactName,
      contactRole: request.contactRole,
      contactEmail: request.contactEmail,
      contactPhone: request.contactPhone,
      bondDetails: request.bondDetails,
      requiredDocuments: request.requiredDocuments,
      tpoExtraNotice: request.tpoExtraNotice || '',
    });
  };

  const handleDraftValueChange = (key, value) => {
    setEditDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDocumentToggle = (documentName) => {
    setEditDraft((prev) => {
      const hasDocument = prev.requiredDocuments.includes(documentName);
      if (hasDocument) {
        return {
          ...prev,
          requiredDocuments: prev.requiredDocuments.filter((item) => item !== documentName),
        };
      }

      return {
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, documentName],
      };
    });
  };

  const handleSaveCompanyEdits = () => {
    if (!selectedCompany || !editDraft) return;

    if (!editDraft.requiredDocuments.length) {
      setFeedbackMessage('Please keep at least one required PDF document for student application.');
      return;
    }

    const updatedCompany = {
      ...selectedCompany,
      openings: Number(editDraft.openings) || 0,
      minCGPA: Number(editDraft.minCGPA) || 0,
      driveDate: editDraft.driveDate,
      deadline: editDraft.deadline,
      contactName: editDraft.contactName.trim(),
      contactRole: editDraft.contactRole.trim(),
      contactEmail: editDraft.contactEmail.trim(),
      contactPhone: editDraft.contactPhone.trim(),
      bondDetails: editDraft.bondDetails.trim(),
      requiredDocuments: editDraft.requiredDocuments,
      tpoExtraNotice: editDraft.tpoExtraNotice.trim(),
    };

    setRequests((prev) =>
      prev.map((request) => (request.id === selectedCompany.id ? updatedCompany : request))
    );
    setSelectedCompany(updatedCompany);
    setFeedbackMessage(`Saved updates for ${updatedCompany.company}.`);
  };

  return (
    <div className="tpo-jobs-simple">
      <div className="jobs-simple-header">
        <h1>Company Approval Panel</h1>
        <p>
          Keep this simple: review prefilled company requests, approve entries, and publish only approved drives to students.
        </p>
      </div>

      {feedbackMessage && <p className="jobs-feedback">{feedbackMessage}</p>}

      <div className="jobs-simple-stats">
        <Card className="stat-card stat-blue">
          <span className="stat-label">Target Companies</span>
          <strong>{TARGET_COMPANIES_THIS_SEMESTER}</strong>
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
          <span className="stat-label">Still Needed</span>
          <strong>{stats.targetRemaining}</strong>
        </Card>
      </div>

      <Card title="College Eligibility Rules (Manage Here)" className="jobs-rules-card">
        <p className="rules-note">
          No separate eligibility panel is needed. This is a single-branch TPO panel, so configure branch-level eligibility here.
        </p>

        <div className="rules-grid">
          <div className="form-group">
            <label>Global Minimum CGPA</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="10"
              step="0.1"
              value={collegeRules.minCGPA}
              onChange={(event) =>
                setCollegeRules((prev) => ({
                  ...prev,
                  minCGPA: Number(event.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>Max Offers Per Student</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={collegeRules.maxOffersPerStudent}
              onChange={(event) =>
                setCollegeRules((prev) => ({
                  ...prev,
                  maxOffersPerStudent: Number(event.target.value) || 1,
                }))
              }
            />
          </div>
        </div>
      </Card>

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
                <th>Openings</th>
                <th>Skills Required</th>
                <th>Bond</th>
                <th>Contact Person</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
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
                      <strong>{request.company}</strong>
                      <p>{request.location}</p>
                    </td>
                    <td>
                      <strong>{request.position}</strong>
                      <p>CTC: {request.ctc}</p>
                    </td>
                    <td>{request.openings}</td>
                    <td>
                      <div className="skills-list">
                        {request.skills.map((skill) => (
                          <span key={`${request.id}-${skill}`} className="skill-chip">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      {request.bondDurationMonths > 0
                        ? `${request.bondDurationMonths} months`
                        : 'No bond'}
                    </td>
                    <td>
                      <strong>{request.contactName}</strong>
                      <p>{request.contactRole}</p>
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusClass(request.approvalStatus)}`}>
                        {getStatusLabel(request.approvalStatus)}
                      </span>
                    </td>
                    <td>
                      <div className="jobs-action-group">
                        <button type="button" className="btn btn-outlined btn-small" onClick={() => openCompanyDetails(request)}>
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-small"
                          onClick={() => handleApprovalChange(request.id, 'approved')}
                          disabled={request.approvalStatus === 'approved'}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => handleApprovalChange(request.id, 'rejected')}
                          disabled={request.approvalStatus === 'rejected'}
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

      <Modal
        isOpen={!!selectedCompany}
        title={selectedCompany ? `${selectedCompany.company} - Company Details` : 'Company Details'}
        onClose={() => {
          setSelectedCompany(null);
          setEditDraft(null);
        }}
        closeText="Close"
      >
        {selectedCompany && editDraft && (
          <div className="company-detail-modal">
            <div className="detail-grid">
              <div className="detail-item">
                <span>Position</span>
                <strong>{selectedCompany.position}</strong>
              </div>
              <div className="detail-item">
                <span>Openings</span>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={editDraft.openings}
                  onChange={(event) => handleDraftValueChange('openings', event.target.value)}
                />
              </div>
              <div className="detail-item">
                <span>CTC</span>
                <strong>{selectedCompany.ctc}</strong>
              </div>
              <div className="detail-item">
                <span>Minimum CGPA</span>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="10"
                  step="0.1"
                  value={editDraft.minCGPA}
                  onChange={(event) => handleDraftValueChange('minCGPA', event.target.value)}
                />
              </div>
              <div className="detail-item">
                <span>Drive Date</span>
                <input
                  type="date"
                  className="form-input"
                  value={editDraft.driveDate}
                  onChange={(event) => handleDraftValueChange('driveDate', event.target.value)}
                />
              </div>
              <div className="detail-item">
                <span>Application Deadline</span>
                <input
                  type="date"
                  className="form-input"
                  value={editDraft.deadline}
                  onChange={(event) => handleDraftValueChange('deadline', event.target.value)}
                />
              </div>
            </div>

            <div className="detail-block">
              <h4>Required Skills</h4>
              <div className="skills-list">
                {selectedCompany.skills.map((skill) => (
                  <span key={`modal-${skill}`} className="skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <h4>Bond Details</h4>
              <textarea
                className="form-input"
                rows={2}
                value={editDraft.bondDetails}
                onChange={(event) => handleDraftValueChange('bondDetails', event.target.value)}
              />
            </div>

            <div className="detail-block">
              <h4>Company Contact Person</h4>
              <div className="contact-edit-grid">
                <input
                  type="text"
                  className="form-input"
                  value={editDraft.contactName}
                  onChange={(event) => handleDraftValueChange('contactName', event.target.value)}
                  placeholder="Contact name"
                />
                <input
                  type="text"
                  className="form-input"
                  value={editDraft.contactRole}
                  onChange={(event) => handleDraftValueChange('contactRole', event.target.value)}
                  placeholder="Contact role"
                />
                <input
                  type="email"
                  className="form-input"
                  value={editDraft.contactEmail}
                  onChange={(event) => handleDraftValueChange('contactEmail', event.target.value)}
                  placeholder="Contact email"
                />
                <input
                  type="text"
                  className="form-input"
                  value={editDraft.contactPhone}
                  onChange={(event) => handleDraftValueChange('contactPhone', event.target.value)}
                  placeholder="Contact phone"
                />
              </div>
            </div>

            <div className="detail-block">
              <h4>Student Required PDFs (For TPO Verification)</h4>
              <p className="detail-note">Select the PDFs that students must provide while applying.</p>
              <div className="doc-check-grid">
                {BASE_REQUIRED_DOCUMENTS.map((documentName) => {
                  const checked = editDraft.requiredDocuments.includes(documentName);
                  return (
                    <label key={documentName} className="doc-check-item">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleDocumentToggle(documentName)}
                      />
                      {documentName}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="detail-block">
              <h4>Additional Company Notice (Optional)</h4>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Add custom instructions or notice for this company."
                value={editDraft.tpoExtraNotice}
                onChange={(event) => handleDraftValueChange('tpoExtraNotice', event.target.value)}
              />
            </div>

            <div className="detail-block">
              <h4>Selection Process</h4>
              <ol>
                {selectedCompany.selectionProcess.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="detail-block">
              <h4>Company Brief</h4>
              <p>{selectedCompany.description}</p>
            </div>

            <div className="modal-actions-inline">
              <button type="button" className="btn btn-primary" onClick={handleSaveCompanyEdits}>
                Save Company Updates
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TPOJobs;
