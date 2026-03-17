import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import {
  MdBarChart,
  MdCardGiftcard,
  MdChat,
  MdClear,
  MdInfoOutline,
  MdPhoneInTalk,
  MdRadioButtonUnchecked,
  MdSend,
  MdStar,
} from 'react-icons/md';
import './StudentApplications.css';

const StudentApplications = () => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [applications] = useState([
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer',
      appliedDate: '2024-01-15',
      status: 'shortlisted',
      timeline: [
        { status: 'Applied', date: '2024-01-15', completed: true },
        { status: 'Shortlisted', date: '2024-01-22', completed: true },
        { status: 'Technical Interview', date: '2024-02-05', completed: false },
        { status: 'HR Round', date: null, completed: false },
        { status: 'Offer', date: null, completed: false },
      ],
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Product Manager',
      appliedDate: '2024-01-10',
      status: 'interview',
      timeline: [
        { status: 'Applied', date: '2024-01-10', completed: true },
        { status: 'Shortlisted', date: '2024-01-18', completed: true },
        { status: 'Technical Interview', date: '2024-02-01', completed: true },
        { status: 'HR Round', date: '2024-02-15', completed: false },
        { status: 'Offer', date: null, completed: false },
      ],
    },
    {
      id: 3,
      company: 'Amazon',
      position: 'Data Engineer',
      appliedDate: '2024-01-05',
      status: 'offer',
      timeline: [
        { status: 'Applied', date: '2024-01-05', completed: true },
        { status: 'Shortlisted', date: '2024-01-12', completed: true },
        { status: 'Technical Interview', date: '2024-01-25', completed: true },
        { status: 'HR Round', date: '2024-02-08', completed: true },
        { status: 'Offer', date: '2024-02-10', completed: true },
      ],
    },
    {
      id: 4,
      company: 'TCS',
      position: 'Systems Engineer',
      appliedDate: '2024-01-20',
      status: 'applied',
      timeline: [
        { status: 'Applied', date: '2024-01-20', completed: true },
        { status: 'Shortlisted', date: null, completed: false },
        { status: 'Technical Interview', date: null, completed: false },
        { status: 'HR Round', date: null, completed: false },
        { status: 'Offer', date: null, completed: false },
      ],
    },
  ]);

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

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    alert(`Message sent to ${messageTarget.company} for ${messageTarget.position}.`);
    setMessageText('');
    setMessageTarget(null);
  };

  return (
    <div className="student-applications">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track your application status across all companies</p>
      </div>

      <div className="stats-summary stats-summary--top">
        <Card title={<span className="summary-title"><MdBarChart aria-hidden="true" />Application Summary</span>}>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total Applications</span>
              <span className="summary-value">{applications.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Shortlisted</span>
              <span className="summary-value">
                {applications.filter(a => a.status === 'shortlisted').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Interviews</span>
              <span className="summary-value">
                {applications.filter(a => a.status === 'interview').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Offers</span>
              <span className="summary-value">
                {applications.filter(a => a.status === 'offer').length}
              </span>
            </div>
          </div>
        </Card>
      </div>

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
                  Applied: {new Date(app.appliedDate).toLocaleDateString()}
                </span>
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
                    {stage.date && (
                      <span className="stage-date">
                        {new Date(stage.date).toLocaleDateString()}
                      </span>
                    )}
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
              <button
                className="app-action-btn app-action-btn--primary"
                onClick={() => setMessageTarget(app)}
                type="button"
              >
                <MdChat aria-hidden="true" />
                Send Message
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
            <div className="details-grid">
              <div className="details-card">
                <span className="details-label">Status</span>
                <span className="details-value">
                  {selectedApp.status.charAt(0).toUpperCase() + selectedApp.status.slice(1)}
                </span>
              </div>
              <div className="details-card">
                <span className="details-label">Applied On</span>
                <span className="details-value">
                  {new Date(selectedApp.appliedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="details-card">
                <span className="details-label">Company</span>
                <span className="details-value">{selectedApp.company}</span>
              </div>
              <div className="details-card">
                <span className="details-label">Role</span>
                <span className="details-value">{selectedApp.position}</span>
              </div>
            </div>

            <div className="details-section">
              <h4>Stage Timeline</h4>
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
                        {stage.date ? new Date(stage.date).toLocaleDateString() : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!messageTarget}
        title={messageTarget ? `Message ${messageTarget.company}` : ''}
        onClose={() => setMessageTarget(null)}
        onConfirm={handleSendMessage}
        confirmText="Send"
      >
        {messageTarget && (
          <div className="message-modal">
            <p className="message-helper">
              This note will be sent to the placement team for {messageTarget.position}.
            </p>
            <label className="message-label" htmlFor="message-text">
              Message
            </label>
            <textarea
              id="message-text"
              className="message-field"
              rows={5}
              placeholder="Ask for interview updates or document requirements..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <div className="message-hint">
              Tip: Mention your application ID or interview slot preference.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentApplications;
