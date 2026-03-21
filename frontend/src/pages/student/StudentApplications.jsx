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
  const [applications, setApplications] = useState([]);

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
      location: app?.job?.location || 'TBD',
      ctc: offers?.[0]?.salary
        ? `${(Number(offers[0].salary) / 100000).toFixed(1)} LPA`
        : app?.job?.salary
          ? `${(Number(app.job.salary) / 100000).toFixed(1)} LPA`
          : 'TBD',
      deadline: app?.job?.application_deadline || app?.created_at,
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
        {applications.length === 0 && (
          <div className="empty-state">
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No applications yet.</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Browse jobs and apply to start your placement journey!</p>
          </div>
        )}
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
