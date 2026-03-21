import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { studentAPI } from '../../services/api';
import fileDownloadService from '../../services/fileDownloadService';
import './StudentPreparation.css';

const StudentPreparation = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tpoMaterials, setTpoMaterials] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadMaterials = async () => {
      try {
        setIsLoading(true);
        const response = await studentAPI.getMaterials();
        const materials = response?.data?.materials;
        if (!isMounted) {
          return;
        }

        if (!Array.isArray(materials)) {
          setTpoMaterials([]);
          return;
        }

        const mapped = materials.map((item, index) => ({
          id: item.id,
          title: item.title,
          category: item.category || 'Other',
          type: 'PDF',
          visibility: item.is_global ? 'Global' : 'Department',
          uploadedBy: 'TPO Office',
          uploadedOn: item.created_at,
          downloadCount: Number(item.download_count || 0),
          link: item.file_url,
          order: index,
        }));
        setTpoMaterials(mapped);
      } catch (error) {
        if (isMounted) {
          setTpoMaterials([]);
          setMessage('Unable to load study materials right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMaterials();
    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const categories = new Set(tpoMaterials.map((item) => item.category)).size;
    const globalCount = tpoMaterials.filter((item) => item.visibility === 'Global').length;
    const totalDownloads = tpoMaterials.reduce((sum, item) => sum + item.downloadCount, 0);
    return {
      total: tpoMaterials.length,
      categories,
      globalCount,
      totalDownloads,
    };
  }, [tpoMaterials]);

  const handleOpenMaterial = async (materialId) => {
    try {
      const material = tpoMaterials.find(m => m.id === materialId);
      const filename = material?.title || 'material';
      await fileDownloadService.viewStudentMaterial(materialId, filename);
    } catch (error) {
      setMessage(error?.message || 'Unable to open material right now.');
    }
  };

  return (
    <div className="student-preparation simple-prep-page">
      <section className="prep-hero-simple">
        <span className="prep-kicker">Preparation Materials</span>
        <h1>TPO Uploaded Study Materials</h1>
        <p>Access all preparation resources uploaded by TPO. This section is fully dynamic and API-driven.</p>
      </section>

      {message && <p className="prep-message">{message}</p>}

      <div className="prep-summary-grid">
        <div className="summary-card blue">
          <span>Total Materials</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card green">
          <span>Categories</span>
          <strong>{summary.categories}</strong>
        </div>
        <div className="summary-card orange">
          <span>Global Materials</span>
          <strong>{summary.globalCount}</strong>
        </div>
        <div className="summary-card violet">
          <span>Total Downloads</span>
          <strong>{summary.totalDownloads}</strong>
        </div>
      </div>

      <Card title={`TPO Study Materials (${tpoMaterials.length})`} className="prep-section-card material-section">
        <div className="material-list">
          {isLoading ? <p className="list-note">Loading materials...</p> : null}
          {!isLoading && tpoMaterials.length === 0 ? (
            <p className="list-note">No materials available yet for your department.</p>
          ) : null}
          {tpoMaterials.map((material) => (
            <div key={material.id} className="material-item">
              <div>
                <h5>{material.title}</h5>
                <p>
                  Uploaded by {material.uploadedBy} on {new Date(material.uploadedOn).toLocaleDateString()}
                </p>
                <small>
                  Category: {material.category} | Scope: {material.visibility} | Downloads: {material.downloadCount}
                </small>
              </div>
              <div className="material-actions">
                <span className="file-type">{material.type}</span>
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={() => handleOpenMaterial(material.id)}
                >
                  View Material
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StudentPreparation;
