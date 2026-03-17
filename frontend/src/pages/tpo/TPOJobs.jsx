import React from 'react';
import Card from '../../components/common/Card';
import './TPOJobs.css';

const TPOJobs = () => {
  const [jobs] = React.useState([
    { id: 1, company: 'Google', position: 'Software Engineer', applicants: 145, shortlisted: 32, posted: '2024-01-10' },
    { id: 2, company: 'Microsoft', position: 'Product Manager', applicants: 98, shortlisted: 15, posted: '2024-01-15' },
    { id: 3, company: 'Amazon', position: 'Data Engineer', applicants: 125, shortlisted: 28, posted: '2024-01-12' },
    { id: 4, company: 'TCS', position: 'Systems Engineer', applicants: 210, shortlisted: 85, posted: '2024-01-08' },
  ]);

  return (
    <div className="tpo-jobs">
      <div className="header">
        <h1>Job Monitoring</h1>
        <p>Track all job postings and applications</p>
      </div>

      <Card title="📊 Active Job Postings">
        <table className="table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Posted</th>
              <th>Applicants</th>
              <th>Shortlisted</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.company}</td>
                <td>{job.position}</td>
                <td>{new Date(job.posted).toLocaleDateString()}</td>
                <td>{job.applicants}</td>
                <td><span className="badge badge-info">{job.shortlisted}</span></td>
                <td>
                  <span className="badge badge-success">
                    {((job.shortlisted / job.applicants) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default TPOJobs;
