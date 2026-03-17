import React from 'react';
import './StudentTopPanel.css';

const StudentTopPanel = ({
  title,
  subtitle,
  kicker = 'Student Panel',
  stats = [],
  action,
}) => {
  return (
    <section className="student-top-panel">
      <div className="student-top-main">
        <div className="student-top-head">
          <div>
            <span className="student-top-kicker">{kicker}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {action ? <div className="student-top-action">{action}</div> : null}
        </div>

        {stats.length > 0 && (
          <div className="student-top-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="student-top-stat-card">
                <span className="student-top-stat-label">{stat.label}</span>
                <strong className="student-top-stat-value">{stat.value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentTopPanel;
