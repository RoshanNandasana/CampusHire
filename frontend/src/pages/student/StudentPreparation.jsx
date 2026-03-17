import React, { useMemo, useState } from 'react';
import {
  MdCheckCircle,
  MdArrowForward,
  MdReplay,
  MdTaskAlt,
  MdOpenInNew,
  MdMenuBook,
  MdCode,
} from 'react-icons/md';
import Card from '../../components/common/Card';
import StudentTopPanel from '../../components/student/StudentTopPanel';
import './StudentPreparation.css';

const StudentPreparation = () => {
  const essentials = [
    { label: 'Weekly Practice', value: '9h', tone: 'blue' },
    { label: 'Mock Interviews', value: '4', tone: 'teal' },
    { label: 'Aptitude Readiness', value: '61%', tone: 'violet' },
    { label: 'Technical Readiness', value: '58%', tone: 'amber' },
  ];

  const studyMaterials = [
    {
      title: 'Aptitude Formula Sheet',
      type: 'PDF Guide',
      link: 'https://www.indiabix.com/aptitude/questions-and-answers/',
    },
    {
      title: 'DBMS Interview Notes',
      type: 'Quick Revision',
      link: 'https://www.geeksforgeeks.org/dbms/',
    },
    {
      title: 'OS + CN Last-Minute Prep',
      type: 'Core CS Notes',
      link: 'https://www.interviewbit.com/courses/programming/',
    },
    {
      title: 'HR Interview Answer Framework',
      type: 'Structured Template',
      link: 'https://www.indeed.com/career-advice/interviewing/star-interview-method',
    },
  ];

  const leetcodeQuestions = [
    {
      title: 'Two Sum',
      pattern: 'Array + Hashing',
      difficulty: 'Easy',
      link: 'https://leetcode.com/problems/two-sum/',
    },
    {
      title: 'Valid Parentheses',
      pattern: 'Stack',
      difficulty: 'Easy',
      link: 'https://leetcode.com/problems/valid-parentheses/',
    },
    {
      title: 'Merge Intervals',
      pattern: 'Sorting + Greedy',
      difficulty: 'Medium',
      link: 'https://leetcode.com/problems/merge-intervals/',
    },
    {
      title: 'Top K Frequent Elements',
      pattern: 'Heap + Hash Map',
      difficulty: 'Medium',
      link: 'https://leetcode.com/problems/top-k-frequent-elements/',
    },
    {
      title: 'Binary Tree Level Order Traversal',
      pattern: 'Tree + BFS',
      difficulty: 'Medium',
      link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      pattern: 'Sliding Window',
      difficulty: 'Medium',
      link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    },
  ];

  const assessmentPanels = [
    {
      id: 'aptitude',
      title: 'Aptitude Basics',
      subtitle: 'Quant + logical reasoning',
      meta: '12 Questions · 15 min',
      level: 'Beginner',
      questions: [
        {
          question: 'If the ratio of boys to girls is 3:2 and total students are 50, how many girls are there?',
          options: ['20', '25', '30', '35'],
          answer: 0,
        },
        {
          question: 'A number increased by 20% becomes 96. What is the original number?',
          options: ['70', '75', '80', '84'],
          answer: 2,
        },
        {
          question: 'If a train covers 240 km in 4 hours, the average speed is:',
          options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
          answer: 2,
        },
      ],
    },
    {
      id: 'technical',
      title: 'Core CS Practice',
      subtitle: 'DSA + DBMS + OOP',
      meta: '10 Questions · 18 min',
      level: 'Intermediate',
      questions: [
        {
          question: 'Which data structure uses LIFO order?',
          options: ['Queue', 'Stack', 'Heap', 'Graph'],
          answer: 1,
        },
        {
          question: 'Which SQL clause is used to filter grouped results?',
          options: ['WHERE', 'GROUP BY', 'ORDER BY', 'HAVING'],
          answer: 3,
        },
        {
          question: 'Which concept enables one interface, multiple implementations?',
          options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
          answer: 2,
        },
      ],
    },
    {
      id: 'hr',
      title: 'Interview Readiness',
      subtitle: 'HR and situational responses',
      meta: '8 Questions · 12 min',
      level: 'Easy',
      questions: [
        {
          question: 'Best structure for answering behavioral questions is:',
          options: ['PEST', 'SWOT', 'STAR', 'RACI'],
          answer: 2,
        },
        {
          question: 'When asked about weakness, you should:',
          options: ['Deny having weaknesses', 'Mention and show improvement', 'Blame team', 'Change topic'],
          answer: 1,
        },
        {
          question: 'What should be highlighted in self-introduction?',
          options: ['Personal gossip', 'Only hobbies', 'Relevant skills and projects', 'Salary expectation only'],
          answer: 2,
        },
      ],
    },
  ];

  const [activeAssessmentId, setActiveAssessmentId] = useState(assessmentPanels[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeAssessment = useMemo(
    () => assessmentPanels.find((item) => item.id === activeAssessmentId),
    [activeAssessmentId]
  );

  const currentQuestion = activeAssessment.questions[questionIndex];

  const switchAssessment = (id) => {
    setActiveAssessmentId(id);
    setQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsCompleted(false);
  };

  const handleNext = () => {
    if (selectedOption === null || isCompleted) return;

    const isCorrect = selectedOption === currentQuestion.answer;
    if (isCorrect) setScore((prev) => prev + 1);

    const isLastQuestion = questionIndex === activeAssessment.questions.length - 1;
    if (isLastQuestion) {
      setIsCompleted(true);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
  };

  const restartAssessment = () => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="student-preparation">
      <StudentTopPanel
        title="Placement Preparation"
        subtitle="Simple and focused preparation flow for campus placements."
        kicker="Student Preparation"
        stats={[
          { label: 'Weekly Practice', value: '9h' },
          { label: 'Mock Interviews', value: '4' },
          { label: 'Overall Status', value: '61%' },
          { label: 'Tests Cleared', value: '70%' },
        ]}
      />

      <div className="prep-layout">
        <div className="prep-main-column">
          <Card title="Placement Essentials" className="prep-surface essentials-card">
            <div className="essentials-grid">
              {essentials.map((item) => (
                <div key={item.label} className={`essential-tile ${item.tone}`}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Assessment Workspace" className="prep-surface workspace-card">
            <div className="workspace-head">
              <div>
                <h4>{activeAssessment.title}</h4>
                <p>{activeAssessment.subtitle}</p>
              </div>
              <div className="workspace-meta">
                <span>{activeAssessment.meta}</span>
                <span>{activeAssessment.level}</span>
              </div>
            </div>

            {!isCompleted ? (
              <div className="question-card">
                <div className="question-meta">
                  <span>Question {questionIndex + 1}</span>
                  <span>{activeAssessment.questions.length} total</span>
                </div>
                <h5>{currentQuestion.question}</h5>

                <div className="option-list">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={option}
                      className={`option-btn ${selectedOption === index ? 'selected' : ''}`}
                      onClick={() => setSelectedOption(index)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-primary attempt-btn"
                  onClick={handleNext}
                  type="button"
                  disabled={selectedOption === null}
                >
                  {questionIndex === activeAssessment.questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
                  <MdArrowForward aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="result-card">
                <div className="result-icon"><MdCheckCircle aria-hidden="true" /></div>
                <h5>Assessment Completed</h5>
                <p>
                  Score: <strong>{score}</strong> / {activeAssessment.questions.length}
                </p>
                <button type="button" className="btn btn-outlined" onClick={restartAssessment}>
                  <MdReplay aria-hidden="true" /> Retake Assessment
                </button>
              </div>
            )}
          </Card>

          <Card title="Study Materials" className="prep-surface materials-card">
            <div className="materials-list">
              {studyMaterials.map((item) => (
                <a
                  key={item.title}
                  className="material-item"
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="material-head">
                    <MdMenuBook aria-hidden="true" />
                    <h5>{item.title}</h5>
                  </div>
                  <span>{item.type}</span>
                  <MdOpenInNew className="material-open" aria-hidden="true" />
                </a>
              ))}
            </div>
          </Card>

          <Card title="Top DSA Practice (LeetCode)" className="prep-surface leetcode-card">
            <div className="leetcode-list">
              {leetcodeQuestions.map((item) => (
                <a
                  key={item.title}
                  className="leetcode-item"
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="leetcode-main">
                    <h5>
                      <MdCode aria-hidden="true" />
                      {item.title}
                    </h5>
                    <p>{item.pattern}</p>
                  </div>
                  <div className="leetcode-meta">
                    <span className={`difficulty ${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
                    <MdOpenInNew aria-hidden="true" />
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </div>

        <aside className="prep-side-column">
          <Card title="Assessment Panels" className="prep-surface panel-card">
            <div className="panel-list">
              {assessmentPanels.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`panel-item ${activeAssessmentId === item.id ? 'active' : ''}`}
                  onClick={() => switchAssessment(item.id)}
                >
                  <div>
                    <h5>{item.title}</h5>
                    <p>{item.subtitle}</p>
                  </div>
                  <span>{item.meta}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Placement Checklist" className="prep-surface checklist-card">
            <div className="checklist-list">
              <label><input type="checkbox" defaultChecked /> Resume updated for ATS</label>
              <label><input type="checkbox" defaultChecked /> Minimum 2 mock tests completed</label>
              <label><input type="checkbox" defaultChecked /> Core DSA patterns revised</label>
              <label><input type="checkbox" /> HR self-introduction practice</label>
              <label><input type="checkbox" /> Apply to at least 5 matching jobs</label>
            </div>
          </Card>

          <Card title="Next Step" className="prep-surface next-step-card">
            <div className="next-step-row">
              <MdTaskAlt aria-hidden="true" />
              <p>Complete one assessment daily to improve shortlist readiness.</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default StudentPreparation;
