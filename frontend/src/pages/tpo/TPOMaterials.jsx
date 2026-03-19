import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import './TPOMaterials.css';

const TPO_MATERIALS_STORAGE_KEY = 'campusHireTpoMaterials';
const TPO_QUIZZES_STORAGE_KEY = 'campusHireTpoQuizzes';

const DEFAULT_MATERIALS = [
  {
    id: 1,
    title: 'Aptitude Formula Sheet',
    type: 'PDF',
    category: 'Aptitude',
    targetCompany: 'All',
    description: 'Core formulas for arithmetic, percentages, and speed math.',
    uploadedBy: 'TPO Office',
    uploadedOn: '2026-03-10',
    link: '#',
  },
  {
    id: 2,
    title: 'Interview HR Questions Bank',
    type: 'PDF',
    category: 'Interview',
    targetCompany: 'All',
    description: 'Frequently asked HR and behavior interview questions.',
    uploadedBy: 'TPO Office',
    uploadedOn: '2026-03-11',
    link: '#',
  },
  {
    id: 3,
    title: 'Resume Review Checklist',
    type: 'DOC',
    category: 'Resume',
    targetCompany: 'All',
    description: 'Checklist for one-page ATS friendly resume.',
    uploadedBy: 'Placement Mentor',
    uploadedOn: '2026-03-12',
    link: '#',
  },
  {
    id: 4,
    title: 'Top DSA Patterns (Company Wise)',
    type: 'PDF',
    category: 'DSA',
    targetCompany: 'Google/Amazon',
    description: 'Pattern-based DSA preparation for top product companies.',
    uploadedBy: 'Coding Cell',
    uploadedOn: '2026-03-14',
    link: '#',
  },
  {
    id: 5,
    title: 'Campus Hiring Core CS Handbook',
    type: 'PDF',
    category: 'Core Subjects',
    targetCompany: 'All',
    description: 'OS, DBMS, CN, OOP short notes for interview revision.',
    uploadedBy: 'TPO Office',
    uploadedOn: '2026-03-16',
    link: '#',
  },
];

const DEFAULT_QUIZZES = [
  {
    id: 1,
    title: 'Aptitude Speed Test',
    description: 'Quantitative aptitude warmup quiz',
    totalQuestions: 20,
    deadline: '2026-04-15',
    timeLimit: 30,
    category: 'Aptitude',
    createdBy: 'TPO Office',
    createdOn: '2026-03-18',
    status: 'active',
  },
];

const TPOMaterials = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('materials');
  const [fileUploadMessage, setFileUploadMessage] = useState('');
  const [materials, setMaterials] = useState(() => {
    const stored = localStorage.getItem(TPO_MATERIALS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (error) {
        return DEFAULT_MATERIALS;
      }
    }
    return DEFAULT_MATERIALS;
  });

  const [draft, setDraft] = useState({
    title: '',
    type: 'PDF',
    category: 'Aptitude',
    targetCompany: 'All',
    description: '',
    link: '#',
    file: null,
  });

  const [quizzes, setQuizzes] = useState(() => {
    const stored = localStorage.getItem(TPO_QUIZZES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (error) {
        return DEFAULT_QUIZZES;
      }
    }
    return DEFAULT_QUIZZES;
  });

  const [quizDraft, setQuizDraft] = useState({
    title: '',
    description: '',
    totalQuestions: 10,
    deadline: '',
    timeLimit: 30,
    category: 'Aptitude',
  });

  useEffect(() => {
    localStorage.setItem(TPO_MATERIALS_STORAGE_KEY, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(TPO_QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
  }, [quizzes]);

  const summary = useMemo(() => {
    return {
      total: materials.length,
      pdfCount: materials.filter((item) => item.type.toUpperCase() === 'PDF').length,
      categories: new Set(materials.map((item) => item.category)).size,
    };
  }, [materials]);

  const quizSummary = useMemo(() => {
    return {
      total: quizzes.length,
      active: quizzes.filter((q) => q.status === 'active').length,
      completed: quizzes.filter((q) => q.status === 'completed').length,
    };
  }, [quizzes]);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setFileUploadMessage('Only PDF files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileUploadMessage('File size must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result;
      setDraft({
        ...draft,
        file: {
          name: file.name,
          size: file.size,
          base64: base64String,
        },
      });
      setFileUploadMessage(`File "${file.name}" selected successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const addMaterial = () => {
    if (!draft.title.trim()) {
      setMessage('Material title is required.');
      return;
    }

    if (draft.type === 'PDF' && !draft.file) {
      setMessage('Please upload a PDF file.');
      return;
    }

    const newMaterial = {
      id: Date.now(),
      title: draft.title.trim(),
      type: draft.type,
      category: draft.category,
      targetCompany: draft.targetCompany.trim() || 'All',
      description: draft.description.trim() || 'No description added.',
      link: draft.file ? draft.file.base64 : draft.link.trim() || '#',
      fileName: draft.file?.name || null,
      fileSize: draft.file?.size || null,
      uploadedBy: user?.name || 'TPO Office',
      uploadedOn: new Date().toISOString().slice(0, 10),
    };

    setMaterials((prev) => [newMaterial, ...prev]);
    setDraft({
      title: '',
      type: 'PDF',
      category: 'Aptitude',
      targetCompany: 'All',
      description: '',
      link: '#',
      file: null,
    });
    setFileUploadMessage('');
    setMessage('Material added. Students can now see this in their preparation panel.');
  };

  const removeMaterial = (id) => {
    setMaterials((prev) => prev.filter((item) => item.id !== id));
    setMessage('Material removed successfully.');
  };

  const addQuiz = () => {
    if (!quizDraft.title.trim()) {
      setMessage('Quiz title is required.');
      return;
    }

    if (!quizDraft.deadline) {
      setMessage('Please set a deadline for the quiz.');
      return;
    }

    if (quizDraft.timeLimit <= 0) {
      setMessage('Time limit must be greater than 0 minutes.');
      return;
    }

    if (quizDraft.totalQuestions <= 0) {
      setMessage('Total questions must be greater than 0.');
      return;
    }

    const newQuiz = {
      id: Date.now(),
      title: quizDraft.title.trim(),
      description: quizDraft.description.trim() || 'No description',
      totalQuestions: quizDraft.totalQuestions,
      deadline: quizDraft.deadline,
      timeLimit: quizDraft.timeLimit,
      category: quizDraft.category,
      createdBy: user?.name || 'TPO Office',
      createdOn: new Date().toISOString().slice(0, 10),
      status: 'active',
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
    setQuizDraft({
      title: '',
      description: '',
      totalQuestions: 10,
      deadline: '',
      timeLimit: 30,
      category: 'Aptitude',
    });
    setMessage('Quiz created successfully. Students can now attempt this quiz.');
  };

  const removeQuiz = (id) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
    setMessage('Quiz removed successfully.');
  };

  return (
    <div className="tpo-materials-page">
      <div className="materials-header">
        <h1>TPO Materials & Quizzes Panel</h1>
        <p>Add preparation materials and create quizzes for students.</p>
      </div>

      {message && <p className="materials-message">{message}</p>}

      <div className="materials-tabs">
        <button
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          📚 Preparation Materials
        </button>
        <button
          className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          ✓ Quiz Creator
        </button>
      </div>

      {activeTab === 'materials' && (
        <>
          <div className="materials-summary-grid">
            <Card className="materials-stat blue">
              <span>Total Materials</span>
              <strong>{summary.total}</strong>
            </Card>
            <Card className="materials-stat green">
              <span>PDF Materials</span>
              <strong>{summary.pdfCount}</strong>
            </Card>
            <Card className="materials-stat violet">
              <span>Categories</span>
              <strong>{summary.categories}</strong>
            </Card>
          </div>

          <Card title="Add New Material" className="materials-add-card">
            <div className="materials-form-grid">
              <div className="form-group">
                <label>Material Title</label>
                <input
                  className="form-input"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="e.g. Company Wise SQL Interview Sheet"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  className="form-input"
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value, file: null })}
                >
                  <option value="PDF">PDF</option>
                  <option value="DOC">DOC</option>
                  <option value="PPT">PPT</option>
                  <option value="LINK">LINK</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-input"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  <option value="Aptitude">Aptitude</option>
                  <option value="DSA">DSA</option>
                  <option value="Interview">Interview</option>
                  <option value="Resume">Resume</option>
                  <option value="Core Subjects">Core Subjects</option>
                  <option value="Company Specific">Company Specific</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Company</label>
                <input
                  className="form-input"
                  value={draft.targetCompany}
                  onChange={(e) => setDraft({ ...draft, targetCompany: e.target.value })}
                  placeholder="All / Google / Service Companies"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  rows={3}
                  className="form-input"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="What is covered in this material?"
                />
              </div>

              {draft.type === 'PDF' ? (
                <div className="form-group full-width">
                  <label>Upload PDF File</label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="form-input"
                    onChange={handleFileUpload}
                  />
                  {fileUploadMessage && <p className="file-upload-message">{fileUploadMessage}</p>}
                  {draft.file && (
                    <p className="file-selected">
                      ✓ {draft.file.name} ({(draft.file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-group full-width">
                  <label>Material Link</label>
                  <input
                    className="form-input"
                    value={draft.link}
                    onChange={(e) => setDraft({ ...draft, link: e.target.value })}
                    placeholder="Paste file link or keep #"
                  />
                </div>
              )}
            </div>

            <button type="button" className="btn btn-primary" onClick={addMaterial}>
              Add Material
            </button>
          </Card>

          <Card title={`Uploaded Materials (${materials.length})`} className="materials-list-card">
            <div className="materials-list">
              {materials.map((item) => (
                <div key={item.id} className="material-row">
                  <div>
                    <h4>{item.title}</h4>
                    <p>
                      {item.category} | Target: {item.targetCompany} | Uploaded by {item.uploadedBy} on{' '}
                      {new Date(item.uploadedOn).toLocaleDateString()}
                    </p>
                    <small>{item.description}</small>
                  </div>
                  <div className="material-row-actions">
                    <span className="file-type">{item.type}</span>
                    {item.type === 'PDF' && item.fileName ? (
                      <a className="btn btn-outlined btn-small" href={item.link} download={item.fileName}>
                        Download
                      </a>
                    ) : (
                      <a className="btn btn-outlined btn-small" href={item.link} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    )}
                    <button type="button" className="btn btn-danger btn-small" onClick={() => removeMaterial(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {activeTab === 'quizzes' && (
        <>
          <div className="quiz-summary-grid">
            <Card className="quiz-stat blue">
              <span>Total Quizzes</span>
              <strong>{quizSummary.total}</strong>
            </Card>
            <Card className="quiz-stat green">
              <span>Active</span>
              <strong>{quizSummary.active}</strong>
            </Card>
            <Card className="quiz-stat orange">
              <span>Completed</span>
              <strong>{quizSummary.completed}</strong>
            </Card>
          </div>

          <Card title="Create New Quiz" className="quiz-add-card">
            <div className="quiz-form-grid">
              <div className="form-group full-width">
                <label>Quiz Title</label>
                <input
                  className="form-input"
                  value={quizDraft.title}
                  onChange={(e) => setQuizDraft({ ...quizDraft, title: e.target.value })}
                  placeholder="e.g. Aptitude Speed Test"
                />
              </div>

              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  rows={2}
                  className="form-input"
                  value={quizDraft.description}
                  onChange={(e) => setQuizDraft({ ...quizDraft, description: e.target.value })}
                  placeholder="Brief description of what this quiz covers"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-input"
                  value={quizDraft.category}
                  onChange={(e) => setQuizDraft({ ...quizDraft, category: e.target.value })}
                >
                  <option value="Aptitude">Aptitude</option>
                  <option value="DSA">DSA</option>
                  <option value="Interview">Interview</option>
                  <option value="GD/PI">GD/PI</option>
                  <option value="Core Subjects">Core Subjects</option>
                  <option value="Mock Test">Mock Test</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Questions</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-input"
                  value={quizDraft.totalQuestions}
                  onChange={(e) => setQuizDraft({ ...quizDraft, totalQuestions: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="form-group">
                <label>Time Limit (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="360"
                  className="form-input"
                  value={quizDraft.timeLimit}
                  onChange={(e) => setQuizDraft({ ...quizDraft, timeLimit: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={quizDraft.deadline}
                  onChange={(e) => setQuizDraft({ ...quizDraft, deadline: e.target.value })}
                />
              </div>
            </div>

            <button type="button" className="btn btn-primary" onClick={addQuiz}>
              Create Quiz
            </button>
          </Card>

          <Card title={`Active Quizzes (${quizzes.length})`} className="quiz-list-card">
            <div className="quiz-list">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-row">
                  <div className="quiz-info">
                    <h4>{quiz.title}</h4>
                    <p>{quiz.description}</p>
                    <div className="quiz-meta">
                      <span className="meta-item">📝 {quiz.totalQuestions} Questions</span>
                      <span className="meta-item">⏱ {quiz.timeLimit} min</span>
                      <span className="meta-item">📅 Deadline: {new Date(quiz.deadline).toLocaleDateString()}</span>
                      <span className="meta-item">🏷 {quiz.category}</span>
                    </div>
                    <p className="quiz-created">
                      Created by {quiz.createdBy} on {new Date(quiz.createdOn).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="quiz-row-actions">
                    <span className={`quiz-status ${quiz.status}`}>{quiz.status.toUpperCase()}</span>
                    <button type="button" className="btn btn-danger btn-small" onClick={() => removeQuiz(quiz.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default TPOMaterials;
