import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import './TPOAnalytics.css';

const placementTrend = [
  { month: 'Jan', applications: 128, interviews: 72, offers: 34, joined: 24 },
  { month: 'Feb', applications: 142, interviews: 84, offers: 39, joined: 31 },
  { month: 'Mar', applications: 158, interviews: 93, offers: 44, joined: 37 },
  { month: 'Apr', applications: 171, interviews: 102, offers: 50, joined: 43 },
  { month: 'May', applications: 164, interviews: 96, offers: 45, joined: 38 },
  { month: 'Jun', applications: 189, interviews: 112, offers: 57, joined: 49 },
];

const branchPerformance = [
  { branch: 'CSE', eligible: 172, applied: 166, interviews: 104, offers: 62, placed: 58, avgCtc: 9.4 },
  { branch: 'ECE', eligible: 121, applied: 112, interviews: 63, offers: 31, placed: 27, avgCtc: 7.3 },
  { branch: 'ME', eligible: 96, applied: 84, interviews: 42, offers: 18, placed: 15, avgCtc: 6.1 },
  { branch: 'Civil', eligible: 81, applied: 70, interviews: 38, offers: 19, placed: 17, avgCtc: 6.7 },
  { branch: 'IT', eligible: 76, applied: 71, interviews: 47, offers: 28, placed: 24, avgCtc: 8.8 },
];

const recruiterHealth = [
  { company: 'Google', drives: 4, applicants: 142, interviews: 45, offers: 21, acceptanceRate: 81, slaHours: 28 },
  { company: 'Microsoft', drives: 3, applicants: 121, interviews: 39, offers: 18, acceptanceRate: 76, slaHours: 33 },
  { company: 'Amazon', drives: 4, applicants: 136, interviews: 41, offers: 19, acceptanceRate: 69, slaHours: 40 },
  { company: 'TCS', drives: 6, applicants: 221, interviews: 87, offers: 52, acceptanceRate: 88, slaHours: 22 },
  { company: 'Infosys', drives: 5, applicants: 194, interviews: 76, offers: 43, acceptanceRate: 83, slaHours: 25 },
];

const riskWatchlistSeed = [
  {
    id: 'RISK-1001',
    student: 'Raj Kumar',
    branch: 'CSE',
    company: 'Google',
    riskType: 'Interview no-show risk',
    severity: 'high',
    lastAction: 'Reminder pending',
  },
  {
    id: 'RISK-1002',
    student: 'Anjali Sharma',
    branch: 'ECE',
    company: 'TCS',
    riskType: 'Low aptitude score trend',
    severity: 'medium',
    lastAction: 'Mentor assigned',
  },
  {
    id: 'RISK-1003',
    student: 'Vikram Singh',
    branch: 'ME',
    company: 'Infosys',
    riskType: 'Document mismatch',
    severity: 'high',
    lastAction: 'Verification requested',
  },
  {
    id: 'RISK-1004',
    student: 'Neha Verma',
    branch: 'CSE',
    company: 'Amazon',
    riskType: 'Offer acceptance delay',
    severity: 'low',
    lastAction: 'Follow-up scheduled',
  },
];

const cycleOptions = ['2025-26 Main Cycle', '2025-26 Fast Track', '2024-25 Main Cycle'];
const branchOptions = ['All Branches', 'CSE', 'ECE', 'ME', 'Civil', 'IT'];
const departmentOptions = ['All Departments', 'Engineering', 'Management'];

const defaultNotificationForm = {
  audience: 'Students - At Risk',
  priority: 'high',
  channel: 'in-app',
  subject: 'Action required: Placement readiness follow-up',
  message:
    'Please complete the pending checklist in your dashboard before 6 PM today. Reach out to your department coordinator in case of blockers.',
};

const loadSavedNotifications = () => {
  try {
    const raw = localStorage.getItem('tpo.analytics.notifications');
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
};

const TPOAnalytics = () => {
  const [selectedCycle, setSelectedCycle] = useState(cycleOptions[0]);
  const [selectedBranch, setSelectedBranch] = useState(branchOptions[0]);
  const [selectedDepartment, setSelectedDepartment] = useState(departmentOptions[0]);
  const [watchlist, setWatchlist] = useState(riskWatchlistSeed);
  const [notificationForm, setNotificationForm] = useState(defaultNotificationForm);
  const [notificationLog, setNotificationLog] = useState(loadSavedNotifications());
  const [activeToast, setActiveToast] = useState('');

  useEffect(() => {
    localStorage.setItem('tpo.analytics.notifications', JSON.stringify(notificationLog));
  }, [notificationLog]);

  useEffect(() => {
    if (!activeToast) {
      return undefined;
    }
    const timer = window.setTimeout(() => setActiveToast(''), 2500);
    return () => window.clearTimeout(timer);
  }, [activeToast]);

  const filteredBranchStats = useMemo(() => {
    if (selectedBranch === 'All Branches') {
      return branchPerformance;
    }
    return branchPerformance.filter((item) => item.branch === selectedBranch);
  }, [selectedBranch]);

  const totals = useMemo(() => {
    const aggregate = filteredBranchStats.reduce(
      (acc, item) => {
        acc.eligible += item.eligible;
        acc.applied += item.applied;
        acc.interviews += item.interviews;
        acc.offers += item.offers;
        acc.placed += item.placed;
        acc.avgCtcSum += item.avgCtc;
        return acc;
      },
      { eligible: 0, applied: 0, interviews: 0, offers: 0, placed: 0, avgCtcSum: 0 }
    );

    const branchCount = filteredBranchStats.length || 1;
    const placementRate = aggregate.eligible ? ((aggregate.placed / aggregate.eligible) * 100).toFixed(1) : '0.0';
    const offerConversion = aggregate.applied ? ((aggregate.offers / aggregate.applied) * 100).toFixed(1) : '0.0';
    const avgCtc = (aggregate.avgCtcSum / branchCount).toFixed(1);

    return {
      ...aggregate,
      placementRate,
      offerConversion,
      avgCtc,
    };
  }, [filteredBranchStats]);

  const maxApplied = Math.max(...filteredBranchStats.map((item) => item.applied), 1);

  const topMonth = useMemo(() => {
    return placementTrend.reduce(
      (best, current) => (current.offers > best.offers ? current : best),
      placementTrend[0]
    );
  }, []);

  const riskSummary = useMemo(() => {
    return {
      high: watchlist.filter((item) => item.severity === 'high').length,
      medium: watchlist.filter((item) => item.severity === 'medium').length,
      low: watchlist.filter((item) => item.severity === 'low').length,
    };
  }, [watchlist]);

  const notificationStats = useMemo(() => {
    return {
      total: notificationLog.length,
      today: notificationLog.filter((entry) => {
        const today = new Date().toISOString().slice(0, 10);
        return entry.sentAt.slice(0, 10) === today;
      }).length,
    };
  }, [notificationLog]);

  const updateNotificationForm = (key, value) => {
    setNotificationForm((prev) => ({ ...prev, [key]: value }));
  };

  const sendNotification = () => {
    if (!notificationForm.subject.trim() || !notificationForm.message.trim()) {
      setActiveToast('Subject and message are required before sending a notification.');
      return;
    }

    const entry = {
      id: `NTF-${String(notificationLog.length + 1).padStart(4, '0')}`,
      audience: notificationForm.audience,
      channel: notificationForm.channel,
      priority: notificationForm.priority,
      subject: notificationForm.subject,
      message: notificationForm.message,
      sentAt: new Date().toISOString(),
    };

    setNotificationLog((prev) => [entry, ...prev]);
    setActiveToast('Notification has been queued successfully.');
  };

  const notifyRiskCandidate = (candidate, target) => {
    const entry = {
      id: `NTF-${String(notificationLog.length + 1).padStart(4, '0')}`,
      audience: `${target} - ${candidate.student}`,
      channel: 'in-app',
      priority: candidate.severity === 'high' ? 'high' : 'medium',
      subject: `Placement follow-up for ${candidate.student}`,
      message: `${candidate.riskType} flagged for ${candidate.company}. Please review and update the latest action in tracker ${candidate.id}.`,
      sentAt: new Date().toISOString(),
    };

    setNotificationLog((prev) => [entry, ...prev]);
    setActiveToast(`Notification sent to ${target.toLowerCase()} for ${candidate.student}.`);
  };

  const markRiskResolved = (riskId) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== riskId));
    setActiveToast(`${riskId} marked as resolved.`);
  };

  const getSeverityClass = (severity) => {
    if (severity === 'high') return 'badge badge-danger';
    if (severity === 'medium') return 'badge badge-warning';
    return 'badge badge-success';
  };

  const getPriorityClass = (priority) => {
    if (priority === 'high') return 'badge badge-danger';
    if (priority === 'medium') return 'badge badge-warning';
    return 'badge badge-info';
  };

  const latestNotifications = notificationLog.slice(0, 6);

  return (
    <div className="tpo-analytics-page tpo-analytics-pro">
      <section className="analytics-hero">
        <div>
          <p className="eyebrow">Placement Intelligence Console</p>
          <h1>TPO Analytics Command Center</h1>
          <p>
            Track full placement health, detect risks early, and trigger notifications in one
            unified workspace.
          </p>
        </div>
        <div className="hero-kpi-tile">
          <span>Best Offer Month</span>
          <strong>{topMonth.month}</strong>
          <p>{topMonth.offers} offers issued</p>
        </div>
      </section>

      {activeToast && <div className="analytics-toast">{activeToast}</div>}

      <Card className="filter-control-card" title="Filter Scope">
        <div className="filter-control-grid">
          <div className="control-field">
            <label>Placement Cycle</label>
            <select value={selectedCycle} onChange={(event) => setSelectedCycle(event.target.value)}>
              {cycleOptions.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle}
                </option>
              ))}
            </select>
          </div>
          <div className="control-field">
            <label>Department Cluster</label>
            <select
              value={selectedDepartment}
              onChange={(event) => setSelectedDepartment(event.target.value)}
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div className="control-field">
            <label>Branch</label>
            <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)}>
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <div className="control-field sync-field">
            <label>Synced Context</label>
            <p>{selectedCycle}</p>
            <p>{selectedDepartment}</p>
          </div>
        </div>
      </Card>

      <section className="kpi-grid">
        <Card className="kpi-card kpi-primary">
          <p>Placement Rate</p>
          <h2>{totals.placementRate}%</h2>
          <span>{totals.placed} placed / {totals.eligible} eligible</span>
        </Card>
        <Card className="kpi-card kpi-ocean">
          <p>Offer Conversion</p>
          <h2>{totals.offerConversion}%</h2>
          <span>{totals.offers} offers from {totals.applied} applications</span>
        </Card>
        <Card className="kpi-card kpi-amber">
          <p>Average CTC</p>
          <h2>{totals.avgCtc} LPA</h2>
          <span>Across {filteredBranchStats.length} visible branches</span>
        </Card>
        <Card className="kpi-card kpi-rose">
          <p>Risk Cases</p>
          <h2>{watchlist.length}</h2>
          <span>{riskSummary.high} high | {riskSummary.medium} medium | {riskSummary.low} low</span>
        </Card>
      </section>

      <section className="analytics-main-grid">
        <Card title="Branch-Level Performance Heatboard" className="wide-card">
          <div className="branch-performance-list">
            {filteredBranchStats.map((item) => {
              const fill = Math.round((item.applied / maxApplied) * 100);
              const placementRate = ((item.placed / item.eligible) * 100).toFixed(1);
              return (
                <div key={item.branch} className="branch-performance-row">
                  <div className="branch-title-box">
                    <strong>{item.branch}</strong>
                    <span>{item.placed} placed</span>
                  </div>
                  <div className="branch-track">
                    <div className="branch-fill" style={{ width: `${fill}%` }}></div>
                  </div>
                  <div className="branch-meta">
                    <span>{placementRate}% rate</span>
                    <span>{item.avgCtc} LPA avg CTC</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Hiring Pipeline Momentum" className="wide-card">
          <div className="trend-chart-grid">
            {placementTrend.map((item) => (
              <div className="trend-column" key={item.month}>
                <div className="trend-bars">
                  <div className="trend-bar applications" style={{ height: `${item.applications / 2.5}px` }}></div>
                  <div className="trend-bar interviews" style={{ height: `${item.interviews * 1.1}px` }}></div>
                  <div className="trend-bar offers" style={{ height: `${item.offers * 2.1}px` }}></div>
                </div>
                <strong>{item.month}</strong>
                <p>A:{item.applications} I:{item.interviews} O:{item.offers}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="analytics-main-grid">
        <Card title="Recruiter Performance Matrix" className="wide-card">
          <div className="matrix-table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Drives</th>
                  <th>Applicants</th>
                  <th>Offers</th>
                  <th>Acceptance</th>
                  <th>Avg Feedback SLA</th>
                </tr>
              </thead>
              <tbody>
                {recruiterHealth.map((company) => (
                  <tr key={company.company}>
                    <td>{company.company}</td>
                    <td>{company.drives}</td>
                    <td>{company.applicants}</td>
                    <td>{company.offers}</td>
                    <td>
                      <span className={company.acceptanceRate >= 80 ? 'badge badge-success' : 'badge badge-warning'}>
                        {company.acceptanceRate}%
                      </span>
                    </td>
                    <td>{company.slaHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Risk Watchlist and Interventions" className="wide-card">
          <div className="risk-list">
            {watchlist.map((candidate) => (
              <div key={candidate.id} className="risk-item">
                <div className="risk-main">
                  <div>
                    <strong>{candidate.student}</strong>
                    <p>{candidate.branch} | {candidate.company}</p>
                    <p className="risk-issue">{candidate.riskType}</p>
                  </div>
                  <div className="risk-badges">
                    <span className={getSeverityClass(candidate.severity)}>{candidate.severity}</span>
                    <span className="badge badge-secondary">{candidate.id}</span>
                  </div>
                </div>
                <p className="risk-last-action">Last action: {candidate.lastAction}</p>
                <div className="risk-actions">
                  <button
                    type="button"
                    className="btn btn-outlined btn-small"
                    onClick={() => notifyRiskCandidate(candidate, 'Student')}
                  >
                    Notify Student
                  </button>
                  <button
                    type="button"
                    className="btn btn-outlined btn-small"
                    onClick={() => notifyRiskCandidate(candidate, 'Recruiter')}
                  >
                    Notify Recruiter
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-small"
                    onClick={() => markRiskResolved(candidate.id)}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
            {watchlist.length === 0 && (
              <div className="empty-watchlist">All risk cases are resolved for the selected scope.</div>
            )}
          </div>
        </Card>
      </section>

      <section className="notification-grid">
        <Card title="Notification Composer" className="notification-composer-card">
          <div className="notification-form-grid">
            <div className="control-field">
              <label>Audience Segment</label>
              <select
                value={notificationForm.audience}
                onChange={(event) => updateNotificationForm('audience', event.target.value)}
              >
                <option>Students - At Risk</option>
                <option>Students - Interview Scheduled</option>
                <option>Students - Offer Pending</option>
                <option>Recruiters - Feedback Pending</option>
                <option>Department Coordinators</option>
              </select>
            </div>
            <div className="control-field">
              <label>Priority</label>
              <select
                value={notificationForm.priority}
                onChange={(event) => updateNotificationForm('priority', event.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="control-field">
              <label>Channel</label>
              <select
                value={notificationForm.channel}
                onChange={(event) => updateNotificationForm('channel', event.target.value)}
              >
                <option value="in-app">In-app</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="control-field full-width">
              <label>Subject</label>
              <input
                value={notificationForm.subject}
                onChange={(event) => updateNotificationForm('subject', event.target.value)}
                placeholder="Notification subject"
              />
            </div>
            <div className="control-field full-width">
              <label>Message</label>
              <textarea
                rows={4}
                value={notificationForm.message}
                onChange={(event) => updateNotificationForm('message', event.target.value)}
                placeholder="Type the message details"
              />
            </div>
            <div className="notification-actions">
              <button type="button" className="btn btn-primary" onClick={sendNotification}>
                Send Notification
              </button>
              <button
                type="button"
                className="btn btn-outlined"
                onClick={() => setNotificationForm(defaultNotificationForm)}
              >
                Reset Draft
              </button>
            </div>
          </div>
        </Card>

        <Card title="Recent Notification Log" className="notification-log-card">
          <div className="notification-log-summary">
            <span>Total sent: {notificationStats.total}</span>
            <span>Sent today: {notificationStats.today}</span>
          </div>
          <div className="notification-log-list">
            {latestNotifications.map((entry) => (
              <div key={entry.id} className="notification-entry">
                <div className="notification-head">
                  <strong>{entry.subject}</strong>
                  <span className={getPriorityClass(entry.priority)}>{entry.priority}</span>
                </div>
                <p className="notification-meta">
                  {entry.id} | {entry.audience} | {entry.channel}
                </p>
                <p className="notification-message">{entry.message}</p>
                <span className="notification-time">
                  {new Date(entry.sentAt).toLocaleString()}
                </span>
              </div>
            ))}
            {latestNotifications.length === 0 && (
              <div className="empty-log">No notifications sent yet in this browser session.</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default TPOAnalytics;
