import React, { useState } from 'react';
import Card from '../../components/common/Card';
import './TPOStudents.css';

const TPOStudents = () => {
  const [filters, setFilters] = useState({
    branch: '',
    minCGPA: 5.0,
  });

  const [students] = useState([
    { id: 1, name: 'Raj Kumar', email: 'raj@example.com', branch: 'CSE', cgpa: 8.5, placed: true, company: 'Google' },
    { id: 2, name: 'Priya Singh', email: 'priya@example.com', branch: 'CSE', cgpa: 8.2, placed: true, company: 'Microsoft' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', branch: 'ECE', cgpa: 7.8, placed: false, company: null },
    { id: 4, name: 'Neha Verma', email: 'neha@example.com', branch: 'CSE', cgpa: 8.9, placed: true, company: 'Amazon' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', branch: 'ME', cgpa: 7.2, placed: false, company: null },
    { id: 6, name: 'Anjali Sharma', email: 'anjali@example.com', branch: 'ECE', cgpa: 8.0, placed: true, company: 'TCS' },
  ]);

  return (
    <div className="tpo-students">
      <div className="header">
        <h1>Student Management 👥</h1>
        <p>View and manage all students in the college</p>
      </div>

      <Card title="Filter Students" className="filter-card">
        <div className="filter-grid">
          <div className="filter-group">
            <label>Branch</label>
            <select
              value={filters.branch}
              onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
              className="form-input"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Min CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={filters.minCGPA}
              onChange={(e) => setFilters({ ...filters, minCGPA: parseFloat(e.target.value) })}
              className="form-input"
            />
          </div>
        </div>
      </Card>

      <Card title="📊 Student List" className="students-card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Branch</th>
              <th>CGPA</th>
              <th>Status</th>
              <th>Company</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td className="email">{student.email}</td>
                <td>{student.branch}</td>
                <td><strong>{student.cgpa}</strong></td>
                <td>
                  <span className={`badge ${student.placed ? 'badge-success' : 'badge-warning'}`}>
                    {student.placed ? 'Placed' : 'Pending'}
                  </span>
                </td>
                <td>{student.company || '-'}</td>
                <td>
                  <button className="btn btn-small btn-outlined">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default TPOStudents;
