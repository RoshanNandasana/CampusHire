import React, { useEffect, useRef, useState } from 'react';
import {
  MdBarChart,
  MdChat,
  MdCloudUpload,
  MdCloudQueue,
  MdConstruction,
  MdLightbulbOutline,
  MdSend,
  MdSmartToy,
  MdShowChart,
  MdVerified,
} from 'react-icons/md';
import Card from '../../components/common/Card';
import { studentAPI } from '../../services/api';
import StudentTopPanel from '../../components/student/StudentTopPanel';
import './StudentResumeInsights.css';

const StudentResumeInsights = () => {
  const [insights, setInsights] = useState({
    atsScore: 0,
    skills: [],
    skillGaps: [],
    suggestions: [],
    improvements: [],
    analysisSource: 'fallback',
  });
  const [resumeMeta, setResumeMeta] = useState({
    hasResume: false,
    resumeFileName: '',
    lastAnalyzedAt: null,
  });
  const iconPool = [MdCloudQueue, MdConstruction, MdShowChart, MdVerified];
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [chatMode, setChatMode] = useState('ats_coach');
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Ask me to analyze your resume against current job listings, improve ATS score, or suggest your best-fit roles.',
      data: null,
    },
  ]);
  const fileInputRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadInsights = async () => {
      try {
        const [insightsResponse, jobsResponse] = await Promise.all([
          studentAPI.getResumeInsights(),
          studentAPI.getJobListings(),
        ]);

        if (isMounted && insightsResponse?.data) {
          const data = insightsResponse.data;
          const normalizedSkills = (data.skills || []).map((item) => {
            if (typeof item === 'string') {
              return { name: item, level: 65, inBidding: false };
            }
            const rawLevel = Number(item?.level || 60);
            const level = rawLevel > 0 && rawLevel <= 10 ? rawLevel * 10 : rawLevel;
            return {
              name: item?.name || 'Skill',
              level,
              inBidding: Boolean(item?.inBidding),
            };
          });

          const normalizedGaps = (data.skillGaps || []).map((item) => {
            const rawDemand = Number(item?.demand || item?.marketDemand || 80);
            const rawYourLevel = Number(item?.yourLevel || item?.currentLevel || 35);
            return {
              skill: item?.skill || item?.name || 'Skill Gap',
              demand: rawDemand > 0 && rawDemand <= 10 ? rawDemand * 20 : rawDemand,
              yourLevel: rawYourLevel > 0 && rawYourLevel <= 10 ? rawYourLevel * 20 : rawYourLevel,
            };
          });

          setInsights((prev) => ({
            ...prev,
            atsScore: data.atsScore ?? prev.atsScore,
            skills: normalizedSkills,
            skillGaps: normalizedGaps,
            suggestions: data.suggestions ?? prev.suggestions,
            improvements: data.improvements ?? prev.improvements,
            analysisSource: data.analysisSource ?? prev.analysisSource,
          }));
          setResumeMeta({
            hasResume: Boolean(data.hasResume),
            resumeFileName: data.resumeFileName || '',
            lastAnalyzedAt: data.lastAnalyzedAt || null,
          });
        }

        if (isMounted && jobsResponse?.data?.jobs) {
          setJobs(Array.isArray(jobsResponse.data.jobs) ? jobsResponse.data.jobs : []);
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

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages, chatLoading]);

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await studentAPI.uploadResume(formData);
      if (response?.data) {
        const data = response.data;
        const normalizedSkills = (data.skills || []).map((item) => ({
          name: item?.name || item || 'Skill',
          level: (() => {
            const rawLevel = Number(item?.level || 60);
            return rawLevel > 0 && rawLevel <= 10 ? rawLevel * 10 : rawLevel;
          })(),
          inBidding: Boolean(item?.inBidding),
        }));
        const normalizedGaps = (data.skillGaps || []).map((item) => {
          const rawDemand = Number(item?.demand || item?.marketDemand || 80);
          const rawYourLevel = Number(item?.yourLevel || item?.currentLevel || 35);
          return {
            skill: item?.skill || item?.name || 'Skill Gap',
            demand: rawDemand > 0 && rawDemand <= 10 ? rawDemand * 20 : rawDemand,
            yourLevel: rawYourLevel > 0 && rawYourLevel <= 10 ? rawYourLevel * 20 : rawYourLevel,
          };
        });

        setInsights((prev) => ({
          ...prev,
          atsScore: data.atsScore ?? prev.atsScore,
          skills: normalizedSkills,
          skillGaps: normalizedGaps,
          suggestions: data.suggestions ?? prev.suggestions,
          improvements: data.improvements ?? prev.improvements,
          analysisSource: data.analysisSource ?? prev.analysisSource,
        }));
        setResumeMeta({
          hasResume: true,
          resumeFileName: data.resumeFileName || file.name,
          lastAnalyzedAt: data.lastAnalyzedAt || new Date().toISOString(),
        });
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

  const toggleJobSelection = (jobId) => {
    setSelectedJobIds((prev) => {
      const id = String(jobId);
      return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleQuickPrompt = (prompt) => {
    setChatInput(prompt);
  };

  const handleSendMessage = async () => {
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    setChatError('');
    setChatLoading(true);
    const nextMessages = [...chatMessages, { role: 'user', text: message, data: null }];
    setChatMessages(nextMessages);
    setChatInput('');

    try {
      const response = await studentAPI.resumeChat({
        mode: chatMode,
        message,
        selected_job_ids: selectedJobIds,
        history: nextMessages
          .slice(-8)
          .filter((item) => item.role === 'user' || item.role === 'assistant')
          .map((item) => ({ role: item.role, content: item.text })),
      });

      const aiData = response?.data;
      const aiText = aiData?.answer || 'I could not generate an answer right now.';

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiText,
          data: aiData || null,
        },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Unable to get AI response. Please try again.';
      setChatError(msg);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I am unable to respond right now. Please try again in a moment.',
          data: null,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
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
                <div className="ats-updated">
                  {resumeMeta.hasResume
                    ? `Latest analysis: ${resumeMeta.resumeFileName || 'resume uploaded'}${resumeMeta.lastAnalyzedAt ? ` (${new Date(resumeMeta.lastAnalyzedAt).toLocaleString()})` : ''}`
                    : 'Upload your latest resume to generate ATS analysis.'}
                  {resumeMeta.hasResume ? ` • Source: ${insights.analysisSource === 'ai' ? 'AI analyzer' : 'Fallback analyzer'}` : ''}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="AI Career Copilot"
        icon={<MdChat aria-hidden="true" />}
        className="chatbot-card"
      >
        <div className="chatbot-top-row">
          <div className="chat-mode-toggle" role="group" aria-label="AI mode">
            <button
              type="button"
              className={`mode-btn ${chatMode === 'ats_coach' ? 'active' : ''}`}
              onClick={() => setChatMode('ats_coach')}
            >
              ATS Coach
            </button>
            <button
              type="button"
              className={`mode-btn ${chatMode === 'placement_assistant' ? 'active' : ''}`}
              onClick={() => setChatMode('placement_assistant')}
            >
              Placement Assistant
            </button>
          </div>

          <div className="quick-prompts">
            <button type="button" onClick={() => handleQuickPrompt('Based on my resume, rank the top 3 jobs from my listings.')}>Top 3 Jobs</button>
            <button type="button" onClick={() => handleQuickPrompt('How can I improve ATS score for software engineer roles?')}>Improve ATS</button>
            <button type="button" onClick={() => handleQuickPrompt('What should I change in my resume to clear shortlisted round?')}>Shortlist Fixes</button>
          </div>
        </div>

        <div className="job-filter-chip-list">
          {jobs.slice(0, 10).map((job) => {
            const id = String(job.id);
            return (
              <button
                key={id}
                type="button"
                className={`job-chip ${selectedJobIds.includes(id) ? 'selected' : ''}`}
                onClick={() => toggleJobSelection(id)}
              >
                {job.position} at {job.company}
              </button>
            );
          })}
          {!jobs.length && !loading && (
            <div className="ats-updated">No active jobs available for AI ranking right now.</div>
          )}
        </div>

        <div className="chat-window" ref={chatScrollRef}>
          {chatMessages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`chat-message ${item.role}`}>
              <div className="chat-bubble">
                {item.role === 'assistant' && (
                  <div className="chat-bubble-head">
                    <MdSmartToy aria-hidden="true" />
                    <span>CampusHire AI</span>
                  </div>
                )}
                <p>{item.text}</p>

                {item.role === 'assistant' && item.data?.recommendedJobs?.length > 0 && (
                  <div className="chat-jobs-grid">
                    {item.data.recommendedJobs.slice(0, 3).map((job) => (
                      <div key={job.jobId} className="chat-job-card">
                        <strong>{job.position}</strong>
                        <span>{job.company}</span>
                        <span className="score">Match: {job.matchScore}%</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.role === 'assistant' && item.data?.ats && (
                  <div className="chat-ats-block">
                    <span>ATS: {item.data.ats.currentScore} → {item.data.ats.estimatedScoreAfterImprovements}</span>
                    <p>{item.data.ats.summary}</p>
                  </div>
                )}

                {item.role === 'assistant' && item.data?.followUpQuestions?.length > 0 && (
                  <div className="follow-up-list">
                    {item.data.followUpQuestions.slice(0, 3).map((question, idx) => (
                      <button key={`${idx}-${question}`} type="button" onClick={() => handleQuickPrompt(question)}>{question}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="chat-message assistant">
              <div className="chat-bubble typing">Analyzing your resume and jobs...</div>
            </div>
          )}
        </div>

        <div className="chat-input-row">
          <textarea
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="Ask about job fit, ATS improvements, and placement strategy..."
            rows={2}
            disabled={chatLoading}
          />
          <button type="button" onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()}>
            <MdSend aria-hidden="true" />
            Send
          </button>
        </div>
        {chatError && <div className="chat-error">{chatError}</div>}
      </Card>

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
            {!insights.skills.length && !loading && (
              <div className="ats-updated">No skills detected yet. Upload a resume to analyze your profile.</div>
            )}
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
            {!insights.skillGaps.length && !loading && (
              <div className="ats-updated">Skill gap analysis will appear after resume analysis.</div>
            )}
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
          {!insights.suggestions.length && !loading && (
            <div className="ats-updated">Suggestions will be generated from your latest resume and job context.</div>
          )}
        </div>

        <h4 className="action-title">AI Improvement Actions:</h4>
        <div className="action-items">
          {(insights.improvements || []).slice(0, 4).map((text, index) => {
            const Icon = iconPool[index % iconPool.length];
            return (
              <div key={index} className="action-item">
                <span className="action-icon">
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <h5>Action {index + 1}</h5>
                  <p>{text}</p>
                </div>
              </div>
            );
          })}
          {!insights.improvements.length && !loading && (
            <div className="ats-updated">AI improvement actions will appear after analysis.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StudentResumeInsights;
