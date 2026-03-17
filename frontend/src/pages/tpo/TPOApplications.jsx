import React from 'react';
import Card from '../../components/common/Card';
import './TPOApplications.css';

const TPOApplications = () => {
  const [applications] = React.useState([
    { id: 1, student: 'Raj Kumar', company: 'Google', position: 'SWE', status: 'shortlisted', appliedAt: '2024-01-15' },
    { id: 2, student: 'Priya Singh', company: 'Microsoft', position: 'PM', status: 'interview', appliedAt: '2024-01-10' },
    { id: 3, student: 'Amit Patel', company: 'Amazon', position: 'DE', status: 'applied', appliedAt: '2024-01-20' },
    { id: 4, student: 'Neha Verma', company: 'Google', position: 'SWE', status: 'offer', appliedAt: '2024-01-05' },
  ]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'applied': return 'badge badge-info';
      case 'shortlisted': return 'badge badge-warning';
      case 'interview': return 'badge badge-secondary';
      case 'offer': return 'badge badge-success';
      default: return 'badge';
    }
  };

  return (
    <div className="tpo-applications">
      <div className="header">
        <h1>Application Tracking 📋</h1>
        <p>Monitor all student applications and statuses</p>
      </div>

      <Card title="All Applications">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Applied Date</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>{app.student}</td>
                <td>{app.company}</td>
                <td>{app.position}</td>
                <td><span className={getStatusBadgeClass(app.status)}>{app.status}</span></td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default TPOApplications;
