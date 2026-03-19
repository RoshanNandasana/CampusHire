import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import './TPODashboard.css';

const TPODashboard = () => {
  const { user } = useAuth();

  const assignedClass = useMemo(() => {
    if (!user?.email) return 'CSE-A (Final Year)';
    if (user.email.includes('cse')) return 'CSE-A (Final Year)';
    if (user.email.includes('ece')) return 'ECE-B (Final Year)';
    return 'CSE-A (Final Year)';
  }, [user]);

  const [classData] = useState({
    totalStudents: 72,
    studentsApplied: 58,
    companiesVisited: 14,
    activeDrives: 6,
    offersReleased: 21,
  });

  const [recentApplications] = useState([
    {
      student: 'Rahul Mehta',
      rollNo: 'CSEA-041',
      company: 'Google',
      role: 'Software Engineer',
      status: 'Shortlisted',
      date: '2026-03-18',
    },
    {
      student: 'Aditi Shah',
      rollNo: 'CSEA-052',
      company: 'Microsoft',
      role: 'Product Analyst',
      status: 'Applied',
      date: '2026-03-17',
    },
    {
      student: 'Karan Patel',
      rollNo: 'CSEA-034',
      company: 'TCS',
      role: 'Systems Engineer',
      status: 'Offer',
      date: '2026-03-16',
    },
    {
      student: 'Nidhi Verma',
      rollNo: 'CSEA-063',
      company: 'Amazon',
      role: 'Data Engineer',
      status: 'Interview',
      date: '2026-03-15',
    },
  ]);

  const [companyDrives] = useState([
    {
      company: 'Google',
      role: 'Software Engineer',
      date: '2026-03-25',
      minCgpa: 7.5,
      registered: 36,
    },
    {
      company: 'Microsoft',
      role: 'Product Analyst',
      date: '2026-03-27',
      minCgpa: 7.0,
      registered: 28,
    },
    {
      company: 'Amazon',
      role: 'Data Engineer',
      date: '2026-03-29',
      minCgpa: 6.5,
      registered: 24,
    },
  ]);

  const [pendingTasks] = useState([
    'Verify 9 student profiles before next drive',
    'Share interview slot list for Google drive',
    'Approve 3 pending document corrections',
    'Finalize attendance for aptitude test',
  ]);

  const statusClass = (status) => {
    if (status === 'Offer') return 'status-pill offer';
    if (status === 'Shortlisted') return 'status-pill shortlisted';
    if (status === 'Interview') return 'status-pill interview';
    return 'status-pill applied';
  };

  return (
    <div className="tpo-dashboard-simple">
      <section className="tpo-hero">
        <div>
          <span className="hero-kicker">Class TPO Dashboard</span>
          <h1>{assignedClass}</h1>
          <p>
            You can manage only your assigned class data: student applications, class-wise drives,
            and placement progress.
          </p>
        </div>
      </section>

      <div className="tpo-stats-grid">
        <Card className="tpo-stat-card tone-blue">
          <p className="tpo-stat-label">Total Students</p>
          <h3>{classData.totalStudents}</h3>
        </Card>

        <Card className="tpo-stat-card tone-cyan">
          <p className="tpo-stat-label">Students Applied</p>
          <h3>{classData.studentsApplied}</h3>
        </Card>

        <Card className="tpo-stat-card tone-violet">
          <p className="tpo-stat-label">Companies Visited</p>
          <h3>{classData.companiesVisited}</h3>
        </Card>

        <Card className="tpo-stat-card tone-green">
          <p className="tpo-stat-label">Active Drives</p>
          <h3>{classData.activeDrives}</h3>
        </Card>

        <Card className="tpo-stat-card tone-orange">
          <p className="tpo-stat-label">Offers Released</p>
          <h3>{classData.offersReleased}</h3>
        </Card>
      </div>

      <div className="tpo-main-grid">
        <Card title="Recent Student Applications" className="tpo-panel-card">
          <div className="row-list">
            {recentApplications.map((item) => (
              <div key={`${item.rollNo}-${item.company}`} className="data-row">
                <div>
                  <h4>{item.student}</h4>
                  <p>{item.rollNo} • {item.company} • {item.role}</p>
                </div>
                <div className="data-row-right">
                  <span className={statusClass(item.status)}>{item.status}</span>
                  <small>{new Date(item.date).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Upcoming Company Drives" className="tpo-panel-card">
          <div className="row-list">
            {companyDrives.map((drive) => (
              <div key={`${drive.company}-${drive.date}`} className="data-row">
                <div>
                  <h4>{drive.company}</h4>
                  <p>{drive.role}</p>
                  <small>Min CGPA: {drive.minCgpa}</small>
                </div>
                <div className="data-row-right">
                  <span className="registered-pill">{drive.registered} Registered</span>
                  <small>{new Date(drive.date).toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Pending Actions (This Class)" className="tpo-panel-card task-panel">
        <ul className="task-list">
          {pendingTasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default TPODashboard;
