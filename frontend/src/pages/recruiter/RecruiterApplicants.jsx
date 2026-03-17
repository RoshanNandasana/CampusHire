import React from 'react';
import Card from '../../components/common/Card';
import './RecruiterApplicants.css';

const RecruiterApplicants = () => {
  const [applicants] = React.useState([
    { id: 1, name: 'Raj Kumar', position: 'SWE', status: 'shortlisted', cgpa: 8.5 },
    { id: 2, name: 'Priya Singh', position: 'SWE', status: 'applied', cgpa: 8.2 },
    { id: 3, name: 'Neha Verma', position: 'PM', status: 'interview', cgpa: 8.9 },
  ]);

  return (
    <div className="recruiter-applicants">
      <div className="header"><h1>Manage Applicants 👥</h1></div>
      <Card title="Applicants">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Position</th><th>CGPA</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {applicants.map((app) => (
              <tr key={app.id}>
                <td>{app.name}</td><td>{app.position}</td><td>{app.cgpa}</td>
                <td><span className="badge">{app.status}</span></td>
                <td><button className="btn btn-small">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default RecruiterApplicants;
