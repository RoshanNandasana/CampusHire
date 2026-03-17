import React, { useState } from 'react';
import {
  MdAdd,
  MdDeleteOutline,
  MdEdit,
  MdPerson,
  MdSave,
  MdSchool,
  MdUploadFile,
  MdVerified,
  MdWorkOutline,
  MdWorkspacePremium,
} from 'react-icons/md';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import StudentTopPanel from '../../components/student/StudentTopPanel';
import './StudentProfile.css';

const StudentProfile = () => {
  const departmentProfile = {
    fullName: 'John Doe',
    enrollmentNo: 'CH-2022-041',
    collegeEmail: 'john.doe@college.edu',
    branch: 'Computer Science',
    program: 'B.Tech',
    year: 'Final Year',
    batch: '2022 - 2026',
    section: 'A',
    mentor: 'Dr. R. Sharma',
    departmentStatus: 'Verified by Department',
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [message, setMessage] = useState('');
  const [modalState, setModalState] = useState({
    skill: false,
    certification: false,
    project: false,
    education: false,
    document: false,
  });

  const [profileData, setProfileData] = useState({
    personalEmail: 'john.workmail@gmail.com',
    phone: '+91 98765 43210',
    alternatePhone: '+91 91234 56780',
    dateOfBirth: '2004-08-20',
    gender: 'Male',
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: 'Satellite Road, Ahmedabad, Gujarat',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev',
    summary:
      'Final year student focused on full stack development and cloud-native applications. Open to SDE and platform roles.',
    graduationCgpa: '8.2',
  });

  const [educationRecords, setEducationRecords] = useState([
    {
      id: 'ten',
      label: 'Class 10 (SSC)',
      board: 'CBSE',
      institute: 'Shree Vidya Mandir School',
      year: '2020',
      score: '92%',
      fileName: 'class_10_marksheet.pdf',
    },
    {
      id: 'twelve',
      label: 'Class 12 (HSC)',
      board: 'GSEB',
      institute: 'Shree Vidya Junior College',
      year: '2022',
      score: '88%',
      fileName: 'class_12_marksheet.pdf',
    },
    {
      id: 'grad',
      label: 'Current Graduation',
      board: 'GTU',
      institute: 'ABC Institute of Technology',
      year: '2026 (Expected)',
      score: 'CGPA 8.2',
      fileName: 'latest_sem_marksheet.pdf',
    },
  ]);

  const [skills, setSkills] = useState([
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'SQL',
    'System Design',
  ]);
  const [newSkill, setNewSkill] = useState('');

  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'Campus Placement Portal',
      role: 'Full Stack Developer',
      duration: 'Jan 2025 - Apr 2025',
      summary: 'Built role-based placement management with dashboards and application tracking.',
      impact: 'Reduced manual placement coordination by 40%',
      technologies: ['React', 'FastAPI', 'PostgreSQL'],
      repo: 'https://github.com/johndoe/campushire',
      demo: 'https://campushire-demo.app',
    },
  ]);
  const [projectDraft, setProjectDraft] = useState({
    title: '',
    role: '',
    duration: '',
    summary: '',
    impact: '',
    technologies: '',
    repo: '',
    demo: '',
  });

  const [certifications, setCertifications] = useState([
    'AWS Certified Cloud Practitioner',
    'Meta React Professional Certificate',
  ]);
  const [newCertification, setNewCertification] = useState('');

  const [additionalDocs, setAdditionalDocs] = useState([
    { id: 'resume', label: 'Latest Resume', fileName: 'john_doe_resume.pdf' },
    { id: 'aadhar', label: 'Government ID Proof', fileName: 'aadhar_masked.pdf' },
    { id: 'internship', label: 'Internship Letter', fileName: 'internship_offer_letter.pdf' },
  ]);

  const [educationDraft, setEducationDraft] = useState({
    label: '',
    board: '',
    institute: '',
    year: '',
    score: '',
    fileName: '',
  });

  const [documentDraft, setDocumentDraft] = useState({
    label: '',
    fileName: '',
  });

  const getInitials = (name) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const openAddModal = (key) => {
    setModalState((prev) => ({ ...prev, [key]: true }));
  };

  const closeAddModal = (key) => {
    setModalState((prev) => ({ ...prev, [key]: false }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfilePhoto(URL.createObjectURL(file));
    setMessage('Profile photo updated.');
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    if (!profileData.phone || !profileData.personalEmail) {
      setMessage('Phone and personal email are required.');
      return;
    }
    setMessage('Profile details saved successfully.');
    setIsEditMode(false);
  };

  const addSkill = () => {
    const cleaned = newSkill.trim();
    if (!cleaned) {
      setMessage('Please enter a skill name.');
      return;
    }
    if (skills.includes(cleaned)) {
      setMessage('This skill is already added.');
      return;
    }
    setSkills((prev) => [...prev, cleaned]);
    setNewSkill('');
    closeAddModal('skill');
    setMessage('Skill added successfully.');
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleEducationChange = (recordId, field, value) => {
    setEducationRecords((prev) =>
      prev.map((record) =>
        record.id === recordId ? { ...record, [field]: value } : record
      )
    );
  };

  const handleEducationFileUpload = (recordId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEducationRecords((prev) =>
      prev.map((record) =>
        record.id === recordId ? { ...record, fileName: file.name } : record
      )
    );
    setMessage('Marksheet updated successfully.');
  };

  const handleEducationDraftFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEducationDraft((prev) => ({ ...prev, fileName: file.name }));
  };

  const addEducationRecord = () => {
    if (
      !educationDraft.label.trim() ||
      !educationDraft.board.trim() ||
      !educationDraft.institute.trim() ||
      !educationDraft.year.trim() ||
      !educationDraft.score.trim()
    ) {
      setMessage('Please complete all required academic fields.');
      return;
    }

    setEducationRecords((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        label: educationDraft.label.trim(),
        board: educationDraft.board.trim(),
        institute: educationDraft.institute.trim(),
        year: educationDraft.year.trim(),
        score: educationDraft.score.trim(),
        fileName: educationDraft.fileName,
      },
    ]);

    setEducationDraft({
      label: '',
      board: '',
      institute: '',
      year: '',
      score: '',
      fileName: '',
    });
    closeAddModal('education');
    setMessage('Academic record added successfully.');
  };

  const addProject = () => {
    if (!projectDraft.title.trim() || !projectDraft.summary.trim()) {
      setMessage('Project title and summary are required.');
      return;
    }

    const technologies = projectDraft.technologies
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    setProjects((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: projectDraft.title.trim(),
        role: projectDraft.role.trim(),
        duration: projectDraft.duration.trim(),
        summary: projectDraft.summary.trim(),
        impact: projectDraft.impact.trim(),
        technologies,
        repo: projectDraft.repo.trim(),
        demo: projectDraft.demo.trim(),
      },
    ]);

    setProjectDraft({
      title: '',
      role: '',
      duration: '',
      summary: '',
      impact: '',
      technologies: '',
      repo: '',
      demo: '',
    });

    closeAddModal('project');
    setMessage('Project added to profile.');
  };

  const removeProject = (projectId) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  };

  const addCertification = () => {
    const cleaned = newCertification.trim();
    if (!cleaned) {
      setMessage('Please enter certification name.');
      return;
    }
    if (certifications.includes(cleaned)) {
      setMessage('This certification is already added.');
      return;
    }
    setCertifications((prev) => [...prev, cleaned]);
    setNewCertification('');
    closeAddModal('certification');
    setMessage('Certification added successfully.');
  };

  const removeCertification = (certification) => {
    setCertifications((prev) => prev.filter((item) => item !== certification));
  };

  const handleDocumentUpload = (docId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAdditionalDocs((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, fileName: file.name } : doc))
    );
    setMessage('Document replaced successfully.');
  };

  const handleDocumentDraftFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocumentDraft((prev) => ({ ...prev, fileName: file.name }));
  };

  const addDocument = () => {
    if (!documentDraft.label.trim() || !documentDraft.fileName.trim()) {
      setMessage('Document label and file are required.');
      return;
    }

    setAdditionalDocs((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        label: documentDraft.label.trim(),
        fileName: documentDraft.fileName.trim(),
      },
    ]);

    setDocumentDraft({ label: '', fileName: '' });
    closeAddModal('document');
    setMessage('Document added successfully.');
  };

  return (
    <div className="student-profile">
      <StudentTopPanel
        title="My Profile"
        subtitle="Maintain complete, recruiter-ready profile details with department-locked records and TPO visibility."
        kicker="Student Profile"
        stats={[
          { label: 'Core Skills', value: skills.length },
          { label: 'Projects', value: projects.length },
          { label: 'Certifications', value: certifications.length },
          { label: 'Academic Records', value: educationRecords.length },
        ]}
        tpoUpdates={[
          'Department-verified fields remain non-editable',
          'TPO checks profile completeness before company shortlisting',
          '10th/12th/degree records must be up to date',
          'Document replacements reflect instantly for verification',
        ]}
        action={(
          <button
            type="button"
            className="profile-action"
            onClick={() => {
              setIsEditMode((prev) => !prev);
              setMessage('');
            }}
          >
            <MdEdit aria-hidden="true" />
            {isEditMode ? 'Disable Editing' : 'Enable Editing'}
          </button>
        )}
      />

      {message && <p className="form-success">{message}</p>}

      <Card title="Identity & Department Records" icon={<MdPerson />} className="identity-card">
        <p className="section-caption">
          This section is managed by your department and remains non-editable.
        </p>
        <div className="identity-layout">
          <div className="avatar-wrap">
            <div className="profile-avatar">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" />
              ) : (
                <span>{getInitials(departmentProfile.fullName)}</span>
              )}
            </div>
            <label htmlFor="profile-photo-input" className="resume-btn resume-btn--upload">
              <MdUploadFile aria-hidden="true" />
              Upload Photo
            </label>
            <input
              id="profile-photo-input"
              className="resume-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="identity-details">
            <span className="verified-badge">
              <MdVerified aria-hidden="true" />
              {departmentProfile.departmentStatus}
            </span>
            <div className="locked-note">
              Name, enrollment number, branch, batch and college email are locked by your department.
            </div>
            <div className="info-grid info-grid-identity">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{departmentProfile.fullName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Enrollment No</span>
                <span className="info-value">{departmentProfile.enrollmentNo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Branch</span>
                <span className="info-value">{departmentProfile.branch}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Program</span>
                <span className="info-value">{departmentProfile.program}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Current Year</span>
                <span className="info-value">{departmentProfile.year}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Batch</span>
                <span className="info-value">{departmentProfile.batch}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Section</span>
                <span className="info-value">{departmentProfile.section}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mentor</span>
                <span className="info-value">{departmentProfile.mentor}</span>
              </div>
              <div className="info-item">
                <span className="info-label">College Email</span>
                <span className="info-value">{departmentProfile.collegeEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Personal, Contact & Professional Links" className="edit-form personal-card mt-3">
        <p className="section-caption">
          Keep this information updated for recruiters. Toggle editing from the top-right action.
        </p>
        <div className="form-grid">
          <div className="form-group">
            <label>Personal Email</label>
            <input
              className="form-input"
              name="personalEmail"
              value={profileData.personalEmail}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              className="form-input"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>Alternate Phone</label>
            <input
              className="form-input"
              name="alternatePhone"
              value={profileData.alternatePhone}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              className="form-input"
              name="dateOfBirth"
              value={profileData.dateOfBirth}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <input
              className="form-input"
              name="gender"
              value={profileData.gender}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>Current City</label>
            <input
              className="form-input"
              name="city"
              value={profileData.city}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input
              className="form-input"
              name="state"
              value={profileData.state}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>Graduation CGPA</label>
            <input
              className="form-input"
              name="graduationCgpa"
              value={profileData.graduationCgpa}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group form-span-2">
            <label>Address</label>
            <input
              className="form-input"
              name="address"
              value={profileData.address}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              className="form-input"
              name="linkedin"
              value={profileData.linkedin}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group">
            <label>GitHub URL</label>
            <input
              className="form-input"
              name="github"
              value={profileData.github}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group form-span-2">
            <label>Portfolio URL</label>
            <input
              className="form-input"
              name="portfolio"
              value={profileData.portfolio}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
          <div className="form-group form-span-2">
            <label>Professional Summary</label>
            <textarea
              className="form-input"
              rows={4}
              name="summary"
              value={profileData.summary}
              onChange={handleProfileChange}
              readOnly={!isEditMode}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-primary" disabled={!isEditMode} onClick={handleSaveProfile}>
            <MdSave aria-hidden="true" /> Save Details
          </button>
        </div>
      </Card>

      <Card title="Academic Records (10th / 12th / Graduation)" icon={<MdSchool />} className="academic-card">
        <div className="section-head">
          <p className="section-caption">
            Add board, year, score and marksheet file for each level. These details are shown to eligible recruiters.
          </p>
          <button type="button" className="btn btn-primary btn-small add-entity-btn" onClick={() => openAddModal('education')}>
            <MdAdd aria-hidden="true" /> Add Record
          </button>
        </div>
        <div className="marksheet-list">
          {educationRecords.map((record) => (
            <div key={record.id} className="marksheet-item">
              <div className="record-header">
                <h4>{record.label}</h4>
                <span className="file-chip">{record.fileName || 'No file uploaded'}</span>
              </div>
              <div className="marksheet-grid">
                <div className="form-group">
                  <label>Board / University</label>
                  <input
                    className="form-input"
                    value={record.board}
                    readOnly={!isEditMode}
                    onChange={(event) =>
                      handleEducationChange(record.id, 'board', event.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>School / College</label>
                  <input
                    className="form-input"
                    value={record.institute}
                    readOnly={!isEditMode}
                    onChange={(event) =>
                      handleEducationChange(record.id, 'institute', event.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Passing Year</label>
                  <input
                    className="form-input"
                    value={record.year}
                    readOnly={!isEditMode}
                    onChange={(event) =>
                      handleEducationChange(record.id, 'year', event.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Percentage / CGPA</label>
                  <input
                    className="form-input"
                    value={record.score}
                    readOnly={!isEditMode}
                    onChange={(event) =>
                      handleEducationChange(record.id, 'score', event.target.value)
                    }
                  />
                </div>
              </div>
              <label htmlFor={`marksheet-${record.id}`} className="resume-btn resume-btn--upload marksheet-upload">
                <MdUploadFile aria-hidden="true" /> Upload Marksheet
              </label>
              <input
                id={`marksheet-${record.id}`}
                type="file"
                className="resume-file-input"
                onChange={(event) => handleEducationFileUpload(record.id, event)}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="profile-grid mt-3">
        <Card title="Skills (LinkedIn Style)" className="skills-card">
          <div className="section-head">
            <p className="section-caption">
              Add each skill separately so it appears as a clear chip for recruiters.
            </p>
            <button type="button" className="btn btn-primary btn-small add-entity-btn" onClick={() => openAddModal('skill')}>
              <MdAdd aria-hidden="true" /> Add Skill
            </button>
          </div>
          <div className="skills-container">
            {skills.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
                {isEditMode && (
                  <button type="button" className="skill-remove" onClick={() => removeSkill(skill)}>
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Certifications" icon={<MdWorkspacePremium />} className="certifications-card">
          <div className="section-head">
            <p className="section-caption">
              Add completed certifications with exact names to improve shortlist rate.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-small add-entity-btn"
              onClick={() => openAddModal('certification')}
            >
              <MdAdd aria-hidden="true" /> Add Certification
            </button>
          </div>
          <div className="certifications-list">
            {certifications.map((certification) => (
              <div className="cert-item" key={certification}>
                <span className="cert-icon">🏅</span>
                <div className="cert-info">
                  <h4>{certification}</h4>
                </div>
                {isEditMode && (
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => removeCertification(certification)}
                  >
                    <MdDeleteOutline aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Projects" icon={<MdWorkOutline />} className="projects-card">
        <div className="section-head">
          <p className="section-caption">
            Add projects with role, duration, technologies and links. Keep each project outcome-focused.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-small add-entity-btn"
            onClick={() => openAddModal('project')}
          >
            <MdAdd aria-hidden="true" /> Add Project
          </button>
        </div>
        <div className="projects-list">
          {projects.map((project) => (
            <div className="project-item" key={project.id}>
              <span className="project-icon">🧩</span>
              <div className="project-content">
                <h4>{project.title}</h4>
                <p>{project.summary}</p>
                <span className="project-meta">
                  {project.role || 'Role not set'} • {project.duration || 'Duration not set'}
                </span>
                {project.impact && <span className="project-impact">Impact: {project.impact}</span>}
                <div className="tag-row">
                  {project.technologies.map((technology) => (
                    <span key={technology} className="mini-tag">
                      {technology}
                    </span>
                  ))}
                </div>
                <div className="link-row">
                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noreferrer">
                      Repository
                    </a>
                  )}
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noreferrer">
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
              {isEditMode && (
                <div className="item-actions">
                  <button type="button" className="icon-btn danger" onClick={() => removeProject(project.id)}>
                    <MdDeleteOutline aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Additional Documents" icon={<MdUploadFile />} className="resume-card mt-3">
        <div className="section-head">
          <p className="section-caption">
            Keep supporting documents ready so recruiters and placement office can verify quickly.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-small add-entity-btn"
            onClick={() => openAddModal('document')}
          >
            <MdAdd aria-hidden="true" /> Add Document
          </button>
        </div>
        <div className="document-list">
          {additionalDocs.map((document) => (
            <div className="document-item" key={document.id}>
              <div>
                <h4>{document.label}</h4>
                <p>{document.fileName}</p>
              </div>
              <label htmlFor={`doc-${document.id}`} className="resume-btn resume-btn--upload doc-upload-btn">
                <MdUploadFile aria-hidden="true" /> Replace
              </label>
              <input
                id={`doc-${document.id}`}
                type="file"
                className="resume-file-input"
                onChange={(event) => handleDocumentUpload(document.id, event)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={modalState.skill}
        title="Add Skill"
        onClose={() => closeAddModal('skill')}
        onConfirm={addSkill}
        confirmText="Add Skill"
      >
        <div className="modal-form">
          <p className="modal-help">Enter a single skill exactly as you want it displayed.</p>
          <div className="form-group">
            <label>Skill Name</label>
            <input
              className="form-input"
              placeholder="e.g., Docker"
              value={newSkill}
              onChange={(event) => setNewSkill(event.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalState.certification}
        title="Add Certification"
        onClose={() => closeAddModal('certification')}
        onConfirm={addCertification}
        confirmText="Add Certification"
      >
        <div className="modal-form">
          <p className="modal-help">Add completed certification title.</p>
          <div className="form-group">
            <label>Certification Name</label>
            <input
              className="form-input"
              placeholder="e.g., AWS Certified Cloud Practitioner"
              value={newCertification}
              onChange={(event) => setNewCertification(event.target.value)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalState.project}
        title="Add Project"
        onClose={() => closeAddModal('project')}
        onConfirm={addProject}
        confirmText="Add Project"
      >
        <div className="modal-form">
          <p className="modal-help">Add project details carefully. Title and summary are required.</p>
          <div className="form-grid">
            <div className="form-group">
              <label>Project Title</label>
              <input
                className="form-input"
                value={projectDraft.title}
                onChange={(event) => setProjectDraft((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Your Role</label>
              <input
                className="form-input"
                value={projectDraft.role}
                onChange={(event) => setProjectDraft((prev) => ({ ...prev, role: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                className="form-input"
                value={projectDraft.duration}
                onChange={(event) => setProjectDraft((prev) => ({ ...prev, duration: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Technologies (comma separated)</label>
              <input
                className="form-input"
                value={projectDraft.technologies}
                onChange={(event) =>
                  setProjectDraft((prev) => ({ ...prev, technologies: event.target.value }))
                }
              />
            </div>
            <div className="form-group form-span-2">
              <label>Project Summary</label>
              <textarea
                className="form-input modal-textarea"
                rows={3}
                value={projectDraft.summary}
                onChange={(event) => setProjectDraft((prev) => ({ ...prev, summary: event.target.value }))}
              />
            </div>
            <div className="form-group form-span-2">
              <label>Impact / Outcome</label>
              <input
                className="form-input"
                value={projectDraft.impact}
                onChange={(event) => setProjectDraft((prev) => ({ ...prev, impact: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Repository Link</label>
              <input
                className="form-input"
                value={projectDraft.repo}
                onChange={(event) => setProjectDraft((prev) => ({ ...prev, repo: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Demo Link</label>
              <input
                className="form-input"
                value={projectDraft.demo}
                onChange={(event) => setProjectDraft((prev) => ({ ...prev, demo: event.target.value }))}
              />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalState.education}
        title="Add Academic Record"
        onClose={() => closeAddModal('education')}
        onConfirm={addEducationRecord}
        confirmText="Add Record"
      >
        <div className="modal-form">
          <p className="modal-help">Add 10th/12th/diploma/other academic details and optional marksheet file name.</p>
          <div className="form-grid">
            <div className="form-group">
              <label>Record Label</label>
              <input
                className="form-input"
                placeholder="e.g., Diploma"
                value={educationDraft.label}
                onChange={(event) => setEducationDraft((prev) => ({ ...prev, label: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Board / University</label>
              <input
                className="form-input"
                value={educationDraft.board}
                onChange={(event) => setEducationDraft((prev) => ({ ...prev, board: event.target.value }))}
              />
            </div>
            <div className="form-group form-span-2">
              <label>School / College</label>
              <input
                className="form-input"
                value={educationDraft.institute}
                onChange={(event) => setEducationDraft((prev) => ({ ...prev, institute: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Passing Year</label>
              <input
                className="form-input"
                value={educationDraft.year}
                onChange={(event) => setEducationDraft((prev) => ({ ...prev, year: event.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Percentage / CGPA</label>
              <input
                className="form-input"
                value={educationDraft.score}
                onChange={(event) => setEducationDraft((prev) => ({ ...prev, score: event.target.value }))}
              />
            </div>
            <div className="form-group form-span-2">
              <label>Marksheet File</label>
              <input type="file" className="form-input" onChange={handleEducationDraftFileUpload} />
              {educationDraft.fileName && <span className="modal-file-name">{educationDraft.fileName}</span>}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalState.document}
        title="Add Document"
        onClose={() => closeAddModal('document')}
        onConfirm={addDocument}
        confirmText="Add Document"
      >
        <div className="modal-form">
          <p className="modal-help">Add a document label and upload a file.</p>
          <div className="form-group">
            <label>Document Label</label>
            <input
              className="form-input"
              placeholder="e.g., Offer Letter"
              value={documentDraft.label}
              onChange={(event) => setDocumentDraft((prev) => ({ ...prev, label: event.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Select File</label>
            <input type="file" className="form-input" onChange={handleDocumentDraftFileUpload} />
            {documentDraft.fileName && <span className="modal-file-name">{documentDraft.fileName}</span>}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentProfile;
