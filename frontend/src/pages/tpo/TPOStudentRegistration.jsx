import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { tpoAPI } from '../../services/api';
import { extractArray, getApiErrorMessage } from './tpoUtils';
import './TPOStudentRegistration.css';

const defaultSingleForm = {
  email: '',
  password: '',
  enrollment_number: '',
  cgpa: '',
  tenth_percentage: '',
  twelfth_percentage: '',
  backlog_count: '0',
};

const TPOStudentRegistration = () => {
  const [activeMode, setActiveMode] = useState('single');
  const [singleForm, setSingleForm] = useState(defaultSingleForm);
  const [bulkFile, setBulkFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [students, setStudents] = useState([]);

  const formatApiError = (error, fallback) => {
    return getApiErrorMessage(error, fallback);
  };

  const normalizeText = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    try {
      return JSON.stringify(value);
    } catch (_) {
      return fallback;
    }
  };

  const loadStudents = async () => {
    try {
      const response = await tpoAPI.getStudents();
      const items = extractArray(response, ['students']);
      setStudents(items);
    } catch (error) {
      setStudents([]);
      setMessage(getApiErrorMessage(error, 'Unable to load students right now.'));
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSingleChange = (event) => {
    const { name, value } = event.target;
    setSingleForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitSingle = async () => {
    setMessage('');
    setSingleResult(null);

    if (!singleForm.email || !singleForm.enrollment_number || !singleForm.password) {
      setMessage('Email, password, and enrollment number are required.');
      return;
    }

    if (singleForm.password.trim().length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: singleForm.email.trim(),
        password: singleForm.password.trim(),
        enrollment_number: singleForm.enrollment_number.trim(),
        cgpa: Number(singleForm.cgpa || 0),
        tenth_percentage: Number(singleForm.tenth_percentage || 0),
        twelfth_percentage: Number(singleForm.twelfth_percentage || 0),
        backlog_count: Number(singleForm.backlog_count || 0),
      };

      const response = await tpoAPI.createStudent(payload);
      const data = response?.data || {};
      setSingleResult(data);
      setMessage('Student created successfully.');
      setSingleForm(defaultSingleForm);
      await loadStudents();
    } catch (error) {
      setMessage(formatApiError(error, 'Unable to create student right now.'));
    } finally {
      setLoading(false);
    }
  };

  const submitBulk = async () => {
    setMessage('');
    setBulkResult(null);

    if (!bulkFile) {
      setMessage('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);
      const response = await tpoAPI.bulkUploadStudents(formData);
      setBulkResult(response?.data || null);
      setMessage('Bulk upload processed successfully.');
      setBulkFile(null);
      await loadStudents();
    } catch (error) {
      setMessage(formatApiError(error, 'Unable to process bulk upload.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tpo-student-registration">
      <div className="registration-header">
        <h1>Student Registration</h1>
        <p>Create student accounts mapped to your department using single entry or CSV bulk upload.</p>
      </div>

      {message && <p className="registration-message">{message}</p>}

      <Card title="Registration Mode" className="mode-card">
        <div className="mode-switch">
          <button
            type="button"
            className={`btn btn-small ${activeMode === 'single' ? 'btn-primary' : 'btn-outlined'}`}
            onClick={() => setActiveMode('single')}
          >
            Single Upload
          </button>
          <button
            type="button"
            className={`btn btn-small ${activeMode === 'bulk' ? 'btn-primary' : 'btn-outlined'}`}
            onClick={() => setActiveMode('bulk')}
          >
            Bulk Upload (CSV)
          </button>
        </div>
      </Card>

      {activeMode === 'single' ? (
        <Card title="Single Student Registration" className="registration-card">
          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={singleForm.email}
                onChange={handleSingleChange}
                className="form-input"
                placeholder="student@college.edu"
              />
            </div>

            <div className="form-group">
              <label>Password (required, min 8)</label>
              <input
                type="password"
                name="password"
                value={singleForm.password}
                onChange={handleSingleChange}
                className="form-input"
                placeholder="Enter password"
              />
            </div>

            <div className="form-group">
              <label>Enrollment Number</label>
              <input
                name="enrollment_number"
                value={singleForm.enrollment_number}
                onChange={handleSingleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                name="cgpa"
                value={singleForm.cgpa}
                onChange={handleSingleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>10th Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                name="tenth_percentage"
                value={singleForm.tenth_percentage}
                onChange={handleSingleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>12th Percentage</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                name="twelfth_percentage"
                value={singleForm.twelfth_percentage}
                onChange={handleSingleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Backlog Count</label>
              <input
                type="number"
                min="0"
                name="backlog_count"
                value={singleForm.backlog_count}
                onChange={handleSingleChange}
                className="form-input"
              />
            </div>
          </div>

          <button type="button" className="btn btn-primary" onClick={submitSingle} disabled={loading}>
            {loading ? 'Creating...' : 'Create Student'}
          </button>

          {singleResult && (
            <div className="result-box">
              <p><strong>Email:</strong> {singleResult.email}</p>
              <p><strong>Enrollment:</strong> {singleResult.enrollment_number}</p>
              <p><strong>Password:</strong> Set successfully</p>
            </div>
          )}
        </Card>
      ) : (
        <Card title="Bulk Student Upload (CSV)" className="registration-card">
          <p className="csv-note">
            Required CSV columns: email,password,enrollment_number,cgpa,tenth_percentage,twelfth_percentage,backlog_count (password is mandatory, min 8)
          </p>

          <div className="form-group">
            <label>Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              className="form-input"
              onChange={(event) => setBulkFile(event.target.files?.[0] || null)}
            />
          </div>

          <button type="button" className="btn btn-primary" onClick={submitBulk} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload CSV'}
          </button>

          {bulkResult && (
            <div className="result-box">
              <p><strong>Created:</strong> {bulkResult.created_count || 0}</p>
              <p><strong>Failed:</strong> {bulkResult.failed_count || 0}</p>
              {Array.isArray(bulkResult.errors) && bulkResult.errors.length > 0 ? (
                <ul className="error-list">
                  {bulkResult.errors.slice(0, 8).map((err, idx) => (
                    <li key={`${err.line || idx}-${idx}`}>
                      Line {normalizeText(err.line, '-')}: {normalizeText(err.error, 'Invalid row')}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </Card>
      )}

      <Card title={`Department Students (${students.length})`} className="registration-card">
        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Enrollment</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-students">No students found in your department.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id || `${student.email}-${student.enrollment_number}`}>
                    <td>{student.email}</td>
                    <td>{student.enrollment_number}</td>
                    <td>{student.cgpa}</td>
                    <td>{student.backlog_count}</td>
                    <td>{student.department_name || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TPOStudentRegistration;
