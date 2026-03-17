import React, { useState } from 'react';
import { MdCheckCircle, MdPlayArrow, MdRocketLaunch } from 'react-icons/md';
import Card from '../../components/common/Card';
import './StudentPreparation.css';

const StudentPreparation = () => {
  const [preparations] = useState({
    aptitude: {
      id: 'aptitude',
      title: 'Aptitude Preparation',
      completed: 65,
      modules: [
        { name: 'Number Systems', completed: true },
        { name: 'Percentages & Profit Loss', completed: true },
        { name: 'Time & Work', completed: true },
        { name: 'Speed & Distance', completed: false },
        { name: 'Permutation & Combination', completed: false },
      ],
      testsCompleted: 12,
      testsTotal: 15,
      averageScore: 76,
    },
    technical: {
      id: 'technical',
      title: 'Technical Preparation',
      completed: 58,
      modules: [
        { name: 'Data Structures', completed: true },
        { name: 'Algorithms', completed: true },
        { name: 'OOPS Concepts', completed: true },
        { name: 'Database Design', completed: false },
        { name: 'System Design', completed: false },
      ],
      testsCompleted: 18,
      testsTotal: 25,
      averageScore: 68,
    },
    mockInterviews: {
      id: 'mock',
      title: 'Mock Interviews',
      completed: 40,
      modules: [
        { name: 'Technical Round 1', completed: true },
        { name: 'Technical Round 2', completed: false },
        { name: 'HR Interview', completed: false },
        { name: 'Managerial Round', completed: false },
      ],
      testsCompleted: 2,
      testsTotal: 5,
      averageScore: 72,
    },
  });

  const popularTracks = [
    { name: 'Aptitude Sprint', mentor: 'Quant Team', color: 'indigo' },
    { name: 'DSA Sprint', mentor: 'Code Team', color: 'teal' },
    { name: 'Interview Mastery', mentor: 'HR Mentors', color: 'sun' },
  ];

  const upcomingPaths = [
    { name: 'Service Company Fast-Track', starts: 'Starts 12 Apr', fee: '$90', color: 'indigo' },
    { name: 'Product Company Bootcamp', starts: 'Starts 17 Apr', fee: '$140', color: 'teal' },
    { name: 'Core CS Revision', starts: 'Starts 20 Apr', fee: '$110', color: 'sun' },
  ];

  const nextVideos = [
    { title: 'Resume Tailoring for ATS', subtitle: 'Build recruiter-ready bullets', duration: '8:42' },
    { title: 'OOPs Revision Drill', subtitle: 'Most asked interview scenarios', duration: '14:05' },
    { title: 'SQL Patterns for Interviews', subtitle: 'Window functions and joins', duration: '11:18' },
    { title: 'HR Round Confidence', subtitle: 'Storytelling with STAR format', duration: '9:26' },
  ];

  const mockQuestions = [
    {
      id: 'Q1',
      question: 'Which metric should improve first for better shortlist chances?',
      options: ['Number of applications', 'Readiness score', 'Email length', 'Social posts'],
      correct: 1,
    },
    {
      id: 'Q2',
      question: 'Best action when technical accuracy is low?',
      options: ['Skip mocks', 'Only watch videos', 'Practice timed problem sets', 'Change branch'],
      correct: 2,
    },
    {
      id: 'Q3',
      question: 'For placement success, preparation should be:',
      options: ['One-time sprint', 'Consistent and measurable', 'Random and flexible', 'Only aptitude'],
      correct: 1,
    },
  ];

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'excellent';
    if (progress >= 60) return 'good';
    if (progress >= 40) return 'average';
    return 'poor';
  };

  const PreparationCard = ({ data }) => (
    <Card title={data.title} className={`prep-card prep-card--${data.id}`}>
      <div className="prep-header">
        <div className="progress-circle">
          <div className={`circle-fill ${getProgressColor(data.completed)}`}>
            <span className="percentage">{data.completed}%</span>
          </div>
        </div>
        <div className="prep-stats">
          <div className="stat">
            <span className="stat-label">Tests Completed</span>
            <span className="stat-value">
              {data.testsCompleted} / {data.testsTotal}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Average Score</span>
            <span className="stat-value">{data.averageScore}%</span>
          </div>
        </div>
      </div>

      <div className="modules-list">
        {data.modules.map((module, index) => (
          <div key={index} className={`module-item ${module.completed ? 'completed' : ''}`}>
            <div className="module-checkbox">{module.completed ? '✓' : ' '}</div>
            <span className="module-name">{module.name}</span>
            {module.completed && <span className="badge badge-success">Done</span>}
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-small mt-2">Continue Learning</button>
    </Card>
  );

  return (
    <div className="student-preparation">
      <div className="prep-header-section">
        <span className="prep-kicker">Placement Studio</span>
        <h1>Preparation Command Center</h1>
        <p>Plan smarter, practice daily, and track every signal that impacts your placement outcomes.</p>
      </div>

      <div className="prep-layout">
        <div className="prep-main-column">
          <Card title="Placement Snapshot" className="overall-progress-card prep-surface">
            <div className="quick-metrics">
              <div className="metric-tile">
                <span className="metric-label">Target Companies</span>
                <strong>18</strong>
              </div>
              <div className="metric-tile">
                <span className="metric-label">Weekly Practice</span>
                <strong>9h</strong>
              </div>
              <div className="metric-tile">
                <span className="metric-label">Mock Interviews</span>
                <strong>4</strong>
              </div>
              <div className="metric-tile">
                <span className="metric-label">Confidence Trend</span>
                <strong>+12%</strong>
              </div>
            </div>

            <div className="progress-overview">
              <div className="progress-item">
                <div className={`circle-small ${getProgressColor(61)}`}>
                  <span>61%</span>
                </div>
                <p>Overall Status</p>
              </div>
              <div className="progress-item">
                <div className={`circle-small ${getProgressColor(54)}`}>
                  <span>54%</span>
                </div>
                <p>Topics Covered</p>
              </div>
              <div className="progress-item">
                <div className={`circle-small ${getProgressColor(70)}`}>
                  <span>70%</span>
                </div>
                <p>Tests Cleared</p>
              </div>
            </div>
          </Card>

          <Card title="Popular Placement Tracks" className="popular-card prep-surface">
            <div className="course-strip">
              {popularTracks.map((track) => (
                <div key={track.name} className={`track-tile track-${track.color}`}>
                  <p className="track-label">{track.mentor}</p>
                  <h4>{track.name}</h4>
                  <button className="btn btn-small btn-outlined">Explore</button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Upcoming Placement Batches" className="upcoming-card prep-surface">
            <div className="upcoming-grid">
              {upcomingPaths.map((item) => (
                <div key={item.name} className={`upcoming-tile tile-${item.color}`}>
                  <h4>{item.name}</h4>
                  <p>{item.starts}</p>
                  <span>{item.fee}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="prep-grid">
            <PreparationCard data={preparations.aptitude} />
            <PreparationCard data={preparations.technical} />
            <PreparationCard data={preparations.mockInterviews} />
          </div>

          <div className="content-pair">
            <Card title="Learning Resources" className="resources-card prep-surface">
              <div className="resources-list">
                <div className="resource-item">
                  <div className="resource-icon">📚</div>
                  <div className="resource-info">
                    <h4>DSA Mastery Course</h4>
                    <p>Complete data structures and algorithms course</p>
                    <button className="btn btn-outlined btn-small">Start</button>
                  </div>
                </div>

                <div className="resource-item">
                  <div className="resource-icon">🎥</div>
                  <div className="resource-info">
                    <h4>System Design Basics</h4>
                    <p>Learn system design from industry experts</p>
                    <button className="btn btn-outlined btn-small">Start</button>
                  </div>
                </div>

                <div className="resource-item">
                  <div className="resource-icon">💬</div>
                  <div className="resource-info">
                    <h4>Interview Preparation Webinar</h4>
                    <p>Live Q&A with company hiring managers</p>
                    <button className="btn btn-outlined btn-small">Register</button>
                  </div>
                </div>

                <div className="resource-item">
                  <div className="resource-icon">📊</div>
                  <div className="resource-info">
                    <h4>Aptitude Practice Tests</h4>
                    <p>1000+ quantitative aptitude test questions</p>
                    <button className="btn btn-outlined btn-small">Practice</button>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Next Videos" className="videos-card prep-surface">
              <div className="video-list">
                {nextVideos.map((video) => (
                  <div className="video-item" key={video.title}>
                    <span className="play-chip">
                      <MdPlayArrow aria-hidden="true" />
                    </span>
                    <div>
                      <h5>{video.title}</h5>
                      <p>{video.subtitle}</p>
                    </div>
                    <span className="video-time">{video.duration}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Recommended Actions" className="actions-card prep-surface">
            <div className="action-list">
              <div className="action-recommendation">
                <span className="rec-icon">⚡</span>
                <div className="rec-content">
                  <h5>Focus on System Design</h5>
                  <p>Only 40% complete. This is critical for senior roles.</p>
                </div>
                <button className="btn btn-small">Learn Now</button>
              </div>

              <div className="action-recommendation">
                <span className="rec-icon">🎤</span>
                <div className="rec-content">
                  <h5>Schedule Mock Interview</h5>
                  <p>Practice with mentors before real interviews.</p>
                </div>
                <button className="btn btn-small">Schedule</button>
              </div>

              <div className="action-recommendation">
                <span className="rec-icon">📈</span>
                <div className="rec-content">
                  <h5>Improve Test Scores</h5>
                  <p>Your average is 72%. Target 85% for top companies.</p>
                </div>
                <button className="btn btn-small">Improve</button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="prep-side-column">
          <Card title="Online Assessment" className="exam-card prep-surface">
            <div className="exam-stats">
              <div className="exam-tile">
                <span>Score</span>
                <strong>82</strong>
              </div>
              <div className="exam-tile">
                <span>Correct</span>
                <strong>18</strong>
              </div>
              <div className="exam-tile">
                <span>Time Left</span>
                <strong>09m</strong>
              </div>
            </div>

            <div className="exam-question-list">
              {mockQuestions.map((item) => (
                <div key={item.id} className="exam-block">
                  <p className="exam-title">
                    <span>{item.id}</span>
                    {item.question}
                  </p>
                  <ul>
                    {item.options.map((option, index) => (
                      <li key={option} className={index === item.correct ? 'is-correct' : ''}>
                        {index === item.correct ? <MdCheckCircle aria-hidden="true" /> : <span className="dot" />} {option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button className="btn btn-primary exam-btn">
              <MdRocketLaunch aria-hidden="true" /> Start Full Mock
            </button>
          </Card>

          <Card title="Placement Checklist" className="checklist-card prep-surface">
            <div className="checklist-list">
              <label><input type="checkbox" defaultChecked /> Update one-page ATS resume</label>
              <label><input type="checkbox" defaultChecked /> Complete 2 timed aptitude sets</label>
              <label><input type="checkbox" defaultChecked /> Revise 3 DSA patterns</label>
              <label><input type="checkbox" /> Record mock HR intro</label>
              <label><input type="checkbox" /> Apply to 5 matching roles</label>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default StudentPreparation;
