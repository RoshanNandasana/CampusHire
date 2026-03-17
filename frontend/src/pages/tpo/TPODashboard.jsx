import React from 'react';
import {
  MdGroups,
  MdAssignment,
  MdWork,
  MdEmojiEvents,
  MdTrendingUp,
  MdAttachMoney,
  MdChecklist,
  MdWarningAmber,
  MdDomain,
  MdAccountTree,
  MdChecklistRtl,
  MdCampaign,
  MdFileDownload,
  MdRule,
  MdOpenInNew,
} from 'react-icons/md';
import Card from '../../components/common/Card';
import './TPODashboard.css';

const branchFunnel = [
  { branch: 'CSE', eligible: 180, applied: 168, interview: 104, offers: 71, joined: 63 },
  { branch: 'ECE', eligible: 120, applied: 108, interview: 63, offers: 38, joined: 31 },
  { branch: 'IT', eligible: 78, applied: 74, interview: 49, offers: 31, joined: 26 },
  { branch: 'ME', eligible: 100, applied: 82, interview: 43, offers: 21, joined: 17 },
  { branch: 'Civil', eligible: 85, applied: 67, interview: 37, offers: 20, joined: 15 },
];

const companyPerformance = [
  { company: 'TCS', drives: 6, applicants: 210, interviews: 87, offers: 52, joined: 46, avgCtc: 7.2 },
  { company: 'Infosys', drives: 5, applicants: 180, interviews: 76, offers: 43, joined: 38, avgCtc: 8.0 },
  { company: 'Google', drives: 2, applicants: 145, interviews: 45, offers: 12, joined: 8, avgCtc: 21.5 },
  { company: 'Microsoft', drives: 2, applicants: 128, interviews: 41, offers: 11, joined: 9, avgCtc: 19.8 },
  { company: 'Amazon', drives: 3, applicants: 115, interviews: 36, offers: 10, joined: 7, avgCtc: 17.6 },
];

const riskQueue = [
  { id: 'R-1021', title: 'Offer acceptance lag', detail: '14 students are pending acceptance beyond 48h SLA.', level: 'high' },
  { id: 'R-1022', title: 'Document verification pending', detail: '9 shortlisted students have incomplete verification.', level: 'medium' },
  { id: 'R-1023', title: 'Final-year backlog exceptions', detail: '6 candidates require policy exception review.', level: 'medium' },
  { id: 'R-1024', title: 'Interview no-show trend', detail: 'CSE no-show rate reached 7.4% this month.', level: 'high' },
];

const rate = (num, den) => (den > 0 ? ((num / den) * 100).toFixed(1) : '0.0');

const TPODashboard = () => {
  const totals = {
    eligibleStudents: branchFunnel.reduce((s, item) => s + item.eligible, 0),
    totalApplications: branchFunnel.reduce((s, item) => s + item.applied, 0),
    interviewCount: branchFunnel.reduce((s, item) => s + item.interview, 0),
    offersCount: branchFunnel.reduce((s, item) => s + item.offers, 0),
    joinedCount: branchFunnel.reduce((s, item) => s + item.joined, 0),
    activeJobs: 28,
    avgCtc: 10.8,
  };

  const placementRate = rate(totals.joinedCount, totals.eligibleStudents);
  const offerConversion = rate(totals.offersCount, totals.totalApplications);
  const interviewConversion = rate(totals.interviewCount, totals.totalApplications);
  const offerAcceptance = rate(totals.joinedCount, totals.offersCount);

  return (
    <div className="tpo-dashboard-v2">
      <div className="dash-head">
        <div>
          <h1>TPO Placement Command Center</h1>
          <p>Unified placement monitoring across eligibility, applications, interviews, offers, and joining outcomes.</p>
        </div>
        <div className="cycle-pill">Placement Cycle 2025-26</div>
      </div>

      <div className="kpi-grid">
        <Card className="kpi-card tone-blue">
          <div className="kpi-icon"><MdGroups size={22} /></div>
          <div>
            <p className="kpi-label">Eligible Students</p>
            <p className="kpi-value">{totals.eligibleStudents}</p>
          </div>
        </Card>
        <Card className="kpi-card tone-indigo">
          <div className="kpi-icon"><MdAssignment size={22} /></div>
          <div>
            <p className="kpi-label">Applications</p>
            <p className="kpi-value">{totals.totalApplications}</p>
          </div>
        </Card>
        <Card className="kpi-card tone-cyan">
          <div className="kpi-icon"><MdWork size={22} /></div>
          <div>
            <p className="kpi-label">Active Jobs</p>
            <p className="kpi-value">{totals.activeJobs}</p>
          </div>
        </Card>
        <Card className="kpi-card tone-green">
          <div className="kpi-icon"><MdEmojiEvents size={22} /></div>
          <div>
            <p className="kpi-label">Students Joined</p>
            <p className="kpi-value">{totals.joinedCount}</p>
          </div>
        </Card>
        <Card className="kpi-card tone-amber">
          <div className="kpi-icon"><MdTrendingUp size={22} /></div>
          <div>
            <p className="kpi-label">Placement Rate</p>
            <p className="kpi-value">{placementRate}%</p>
          </div>
        </Card>
        <Card className="kpi-card tone-violet">
          <div className="kpi-icon"><MdAttachMoney size={22} /></div>
          <div>
            <p className="kpi-label">Average CTC</p>
            <p className="kpi-value">{totals.avgCtc} LPA</p>
          </div>
        </Card>
      </div>

      <div className="metrics-strip">
        <div className="metric-box">
          <span className="metric-label">Interview Conversion</span>
          <span className="metric-value">{interviewConversion}%</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Offer Conversion</span>
          <span className="metric-value">{offerConversion}%</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Offer Acceptance</span>
          <span className="metric-value">{offerAcceptance}%</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Unplaced Eligible</span>
          <span className="metric-value">{totals.eligibleStudents - totals.joinedCount}</span>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <Card className="panel-card">
          <div className="panel-title">
            <MdAccountTree size={18} />
            <h3>Branch-Wise Placement Funnel</h3>
          </div>
          <div className="funnel-list">
            {branchFunnel.map((item) => (
              <div className="funnel-item" key={item.branch}>
                <div className="funnel-head">
                  <strong>{item.branch}</strong>
                  <span>{item.joined}/{item.eligible} joined</span>
                </div>
                <div className="funnel-bar-row">
                  <span>Applied</span>
                  <div className="bar-track"><div className="bar-fill bar-applied" style={{ width: `${rate(item.applied, item.eligible)}%` }} /></div>
                  <em>{rate(item.applied, item.eligible)}%</em>
                </div>
                <div className="funnel-bar-row">
                  <span>Interview</span>
                  <div className="bar-track"><div className="bar-fill bar-interview" style={{ width: `${rate(item.interview, item.eligible)}%` }} /></div>
                  <em>{rate(item.interview, item.eligible)}%</em>
                </div>
                <div className="funnel-bar-row">
                  <span>Offers</span>
                  <div className="bar-track"><div className="bar-fill bar-offer" style={{ width: `${rate(item.offers, item.eligible)}%` }} /></div>
                  <em>{rate(item.offers, item.eligible)}%</em>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <div className="panel-title">
            <MdDomain size={18} />
            <h3>Top Recruiter Performance</h3>
          </div>
          <div className="table-wrap">
            <table className="tpo-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Drives</th>
                  <th>Applied</th>
                  <th>Offers</th>
                  <th>Joined</th>
                  <th>Yield</th>
                  <th>Avg CTC</th>
                </tr>
              </thead>
              <tbody>
                {companyPerformance.map((item) => (
                  <tr key={item.company}>
                    <td>{item.company}</td>
                    <td>{item.drives}</td>
                    <td>{item.applicants}</td>
                    <td>{item.offers}</td>
                    <td>{item.joined}</td>
                    <td><span className="table-chip">{rate(item.joined, item.offers)}%</span></td>
                    <td>{item.avgCtc} LPA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="dashboard-bottom-grid">
        <Card className="panel-card">
          <div className="panel-title">
            <MdWarningAmber size={18} />
            <h3>Risk & Exception Queue</h3>
          </div>
          <div className="risk-list">
            {riskQueue.map((risk) => (
              <div className="risk-item" key={risk.id}>
                <div>
                  <p className="risk-title">{risk.title}</p>
                  <p className="risk-detail">{risk.detail}</p>
                </div>
                <span className={`risk-badge ${risk.level}`}>{risk.level}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <div className="panel-title">
            <MdChecklist size={18} />
            <h3>TPO Actions</h3>
          </div>
          <div className="action-list">
            <button className="action-btn"><MdChecklistRtl size={16} /> Review Pending Verifications <MdOpenInNew size={14} /></button>
            <button className="action-btn"><MdRule size={16} /> Update Eligibility Policy <MdOpenInNew size={14} /></button>
            <button className="action-btn"><MdCampaign size={16} /> Send Placement Alert <MdOpenInNew size={14} /></button>
            <button className="action-btn"><MdFileDownload size={16} /> Export Placement Report <MdOpenInNew size={14} /></button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TPODashboard;
