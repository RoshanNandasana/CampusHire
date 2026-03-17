import React from 'react';
import Card from '../../components/common/Card';
import './RecruiterJobs.css';

const RecruiterJobs = () => {
  const [jobs] = React.useState([
    { id: 1, title: 'Software Engineer', applicants: 145, shortlisted: 32, posted: '2024-01-10' },
    { id: 2, title: 'Product Manager', applicants: 98, shortlisted: 15, posted: '2024-01-15' },
    { id: 3, title: 'Data Engineer', applicants: 125, shortlisted: 28, posted: '2024-01-12' },
  ]);

  return (
    <div className="recruiter-jobs">
      <div className="header">
        <h1>My Job Postings</h1>
      </div>

      <Card title="Active Jobs">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Applicants</th>
              <th>Shortlisted</th>
              <th>Posted Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.applicants}</td>
                <td><span className="badge badge-info">{job.shortlisted}</span></td>
                <td>{new Date(job.posted).toLocaleDateString()}</td>
                <td><button className="btn btn-small btn-outlined">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default RecruiterJobs;
