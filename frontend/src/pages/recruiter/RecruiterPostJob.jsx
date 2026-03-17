import React, { useState } from 'react';
import Card from '../../components/common/Card';
import './RecruiterPostJob.css';

const RecruiterPostJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minCGPA: 6.0,
    skills: '',
    salary: '',
    locations: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Job posted successfully!');
    setFormData({ title: '', description: '', minCGPA: 6.0, skills: '', salary: '', locations: '' });
  };

  return (
    <div className="recruiter-post-job">
      <div className="header">
        <h1>Post a New Job ➕</h1>
        <p>Create a new job opening for your company</p>
      </div>

      <Card title="Job Details Form">
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Software Engineer"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Minimum CGPA *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.minCGPA}
                onChange={(e) => setFormData({ ...formData, minCGPA: parseFloat(e.target.value) })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Salary (LPA) *</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g., 20"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Locations (comma-separated) *</label>
              <input
                type="text"
                value={formData.locations}
                onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                placeholder="e.g., Bangalore, Pune"
                className="form-input"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Job Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the job role and responsibilities"
                className="form-input"
                rows="6"
                required
              ></textarea>
            </div>

            <div className="form-group full-width">
              <label>Required Skills (comma-separated) *</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., Python, React, SQL"
                className="form-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Post Job
          </button>
        </form>
      </Card>
    </div>
  );
};

export default RecruiterPostJob;
