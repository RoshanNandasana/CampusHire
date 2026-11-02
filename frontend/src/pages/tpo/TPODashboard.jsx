import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import { tpoAPI } from '../../services/api';
import { extractArray, getApiErrorMessage, unwrapApiData } from './tpoUtils';
import './TPODashboard.css';

const TPODashboard = () => {
  const { user } = useAuth();

  const assignedClass = useMemo(() => {
    if (!user?.email) return 'CSE-A (Final Year)';
    if (user.email.includes('cse')) return 'CSE-A (Final Year)';
    if (user.email.includes('ece')) return 'ECE-B (Final Year)';
    return 'CSE-A (Final Year)';
  }, [user]);

  const [classData, setClassData] = useState({
    totalStudents: 0,
    studentsApplied: 0,
    companiesVisited: 0,
    activeDrives: 0,
    offersReleased: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);

  const [companyDrives, setCompanyDrives] = useState([]);

  const [pendingTasks, setPendingTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const statusClass = (status) => {
    if (status === 'Offer') return 'status-pill offer';
    if (status === 'Shortlisted') return 'status-pill shortlisted';
    if (status === 'Interview') return 'status-pill interview';
    return 'status-pill applied';
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [dashboardResponse, jobsResponse, applicationsResponse] = await Promise.all([
          tpoAPI.getDashboard(),
          tpoAPI.getJobs(),
          tpoAPI.getApplications(),
        ]);
        if (!isMounted) return;

        const dashboard = unwrapApiData(dashboardResponse);
        const stats = dashboard?.stats || {};
        const apps = extractArray(applicationsResponse, ['applications']);
        const jobs = extractArray(jobsResponse, ['jobs']);

        setClassData((prev) => ({
          ...prev,
          totalStudents: stats.totalStudents || prev.totalStudents,
          studentsApplied: apps.length,
          companiesVisited: new Set(apps.map((item) => item.company)).size,
          activeDrives: jobs.length,
          offersReleased: apps.filter((item) => item.status === 'offer').length,
        }));

        setRecentApplications(
          apps.slice(0, 6).map((item) => ({
            student: item.student,
            rollNo: item.email,
            company: item.company,
            role: item.position,
            status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Applied',
            date: item.appliedAt,
          }))
        );

        setCompanyDrives(
          jobs.slice(0, 6).map((item) => ({
            company: item.company?.name || 'Company',
            role: item.title,
            date: item.application_deadline,
            minCgpa: '-',
            registered: item.pipeline?.applied || 0,
          }))
        );

        setPendingTasks([
          `Review ${apps.filter((item) => item.status === 'applied').length} newly applied applications`,
          `Track ${jobs.length} active drives for this department`,
          'Update shortlist statuses after recruiter feedback',
          'Share upcoming round schedule with students',
        ]);
      } catch (error) {
        if (!isMounted) return;
        setError(getApiErrorMessage(error, 'Unable to load TPO dashboard data.'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

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

      {error && <div className="alert alert-error">{error}</div>}
      {isLoading && <div className="alert alert-success">Loading dashboard data...</div>}

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
