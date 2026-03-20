import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { tpoAPI } from '../../services/api';
import './TPOMaterials.css';

const categoryMap = {
  Aptitude: 'APTITUDE',
  DSA: 'DSA',
  'System Design': 'SYSTEM_DESIGN',
  'Core Subjects': 'CORE',
  Other: 'OTHER',
};

const TPOMaterials = () => {
  const [message, setMessage] = useState('');
  const [fileUploadMessage, setFileUploadMessage] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [draft, setDraft] = useState({
    title: '',
    type: 'PDF',
    category: 'Aptitude',
    description: '',
    isGlobal: false,
    file: null,
  });

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const response = await tpoAPI.listMaterials();
      setMaterials(Array.isArray(response?.data?.materials) ? response.data.materials : []);
    } catch (error) {
      setMaterials([]);
      setMessage('Unable to load materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const summary = useMemo(() => {
    return {
      total: materials.length,
      pdfCount: materials.length,
      categories: new Set(materials.map((item) => item.category)).size,
    };
  }, [materials]);

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

    setDraft((prev) => ({
      ...prev,
      file,
    }));
    setFileUploadMessage(`File "${file.name}" selected successfully.`);
  };

  const addMaterial = async () => {
    if (!draft.title.trim()) {
      setMessage('Material title is required.');
      return;
    }

    if (draft.type === 'PDF' && !draft.file) {
      setMessage('Please upload a PDF file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', draft.title.trim());
      formData.append('category', categoryMap[draft.category] || 'OTHER');
      formData.append('is_global', String(Boolean(draft.isGlobal)));
      formData.append('file', draft.file);

      await tpoAPI.uploadMaterial(formData);
      setDraft({
        title: '',
        type: 'PDF',
        category: 'Aptitude',
        description: '',
        isGlobal: false,
        file: null,
      });
      setFileUploadMessage('');
      setMessage('Material uploaded successfully. Students can now see it.');
      await loadMaterials();
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Unable to upload material right now.');
    }
  };

  const removeMaterial = async (id) => {
    try {
      await tpoAPI.deleteMaterial(id);
      setMaterials((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setMessage('Material removed successfully.');
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Unable to remove material.');
    }
  };

  return (
    <div className="tpo-materials-page">
      <div className="materials-header">
        <h1>TPO Materials & Quizzes Panel</h1>
        <p>Add preparation materials for students. All entries are database-backed.</p>
      </div>

      {message && <p className="materials-message">{message}</p>}

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
                  <option value="System Design">System Design</option>
                  <option value="Core Subjects">Core Subjects</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Visibility</label>
                <select
                  className="form-input"
                  value={draft.isGlobal ? 'global' : 'department'}
                  onChange={(e) => setDraft((prev) => ({ ...prev, isGlobal: e.target.value === 'global' }))}
                >
                  <option value="department">Department Only</option>
                  <option value="global">Global</option>
                </select>
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
                <></>
              )}
            </div>

            <button type="button" className="btn btn-primary" onClick={addMaterial}>
              Add Material
            </button>
          </Card>

          <Card title={`Uploaded Materials (${materials.length})`} className="materials-list-card">
            <div className="materials-list">
              {loading ? <p>Loading materials...</p> : null}
              {materials.map((item) => (
                <div key={item.id} className="material-row">
                  <div>
                    <h4>{item.title}</h4>
                    <p>
                      {item.category} | Scope: {item.is_global ? 'Global' : 'Department'} | Uploaded on{' '}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <small>Downloads: {item.download_count || 0}</small>
                  </div>
                  <div className="material-row-actions">
                    <span className="file-type">PDF</span>
                    <a className="btn btn-outlined btn-small" href={item.file_url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                    <button type="button" className="btn btn-danger btn-small" onClick={() => removeMaterial(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
      </>
    </div>
  );
};

export default TPOMaterials;
