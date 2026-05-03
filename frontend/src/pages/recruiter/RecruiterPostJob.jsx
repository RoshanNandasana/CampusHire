import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { recruiterAPI } from '../../services/api';
import './RecruiterPostJob.css';

const DEFAULT_DOCUMENTS = [
  'Resume PDF',
  '10th Marksheet PDF',
  '12th Marksheet PDF',
  'Graduation Marksheet PDF',
  'Job Description PDF',
];

const emptyRound = () => ({
  name: '',
  date: '',
  time: '',
  mode: 'Online',
});

const RecruiterPostJob = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState(DEFAULT_DOCUMENTS);
  const [rounds, setRounds] = useState([emptyRound()]);
  const [deadlineError, setDeadlineError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    openings: 1,
    minCGPA: 6,
    skills: '',
    salary: '',
    location: '',
    driveDate: '',
    deadline: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    bondDurationMonths: 0,
    bondDetails: 'No bond required.',
    jobDescriptionFileName: '',
    bondAgreementFileName: '',
  });

  const handleFileUpload = (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, [field]: file.name }));
  };

  const handleDocumentToggle = (docName) => {
    setRequiredDocuments((prev) => {
      if (prev.includes(docName)) return prev.filter((doc) => doc !== docName);
      return [...prev, docName];
    });
  };

  const addRound = () => {
    setRounds((prev) => [...prev, emptyRound()]);
  };

  const removeRound = (index) => {
    setRounds((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRound = (index, key, value) => {
    setRounds((prev) => prev.map((round, i) => (i === index ? { ...round, [key]: value } : round)));
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateDeadline = (deadline, driveDate) => {
    if (!deadline) {
      setDeadlineError('');
      return true;
    }

    const today = new Date(getTodayDate());
    const deadlineDate = new Date(deadline);
    const driveDateObj = new Date(driveDate);

    if (deadlineDate < today) {
      setDeadlineError('Application deadline cannot be before today.');
      return false;
    }

    if (driveDate && deadlineDate > driveDateObj) {
      setDeadlineError('Application deadline cannot be after the drive date.');
      return false;
    }

    setDeadlineError('');
    return true;
  };

  const handleDeadlineChange = (e) => {
    const deadline = e.target.value;
    setFormData({ ...formData, deadline });
    validateDeadline(deadline, formData.driveDate);
  };

  const handleDriveDateChange = (e) => {
    const driveDate = e.target.value;
    setFormData({ ...formData, driveDate });
    validateDeadline(formData.deadline, driveDate);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      departmentId: '',
      openings: 1,
      minCGPA: 6,
      skills: '',
      salary: '',
      location: '',
      driveDate: '',
      deadline: '',
      contactName: '',
      contactRole: '',
      contactEmail: '',
      contactPhone: '',
      bondDurationMonths: 0,
      bondDetails: 'No bond required.',
      jobDescriptionFileName: '',
      bondAgreementFileName: '',
    });
    setRequiredDocuments(DEFAULT_DOCUMENTS);
    setRounds([emptyRound()]);
  };

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await recruiterAPI.getDepartments();
        const nextDepartments = Array.isArray(response?.data?.departments)
          ? response.data.departments
          : [];
        setDepartments(nextDepartments);
      } catch (error) {
        setDepartments([]);
      }
    };

    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validRounds = rounds.filter((round) => round.name.trim() && round.date);
    if (!validRounds.length) {
      setMessage('Add at least one round with date and time.');
      return;
    }

    if (!requiredDocuments.length) {
      setMessage('Select at least one required student document.');
      return;
    }

    if (!validateDeadline(formData.deadline, formData.driveDate)) {
      setMessage('Please fix the application deadline issues before submitting.');
      return;
    }

    try {
      await recruiterAPI.postJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        departmentId: formData.departmentId || undefined,
        openings: Number(formData.openings) || 1,
        minCGPA: Number(formData.minCGPA) || 0,
        skills: formData.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        salaryLpa: Number(formData.salary) || 0,
        location: formData.location.trim(),
        driveDate: formData.driveDate,
        deadline: formData.deadline,
        contactName: formData.contactName.trim(),
        contactRole: formData.contactRole.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        bondDurationMonths: Number(formData.bondDurationMonths) || 0,
        bondDetails: formData.bondDetails.trim(),
        requiredDocuments,
        rounds: validRounds,
      });

      setMessage('Job request posted successfully and shared to TPO panel for approval.');
      resetForm();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Unable to submit job request right now.');
    }
  };

  return (
    <div className="recruiter-post-job">
      <div className="header">
        <h1>Post a New Job</h1>
        <p>
          Recruiter posting view: submit hiring details with rounds, bond terms, and required PDFs.
        </p>
      </div>

      {message && <p className="form-message">{message}</p>}

      <Card title="Job Details Form">
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={user?.companyName || user?.email || 'Recruiter account'}
                className="form-input"
                readOnly
              />
            </div>

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
              <label>Target Department (Optional)</label>
              <select
                className="form-input"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">All Departments</option>
                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                    disabled={department.hasActiveTpo === false}
                  >
                    {department.name}
                    {department.hasActiveTpo === false ? ' (No active TPO assigned)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Openings *</label>
              <input
                type="number"
                min="1"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: Number(e.target.value) || 1 })}
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
              <label>Primary Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Bangalore"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Drive Date *</label>
              <input
                type="date"
                value={formData.driveDate}
                onChange={handleDriveDateChange}
                min={getTodayDate()}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Application Deadline *</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={handleDeadlineChange}
                min={getTodayDate()}
                max={formData.driveDate}
                className="form-input"
                required
              />
              {deadlineError && <p className="error-message">{deadlineError}</p>}
            </div>

            <div className="form-group">
              <label>Recruiter Contact Name *</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Recruiter Contact Role *</label>
              <input
                type="text"
                value={formData.contactRole}
                onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Recruiter Contact Email *</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Recruiter Contact Phone *</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Bond Duration (Months)</label>
              <input
                type="number"
                min="0"
                value={formData.bondDurationMonths}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bondDurationMonths: Number(e.target.value) || 0,
                    bondDetails: Number(e.target.value) > 0 ? formData.bondDetails : 'No bond required.',
                  })
                }
                className="form-input"
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
              <label>Bond Details</label>
              <textarea
                value={formData.bondDetails}
                onChange={(e) => setFormData({ ...formData, bondDetails: e.target.value })}
                placeholder="Enter bond terms, penalties, and release conditions"
                className="form-input"
                rows="4"
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

            <div className="form-group full-width">
              <label>Job Description PDF *</label>
              <input
                type="file"
                accept=".pdf"
                className="form-input"
                onChange={(event) => handleFileUpload('jobDescriptionFileName', event)}
                required
              />
              {formData.jobDescriptionFileName && <p className="file-name">{formData.jobDescriptionFileName}</p>}
            </div>

            {formData.bondDurationMonths > 0 && (
              <div className="form-group full-width">
                <label>Bond Agreement PDF *</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="form-input"
                  onChange={(event) => handleFileUpload('bondAgreementFileName', event)}
                  required
                />
                {formData.bondAgreementFileName && <p className="file-name">{formData.bondAgreementFileName}</p>}
              </div>
            )}

            <div className="form-group full-width">
              <label>Student Required Documents</label>
              <div className="checkbox-grid">
                {[
                  'Resume PDF',
                  '10th Marksheet PDF',
                  '12th Marksheet PDF',
                  'Graduation Marksheet PDF',
                  'Job Description PDF',
                  'Bond Agreement PDF',
                ].map((docName) => (
                  <label key={docName} className="doc-checkbox">
                    <input
                      type="checkbox"
                      checked={requiredDocuments.includes(docName)}
                      onChange={() => handleDocumentToggle(docName)}
                    />
                    <span>{docName}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group full-width">
              <div className="rounds-header">
                <label>Selection Rounds with Date and Time</label>
                <button type="button" className="btn btn-secondary" onClick={addRound}>
                  Add Round
                </button>
              </div>

              <div className="round-grid">
                {rounds.map((round, index) => (
                  <div key={`round-${index}`} className="round-card">
                    <div className="form-group">
                      <label>Round Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={round.name}
                        onChange={(e) => updateRound(index, 'name', e.target.value)}
                        placeholder="e.g., Technical Round 1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={round.date}
                        onChange={(e) => updateRound(index, 'date', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        className="form-input"
                        value={round.time}
                        onChange={(e) => updateRound(index, 'time', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Mode</label>
                      <select
                        className="form-input"
                        value={round.mode}
                        onChange={(e) => updateRound(index, 'mode', e.target.value)}
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outlined remove-round"
                        onClick={() => removeRound(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Submit Job Request
          </button>
        </form>
      </Card>
    </div>
  );
};

export default RecruiterPostJob;
