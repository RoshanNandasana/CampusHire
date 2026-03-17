import React, { useEffect, useRef, useState } from 'react';
import {
  MdBarChart,
  MdCloudUpload,
  MdCloudQueue,
  MdConstruction,
  MdLightbulbOutline,
  MdShowChart,
  MdVerified,
} from 'react-icons/md';
import Card from '../../components/common/Card';
import { studentAPI } from '../../services/api';
import StudentTopPanel from '../../components/student/StudentTopPanel';
import './StudentResumeInsights.css';

const StudentResumeInsights = () => {
  const [insights, setInsights] = useState({
    atsScore: 78,
    skills: [
      { name: 'JavaScript', level: 90, inBidding: true },
      { name: 'Python', level: 80, inBidding: true },
      { name: 'React', level: 85, inBidding: true },
      { name: 'SQL', level: 75, inBidding: false },
      { name: 'DSA', level: 70, inBidding: false },
    ],
    skillGaps: [
      { skill: 'AWS/Cloud Computing', demand: 95, yourLevel: 20 },
      { skill: 'Machine Learning', demand: 85, yourLevel: 30 },
      { skill: 'System Design', demand: 80, yourLevel: 40 },
      { skill: 'DevOps', demand: 75, yourLevel: 10 },
    ],
    suggestions: [
      'Good resume structure and formatting.',
      'Add more quantifiable metrics (e.g., 40% performance improvement).',
      'Include relevant certifications prominently.',
      'Add cloud computing skills (AWS, Azure).',
      'Include system design experience when relevant.',
      'Add a GitHub or portfolio link.',
      'Highlight leadership or team coordination examples.',
    ],
  });
  const actionItems = [
    {
      title: 'Learn AWS/Cloud Skills',
      description: 'Most roles require cloud fundamentals or exposure.',
      icon: MdCloudQueue,
    },
    {
      title: 'Build a Portfolio Project',
      description: 'Showcase system design or ML projects with outcomes.',
      icon: MdConstruction,
    },
    {
      title: 'Quantify Achievements',
      description: 'Add metrics like response time, revenue, or scale.',
      icon: MdShowChart,
    },
    {
      title: 'Get Certified',
      description: 'AWS, Google Cloud, or core ML certifications help.',
      icon: MdVerified,
    },
  ];
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadInsights = async () => {
      try {
        const response = await studentAPI.getResumeInsights();
        if (isMounted && response?.data?.status === 'success') {
          const data = response.data;
          setInsights((prev) => ({
            ...prev,
            atsScore: data.atsScore ?? prev.atsScore,
            skills: data.skills ?? prev.skills,
            skillGaps: data.skillGaps ?? prev.skillGaps,
            suggestions: data.suggestions ?? prev.suggestions,
          }));
        }
      } catch (err) {
        if (isMounted) setError('Unable to load resume insights.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInsights();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await studentAPI.uploadResume(formData);
      if (response?.data?.status === 'success') {
        const data = response.data;
        setInsights((prev) => ({
          ...prev,
          atsScore: data.atsScore ?? prev.atsScore,
          skills: data.skills ?? prev.skills,
          skillGaps: data.skillGaps ?? prev.skillGaps,
          suggestions: data.suggestions ?? prev.suggestions,
        }));
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getATSScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  return (
    <div className="resume-insights">
      <StudentTopPanel
        title="Resume & Skill Insights"
        subtitle="Improve shortlist readiness with ATS scoring, skill demand gaps, and TPO-reviewed guidance."
        kicker="Student Resume"
        stats={[
          { label: 'ATS Score', value: `${insights.atsScore}/100` },
          { label: 'Tracked Skills', value: insights.skills.length },
          { label: 'Skill Gaps', value: insights.skillGaps.length },
          { label: 'Suggestions', value: insights.suggestions.length },
        ]}
        tpoUpdates={[
          'TPO requires ATS score above 70 for premium drives',
          'Resume updates are reviewed weekly by placement team',
          'Skill-gap priorities are aligned with recruiter demand',
          'Upload latest PDF before each drive deadline',
        ]}
      />

      <div className="ats-section">
        <Card
          className="ats-card"
          icon={<MdBarChart aria-hidden="true" />}
          title="ATS Resume Score"
        >
          <div className="ats-content">
            <div className="ats-header-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                className="resume-upload-input"
              />
              <button
                type="button"
                className="resume-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <MdCloudUpload aria-hidden="true" />
                {uploading ? 'Analyzing...' : 'Upload Resume'}
              </button>
            </div>
            <div className="ats-score-container">
              <div className={`ats-score ${getATSScoreColor(insights.atsScore)}`}>
                <span className="score-value">{insights.atsScore}</span>
                <span className="score-label">/ 100</span>
              </div>
              <div className="ats-info">
                <p className="ats-title">ATS Score</p>
                <p className="ats-description">
                  Your resume scores {insights.atsScore}% on Applicant Tracking System optimization.
                  This is a <strong>{getATSScoreColor(insights.atsScore)} score</strong>.
                </p>
              </div>
            </div>
            <div className="ats-bar">
              <div className="ats-progress">
                <div
                  className={`ats-fill ${getATSScoreColor(insights.atsScore)}`}
                  style={{ width: `${insights.atsScore}%` }}
                ></div>
              </div>
              {error && <div className="ats-error">{error}</div>}
              {!error && !loading && (
                <div className="ats-updated">Updated from latest resume upload.</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="insights-grid">
        <Card title="Your Skills" className="card-highlight">
          <div className="skills-chart">
            {insights.skills.map((skill, index) => (
              <div key={index} className="skill-bar">
                <div className="skill-header">
                  <span className="skill-name">{skill.name}</span>
                  <div className="skill-badges">
                    {skill.inBidding && (
                      <span className="badge badge-info">In Demand</span>
                    )}
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <span className="skill-level">{skill.level}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Skill Gaps" className="card-highlight">
          <div className="skill-gaps">
            {insights.skillGaps.map((gap, index) => (
              <div key={index} className="gap-item">
                <div className="gap-header">
                  <span className="gap-skill">{gap.skill}</span>
                  <span className="gap-label">Market Demand: {gap.demand}%</span>
                </div>
                <div className="gap-bars">
                  <div className="gap-comparison">
                    <div className="bar-group">
                      <div className="bar-label">Market</div>
                      <div className="gap-bar demand">
                        <div style={{ width: `${gap.demand}%` }}></div>
                      </div>
                    </div>
                    <div className="bar-group">
                      <div className="bar-label">Your Level</div>
                      <div className="gap-bar yours">
                        <div style={{ width: `${gap.yourLevel}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Improvement Suggestions"
        icon={<MdLightbulbOutline aria-hidden="true" />}
        className="suggestions-card"
      >
        <div className="suggestions-list">
          {insights.suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              <p>{suggestion}</p>
            </div>
          ))}
        </div>

        <h4 className="action-title">Recommended Actions:</h4>
        <div className="action-items">
          {actionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="action-item">
                <span className="action-icon">
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <h5>{item.title}</h5>
                  <p>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default StudentResumeInsights;
