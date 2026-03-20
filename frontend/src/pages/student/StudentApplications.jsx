import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StudentTopPanel from '../../components/student/StudentTopPanel';
import { studentAPI } from '../../services/api';
import {
  MdCardGiftcard,
  MdClear,
  MdInfoOutline,
  MdPhoneInTalk,
  MdRadioButtonUnchecked,
  MdStar,
} from 'react-icons/md';
import './StudentApplications.css';

const StudentApplications = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [applications, setApplications] = useState([
    {
      id: 1,
      applicationId: 'APP-2024-0015',
      jobId: 'JOB-GGL-114',
      company: 'Google',
      position: 'Software Engineer',
      appliedDate: '2024-01-15',
      status: 'shortlisted',
      workMode: 'Hybrid',
      employmentType: 'Full Time',
      location: 'Bangalore',
      ctc: '20 LPA',
      deadline: '2024-01-18',
      lastUpdated: '2024-01-22',
      source: 'Campus Placement Cell',
      eligibility: 'Eligible (CGPA 8.2 / Required 7.5)',
      requiredSkills: ['Python', 'JavaScript', 'DSA', 'System Design'],
      selectionProcess: ['Online Assessment', 'Technical Interview 1', 'Technical Interview 2', 'HR Interview'],
      bondPolicy: 'Required (12 months)',
      tpoCoordinator: 'Dr. R. Sharma',
      recruiter: {
        name: 'Anita Rao',
        email: 'anita.rao@google.com',
        phone: '+91 90000 11111',
      },
      documents: [
        { name: 'Resume', submittedOn: '2024-01-15', status: 'Verified' },
        { name: 'Academic Transcript', submittedOn: '2024-01-15', status: 'Verified' },
        { name: 'Government ID', submittedOn: '2024-01-15', status: 'Pending Verification' },
      ],
      interviews: [
        {
          round: 'Technical Interview - 1',
          date: '2024-02-05',
          time: '10:30 AM',
          mode: 'Online (Google Meet)',
          status: 'Scheduled',
          panel: 'SWE Hiring Team',
        },
      ],
      timeline: [
        { status: 'Applied', date: '2024-01-15', completed: true, note: 'Application submitted successfully.' },
        { status: 'Shortlisted', date: '2024-01-22', completed: true, note: 'Profile shortlisted by recruiter.' },
        {
          status: 'Technical Interview',
          date: null,
          expectedDate: '2024-02-05',
          completed: false,
          note: 'Interview slot has been scheduled.',
        },
        {
          status: 'HR Round',
          date: null,
          expectedDate: '2024-02-12',
          completed: false,
          note: 'Will be shared after technical round.',
        },
        { status: 'Offer', date: null, expectedDate: null, completed: false, note: 'Pending final decision.' },
      ],
      history: [
        { label: 'Application submitted', dateTime: '2024-01-15T09:40:00' },
        { label: 'Documents reviewed by placement cell', dateTime: '2024-01-16T11:15:00' },
        { label: 'Shortlisted by recruiter', dateTime: '2024-01-22T16:10:00' },
      ],
    },
    {
      id: 2,
      applicationId: 'APP-2024-0010',
      jobId: 'JOB-MSF-067',
      company: 'Microsoft',
      position: 'Product Manager',
      appliedDate: '2024-01-10',
      status: 'interview',
      workMode: 'Onsite',
      employmentType: 'Full Time',
      location: 'Hyderabad',
      ctc: '18 LPA',
      deadline: '2024-01-12',
      lastUpdated: '2024-02-01',
      source: 'Campus Placement Cell',
      eligibility: 'Eligible (CGPA 8.2 / Required 7.0)',
      requiredSkills: ['Product Thinking', 'Analytics', 'Communication', 'Leadership'],
      selectionProcess: ['Case Study Round', 'Technical Discussion', 'HR Interview'],
      bondPolicy: 'Not required',
      tpoCoordinator: 'Prof. Neha Soni',
      recruiter: {
        name: 'Ritika Sharma',
        email: 'ritika.sharma@microsoft.com',
        phone: '+91 90000 22222',
      },
      documents: [
        { name: 'Resume', submittedOn: '2024-01-10', status: 'Verified' },
        { name: 'Academic Transcript', submittedOn: '2024-01-10', status: 'Verified' },
        { name: 'Portfolio Link', submittedOn: '2024-01-10', status: 'Verified' },
      ],
      interviews: [
        {
          round: 'Technical Interview',
          date: '2024-02-01',
          time: '09:30 AM',
          mode: 'Online (Teams)',
          status: 'Completed',
          panel: 'Product Engineering Team',
        },
        {
          round: 'HR Round',
          date: '2024-02-15',
          time: '02:00 PM',
          mode: 'Online (Teams)',
          status: 'Scheduled',
          panel: 'HR Business Partner',
        },
      ],
      timeline: [
        { status: 'Applied', date: '2024-01-10', completed: true, note: 'Application submitted successfully.' },
        { status: 'Shortlisted', date: '2024-01-18', completed: true, note: 'Shortlisted for PM process.' },
        { status: 'Technical Interview', date: '2024-02-01', completed: true, note: 'Round completed.' },
        {
          status: 'HR Round',
          date: null,
          expectedDate: '2024-02-15',
          completed: false,
          note: 'Interview invite shared via email.',
        },
        { status: 'Offer', date: null, expectedDate: null, completed: false, note: 'Awaiting final result.' },
      ],
      history: [
        { label: 'Application submitted', dateTime: '2024-01-10T08:55:00' },
        { label: 'Shortlisted for PM role', dateTime: '2024-01-18T15:20:00' },
        { label: 'Technical interview completed', dateTime: '2024-02-01T11:05:00' },
      ],
    },
    {
      id: 3,
      applicationId: 'APP-2024-0005',
      jobId: 'JOB-AMZ-039',
      company: 'Amazon',
      position: 'Data Engineer',
      appliedDate: '2024-01-05',
      status: 'offer',
      workMode: 'Hybrid',
      employmentType: 'Full Time',
      location: 'Bangalore',
      ctc: '16 LPA',
      deadline: '2024-01-08',
      lastUpdated: '2024-02-10',
      source: 'Campus Placement Cell',
      eligibility: 'Eligible (CGPA 8.2 / Required 6.5)',
      requiredSkills: ['SQL', 'Python', 'ETL', 'Data Modeling'],
      selectionProcess: ['Coding Round', 'Technical Interview', 'HR Interview'],
      bondPolicy: 'Required (18 months)',
      tpoCoordinator: 'Dr. R. Sharma',
      recruiter: {
        name: 'Kunal Mehta',
        email: 'kunal.mehta@amazon.com',
        phone: '+91 90000 33333',
      },
      documents: [
        { name: 'Resume', submittedOn: '2024-01-05', status: 'Verified' },
        { name: 'Academic Transcript', submittedOn: '2024-01-05', status: 'Verified' },
        { name: 'Internship Certificate', submittedOn: '2024-01-06', status: 'Verified' },
      ],
      interviews: [
        {
          round: 'Technical Interview - 1',
          date: '2024-01-25',
          time: '11:00 AM',
          mode: 'Online',
          status: 'Completed',
          panel: 'Data Platform Team',
        },
        {
          round: 'HR Round',
          date: '2024-02-08',
          time: '03:30 PM',
          mode: 'Online',
          status: 'Completed',
          panel: 'Talent Acquisition',
        },
      ],
      timeline: [
        { status: 'Applied', date: '2024-01-05', completed: true, note: 'Application submitted successfully.' },
        { status: 'Shortlisted', date: '2024-01-12', completed: true, note: 'Profile shortlisted.' },
        { status: 'Technical Interview', date: '2024-01-25', completed: true, note: 'Technical round cleared.' },
        { status: 'HR Round', date: '2024-02-08', completed: true, note: 'HR discussion completed.' },
        { status: 'Offer', date: '2024-02-10', completed: true, note: 'Offer released by recruiter.' },
      ],
      history: [
        { label: 'Application submitted', dateTime: '2024-01-05T10:05:00' },
        { label: 'Shortlisted', dateTime: '2024-01-12T14:00:00' },
        { label: 'Offer released', dateTime: '2024-02-10T12:20:00' },
      ],
    },
    {
      id: 4,
      applicationId: 'APP-2024-0020',
      jobId: 'JOB-TCS-204',
      company: 'TCS',
      position: 'Systems Engineer',
      appliedDate: '2024-01-20',
      status: 'applied',
      workMode: 'Onsite',
      employmentType: 'Full Time',
      location: 'Pune',
      ctc: '8 LPA',
      deadline: '2024-01-22',
      lastUpdated: '2024-01-20',
      source: 'Campus Placement Cell',
      eligibility: 'Eligible (CGPA 8.2 / Required 6.0)',
      requiredSkills: ['Java', 'SQL', 'OOPS', 'Aptitude'],
      selectionProcess: ['Aptitude Test', 'Technical Interview', 'HR Interview'],
      bondPolicy: 'Required (24 months)',
      tpoCoordinator: 'Prof. Rahul Desai',
      recruiter: {
        name: 'Megha Iyer',
        email: 'megha.iyer@tcs.com',
        phone: '+91 90000 44444',
      },
      documents: [
        { name: 'Resume', submittedOn: '2024-01-20', status: 'Verified' },
        { name: 'Academic Transcript', submittedOn: '2024-01-20', status: 'Pending Verification' },
      ],
      interviews: [],
      timeline: [
        { status: 'Applied', date: '2024-01-20', completed: true, note: 'Application submitted successfully.' },
        { status: 'Shortlisted', date: null, expectedDate: '2024-01-28', completed: false, note: 'Awaiting recruiter shortlist.' },
        { status: 'Technical Interview', date: null, expectedDate: null, completed: false, note: 'Will be scheduled after shortlist.' },
        { status: 'HR Round', date: null, expectedDate: null, completed: false, note: 'Pending technical clearance.' },
        { status: 'Offer', date: null, expectedDate: null, completed: false, note: 'Pending final result.' },
      ],
      history: [
        { label: 'Application submitted', dateTime: '2024-01-20T09:20:00' },
        { label: 'Profile under review', dateTime: '2024-01-20T17:40:00' },
      ],
    },
  ]);

  const formatDate = (value) => {
    if (!value) return 'Pending';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
  };

  const formatDateTime = (value) => {
    if (!value) return 'Pending';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'applied':
        return 'badge badge-info';
      case 'shortlisted':
        return 'badge badge-warning';
      case 'interview':
        return 'badge badge-info';
      case 'offer':
        return 'badge badge-success';
      case 'rejected':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return MdRadioButtonUnchecked;
      case 'shortlisted':
        return MdStar;
      case 'interview':
        return MdPhoneInTalk;
      case 'offer':
        return MdCardGiftcard;
      case 'rejected':
        return MdClear;
      default:
        return MdRadioButtonUnchecked;
    }
  };

  const normalizeStatus = (status) => {
    const key = (status || '').toUpperCase();
    if (key === 'APPLIED') return 'applied';
    if (key === 'SHORTLISTED') return 'shortlisted';
    if (key === 'REJECTED') return 'rejected';
    if (key === 'OFFERED' || key === 'PLACED') return 'offer';
    return 'interview';
  };

  const mapBackendApplication = (app, index) => {
    const status = normalizeStatus(app?.status);
    const stageHistory = Array.isArray(app?.stage_history) ? app.stage_history : [];
    const offers = Array.isArray(app?.offers) ? app.offers : [];
    const feedback = Array.isArray(app?.interview_feedback) ? app.interview_feedback : [];

    const timeline = [
      { status: 'Applied', date: app?.created_at, completed: true, note: 'Application submitted successfully.' },
      ...stageHistory.map((stage) => ({
        status: stage?.round_name || stage?.status || 'Interview Stage',
        date: app?.updated_at,
        completed: String(stage?.status || '').toUpperCase() !== 'PENDING',
        note: stage?.remarks || '',
      })),
      {
        status: 'Offer',
        date: offers?.[0]?.created_at || null,
        completed: offers.length > 0,
        note: offers.length > 0 ? 'Offer has been released.' : 'Pending final decision.',
      },
    ];

    const history = [
      { label: 'Application submitted', dateTime: app?.created_at },
      { label: 'Last status update', dateTime: app?.updated_at },
      ...feedback.slice(0, 3).map((item) => ({
        label: `${item?.round_name || 'Interview'} feedback: ${item?.decision || 'Updated'}`,
        dateTime: item?.created_at,
      })),
    ].filter((entry) => entry?.dateTime);

    return {
      id: index + 1,
      applicationId: String(app?.application_id || ''),
      jobId: String(app?.job?.id || ''),
      company: app?.job?.company?.name || 'Company',
      position: app?.job?.title || 'Role',
      appliedDate: app?.created_at,
      status,
      workMode: 'As per company policy',
      employmentType: 'Full Time',
      location: 'TBD',
      ctc: offers?.[0]?.salary ? `${(Number(offers[0].salary) / 100000).toFixed(1)} LPA` : 'TBD',
      deadline: app?.created_at,
      lastUpdated: app?.updated_at,
      source: 'Campus Placement Cell',
      eligibility: 'Eligibility verified by TPO and system rules',
      requiredSkills: [],
      selectionProcess: stageHistory.map((stage) => stage?.round_name).filter(Boolean),
      bondPolicy: 'As per company offer terms',
      tpoCoordinator: 'Placement Cell',
      recruiter: {
        name: 'To be announced',
        email: '-',
        phone: '-',
      },
      documents: [],
      interviews: stageHistory.map((stage) => ({
        round: stage?.round_name || 'Interview Round',
        date: app?.updated_at,
        time: '-',
        mode: 'TBD',
        status: String(stage?.status || '').toUpperCase() === 'PENDING' ? 'Scheduled' : 'Completed',
        panel: 'Recruiter Panel',
      })),
      timeline,
      history,
    };
  };

  useEffect(() => {
    let isMounted = true;
    const loadApplications = async () => {
      try {
        const response = await studentAPI.getApplications();
        const items = response?.data?.applications;
        if (!isMounted || !Array.isArray(items)) return;
        const mapped = items.map((app, index) => mapBackendApplication(app, index));
        if (mapped.length > 0) {
          setApplications(mapped);
        }
      } catch (error) {
        // Keep fallback UI data when API is unavailable.
      }
    };

    loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="student-applications">
      <StudentTopPanel
        title="My Applications"
        subtitle="Track every stage, recruiter update, and TPO-reviewed detail in one connected view."
        kicker="Student Applications"
        stats={[
          { label: 'Total', value: applications.length },
          { label: 'Shortlisted', value: applications.filter((a) => a.status === 'shortlisted').length },
          { label: 'Interviews', value: applications.filter((a) => a.status === 'interview').length },
          { label: 'Offers', value: applications.filter((a) => a.status === 'offer').length },
        ]}
        tpoUpdates={[
          'Application timelines are validated by TPO cell',
          'Document verification status is synced from TPO records',
          'Recruiter contacts are visible after TPO approval',
          'Interview schedule changes are published through placement desk',
        ]}
      />

      <div className="applications-list">
        {applications.map((app) => (
          <Card key={app.id} className="application-card">
            <div className="app-header">
              <div className="app-title">
                <h3>{app.position}</h3>
                <p className="company">{app.company}</p>
              </div>
              <div className="app-status">
                <span className={getStatusBadgeClass(app.status)}>
                  {(() => {
                    const IconComponent = getStatusIcon(app.status);
                    return <IconComponent size={16} className="status-icon" />;
                  })()}
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                <span className="applied-date">
                  Applied: {formatDate(app.appliedDate)}
                </span>
              </div>
            </div>

            <div className="app-meta-grid">
              <div className="app-meta-card">
                <span className="app-meta-label">Application ID</span>
                <span className="app-meta-value">{app.applicationId}</span>
              </div>
              <div className="app-meta-card">
                <span className="app-meta-label">Job ID</span>
                <span className="app-meta-value">{app.jobId}</span>
              </div>
              <div className="app-meta-card">
                <span className="app-meta-label">Location</span>
                <span className="app-meta-value">{app.location}</span>
              </div>
              <div className="app-meta-card">
                <span className="app-meta-label">CTC</span>
                <span className="app-meta-value">{app.ctc}</span>
              </div>
              <div className="app-meta-card">
                <span className="app-meta-label">Deadline</span>
                <span className="app-meta-value">{formatDate(app.deadline)}</span>
              </div>
              <div className="app-meta-card">
                <span className="app-meta-label">Last Updated</span>
                <span className="app-meta-value">{formatDate(app.lastUpdated)}</span>
              </div>
            </div>

            <div className="timeline">
              {app.timeline.map((stage, index) => (
                <div
                  key={index}
                  className={`timeline-item ${stage.completed ? 'completed' : ''}`}
                >
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="stage-name">{stage.status}</span>
                    <span className="stage-date">
                      {stage.date
                        ? `Completed: ${formatDate(stage.date)}`
                        : stage.expectedDate
                          ? `Expected: ${formatDate(stage.expectedDate)}`
                          : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="app-actions">
              <button
                className="app-action-btn app-action-btn--ghost"
                onClick={() => setSelectedApp(app)}
                type="button"
              >
                <MdInfoOutline aria-hidden="true" />
                View Details
              </button>
            </div>
          </Card>
        ))}
      </div>


      <Modal
        isOpen={!!selectedApp}
        title={selectedApp ? `${selectedApp.position} at ${selectedApp.company}` : ''}
        onClose={() => setSelectedApp(null)}
        closeText="Close"
      >
        {selectedApp && (
          <div className="application-details">
            <div className="details-section">
              <h4>Application Snapshot</h4>
              <div className="details-grid details-grid-wide">
                <div className="details-card">
                  <span className="details-label">Application ID</span>
                  <span className="details-value">{selectedApp.applicationId}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Job ID</span>
                  <span className="details-value">{selectedApp.jobId}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Status</span>
                  <span className="details-value">
                    {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                  </span>
                </div>
                <div className="details-card">
                  <span className="details-label">Applied On</span>
                  <span className="details-value">{formatDate(selectedApp.appliedDate)}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Deadline</span>
                  <span className="details-value">{formatDate(selectedApp.deadline)}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Last Updated</span>
                  <span className="details-value">{formatDate(selectedApp.lastUpdated)}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Company</span>
                  <span className="details-value">{selectedApp.company}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Role</span>
                  <span className="details-value">{selectedApp.position}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Location</span>
                  <span className="details-value">{selectedApp.location}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Work Mode</span>
                  <span className="details-value">{selectedApp.workMode}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Employment Type</span>
                  <span className="details-value">{selectedApp.employmentType}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">CTC</span>
                  <span className="details-value">{selectedApp.ctc}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Application Source</span>
                  <span className="details-value">{selectedApp.source}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Eligibility</span>
                  <span className="details-value">{selectedApp.eligibility}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Job Details</h4>
              <div className="details-grid details-grid-wide">
                <div className="details-card details-card-highlight">
                  <span className="details-label">Required Skills</span>
                  <div className="details-chip-row">
                    {selectedApp.requiredSkills.map((skill) => (
                      <span key={skill} className="details-chip">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="details-card">
                  <span className="details-label">Selection Process</span>
                  <ol className="details-list">
                    {selectedApp.selectionProcess.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="details-card">
                  <span className="details-label">Bond Policy</span>
                  <span className="details-value">{selectedApp.bondPolicy}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">TPO Coordinator</span>
                  <span className="details-value">{selectedApp.tpoCoordinator}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Recruiter Contact</h4>
              <div className="details-grid">
                <div className="details-card">
                  <span className="details-label">Recruiter Name</span>
                  <span className="details-value">{selectedApp.recruiter.name}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Email</span>
                  <span className="details-value">{selectedApp.recruiter.email}</span>
                </div>
                <div className="details-card">
                  <span className="details-label">Phone</span>
                  <span className="details-value">{selectedApp.recruiter.phone}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Stage Timeline</h4>
              <div className="details-card">
                <span className="details-label">Current Stage</span>
                <span className="details-value">
                  {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                </span>
              </div>
              <div className="timeline">
                {selectedApp.timeline.map((stage, index) => (
                  <div
                    key={index}
                    className={`timeline-item ${stage.completed ? 'completed' : ''}`}
                  >
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="stage-name">{stage.status}</span>
                      <span className="stage-date">
                        {stage.date
                          ? `Completed: ${formatDate(stage.date)}`
                          : stage.expectedDate
                            ? `Expected: ${formatDate(stage.expectedDate)}`
                            : 'Pending'}
                      </span>
                      {stage.note && <span className="stage-note">{stage.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-section">
              <h4>Interview Rounds</h4>
              {selectedApp.interviews.length > 0 ? (
                <div className="interview-list">
                  {selectedApp.interviews.map((interview, index) => (
                    <div className="interview-card" key={`${interview.round}-${index}`}>
                      <div className="interview-head">
                        <h5>{interview.round}</h5>
                        <span className={getStatusBadgeClass(interview.status.toLowerCase())}>
                          {interview.status}
                        </span>
                      </div>
                      <div className="interview-meta-grid">
                        <div className="interview-meta-item">
                          <span className="details-label">Date</span>
                          <span className="details-value">{formatDate(interview.date)}</span>
                        </div>
                        <div className="interview-meta-item">
                          <span className="details-label">Time</span>
                          <span className="details-value">{interview.time}</span>
                        </div>
                        <div className="interview-meta-item">
                          <span className="details-label">Mode</span>
                          <span className="details-value">{interview.mode}</span>
                        </div>
                        <div className="interview-meta-item">
                          <span className="details-label">Panel</span>
                          <span className="details-value">{interview.panel}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-detail">No interview round scheduled yet.</p>
              )}
            </div>

            <div className="details-section">
              <h4>Submitted Documents</h4>
              <div className="document-list">
                {selectedApp.documents.map((document, index) => (
                  <div className="document-row" key={`${document.name}-${index}`}>
                    <div>
                      <p className="document-name">{document.name}</p>
                      <p className="document-date">Submitted: {formatDate(document.submittedOn)}</p>
                    </div>
                    <span className="badge badge-info">{document.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-section">
              <h4>Status History</h4>
              <div className="history-list">
                {selectedApp.history.map((event, index) => (
                  <div className="history-item" key={`${event.label}-${index}`}>
                    <span className="history-label">{event.label}</span>
                    <span className="history-date">{formatDateTime(event.dateTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentApplications;
