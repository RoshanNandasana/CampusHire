import React from 'react';
import Card from '../../components/common/Card';
import './TPOAnalytics.css';

const TPOAnalytics = () => {
  const [analytics] = React.useState({
    placementRate: 64.3,
    readinessScore: 72.5,
    topSkills: [
      { name: 'Python', demand: 95 },
      { name: 'JavaScript', demand: 88 },
      { name: 'SQL', demand: 82 },
      { name: 'AWS', demand: 78 },
    ],
    insights: [
      '📈 Placement rate increased by 12% this year',
      '💼 Top recruiters: Google, Microsoft, Amazon',
      '🎓 CSE has highest placement rate at 74%',
      '⚠️ System Design skills need improvement',
    ],
  });

  return (
    <div className="tpo-analytics">
      <div className="header">
        <h1>Placement Analytics 📈</h1>
        <p>Data-driven insights about placement trends</p>
      </div>

      <div className="analytics-grid">
        <Card title="Placement Rate" className="analytics-card">
          <div className="metric">
            <div className="metric-value">{analytics.placementRate}%</div>
            <div className="metric-label">Overall Placement Rate</div>
          </div>
        </Card>

        <Card title="Readiness Score" className="analytics-card">
          <div className="metric">
            <div className="metric-value">{analytics.readinessScore}%</div>
            <div className="metric-label">Average Student Readiness</div>
          </div>
        </Card>
      </div>

      <Card title="🔥 Top In-Demand Skills">
        <div className="skills-list">
          {analytics.topSkills.map((skill, index) => (
            <div key={index} className="skill-item">
              <span className="skill-name">{skill.name}</span>
              <div className="skill-bar">
                <div className="skill-fill" style={{ width: `${skill.demand}%` }}></div>
              </div>
              <span className="skill-demand">{skill.demand}%</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="💡 Key Insights" className="insights-card">
        <div className="insights-list">
          {analytics.insights.map((insight, index) => (
            <div key={index} className="insight-item">
              <p>{insight}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TPOAnalytics;
