import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import './StudentPreparation.css';

const TPO_MATERIALS_STORAGE_KEY = 'campusHireTpoMaterials';
const TPO_QUIZZES_STORAGE_KEY = 'campusHireTpoQuizzes';

const quizQuestionBank = {
  1: [
    {
      id: 'q1',
      question: 'If CP = 800 and SP = 920, profit percentage is?',
      options: ['12%', '15%', '18%', '20%'],
      correctIndex: 1,
    },
    {
      id: 'q2',
      question: 'A can complete work in 20 days. B in 30 days. Together they complete in?',
      options: ['10 days', '12 days', '15 days', '18 days'],
      correctIndex: 1,
    },
    {
      id: 'q3',
      question: 'Simple interest on 2000 at 10% for 2 years is?',
      options: ['200', '300', '400', '500'],
      correctIndex: 2,
    },
    {
      id: 'q4',
      question: 'Average of 10, 20, 30, 40, 50 is?',
      options: ['25', '28', '30', '32'],
      correctIndex: 2,
    },
    {
      id: 'q5',
      question: 'Train covers 120 km in 2 hours. Speed is?',
      options: ['50 km/h', '55 km/h', '60 km/h', '65 km/h'],
      correctIndex: 2,
    },
  ],
  2: [
    {
      id: 'q1',
      question: 'Time complexity of binary search is?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctIndex: 1,
    },
    {
      id: 'q2',
      question: 'Which structure uses FIFO?',
      options: ['Stack', 'Queue', 'Tree', 'Heap'],
      correctIndex: 1,
    },
    {
      id: 'q3',
      question: 'Best traversal for BST in sorted order?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
      correctIndex: 1,
    },
    {
      id: 'q4',
      question: 'Hash map average lookup time is?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      correctIndex: 0,
    },
    {
      id: 'q5',
      question: 'Which algorithm is used for shortest path in weighted graph?',
      options: ['DFS', 'BFS', 'Dijkstra', 'KMP'],
      correctIndex: 2,
    },
  ],
  3: [
    {
      id: 'q1',
      question: 'Find odd one: 3, 5, 11, 14, 17',
      options: ['3', '5', '11', '14'],
      correctIndex: 3,
    },
    {
      id: 'q2',
      question: 'If CAT=3120, then DOG=?',
      options: ['4157', '4715', '4716', '4617'],
      correctIndex: 0,
    },
    {
      id: 'q3',
      question: 'Series: 2, 6, 12, 20, 30, ?',
      options: ['36', '40', '42', '44'],
      correctIndex: 2,
    },
    {
      id: 'q4',
      question: 'Clock angle at 3:30 is?',
      options: ['45 deg', '60 deg', '75 deg', '90 deg'],
      correctIndex: 2,
    },
    {
      id: 'q5',
      question: 'A is sister of B, B is son of C. How is A related to C?',
      options: ['Daughter', 'Mother', 'Grandmother', 'Sister'],
      correctIndex: 0,
    },
  ],
};

const StudentPreparation = () => {
  const [scheduledQuizzes, setScheduledQuizzes] = useState(() => {
    const stored = localStorage.getItem(TPO_QUIZZES_STORAGE_KEY);
    if (stored) {
      try {
        const parsedQuizzes = JSON.parse(stored);
        if (Array.isArray(parsedQuizzes) && parsedQuizzes.length > 0) {
          return parsedQuizzes.map((quiz, index) => ({
            id: quiz.id,
            title: quiz.title,
            companyFocus: quiz.category || 'General',
            date: quiz.deadline,
            duration: `${quiz.timeLimit} mins`,
            totalMarks: quiz.totalQuestions * 1,
            score: null,
            status: new Date(quiz.deadline) < new Date() ? 'completed' : 'scheduled',
            timerSeconds: (quiz.timeLimit || 30) * 60,
          }));
        }
      } catch (error) {
        console.error('Error loading quizzes:', error);
      }
    }

    return [
      {
        id: 1,
        title: 'Aptitude Weekly Quiz',
        companyFocus: 'TCS / Infosys / Wipro',
        date: '2026-03-22',
        duration: '45 mins',
        totalMarks: 50,
        score: null,
        status: 'scheduled',
        timerSeconds: 2700,
      },
      {
        id: 2,
        title: 'DSA Mock Quiz',
        companyFocus: 'Amazon / Google',
        date: '2026-03-15',
        duration: '60 mins',
        totalMarks: 60,
        score: 44,
        status: 'completed',
        timerSeconds: 3600,
      },
      {
        id: 3,
        title: 'Logical Reasoning Drill',
        companyFocus: 'Service Companies',
        date: '2026-03-27',
        duration: '30 mins',
        totalMarks: 30,
        score: null,
        status: 'scheduled',
        timerSeconds: 1800,
      },
    ];
  });

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizMessage, setQuizMessage] = useState('');

  const [aptitudePlan] = useState([
    { topic: 'Percentages & Profit-Loss', level: 'Core', questions: 40 },
    { topic: 'Time-Speed-Distance', level: 'Core', questions: 35 },
    { topic: 'Time & Work / Pipes', level: 'Important', questions: 30 },
    { topic: 'Permutation & Probability', level: 'Advanced', questions: 25 },
  ]);

  const [aptitudeResources] = useState([
    { title: 'Aptitude Question Bank - Set 1', type: 'PDF', link: '#' },
    { title: 'Quant Practice Sheet - Percentages', type: 'PDF', link: '#' },
    { title: 'Reasoning Practice Questions', type: 'PDF', link: '#' },
    { title: 'Previous Year Aptitude Questions', type: 'PDF', link: '#' },
  ]);

  const [leetcodeByCompany] = useState([
    {
      company: 'Google',
      count: 12,
      link: 'https://leetcode.com/company/google/',
      tags: ['Arrays', 'Graphs', 'DP'],
    },
    {
      company: 'Amazon',
      count: 14,
      link: 'https://leetcode.com/company/amazon/',
      tags: ['Trees', 'Heap', 'Sliding Window'],
    },
    {
      company: 'Microsoft',
      count: 10,
      link: 'https://leetcode.com/company/microsoft/',
      tags: ['Strings', 'Design', 'Hashing'],
    },
    {
      company: 'Adobe',
      count: 8,
      link: 'https://leetcode.com/company/adobe/',
      tags: ['Math', 'Binary Search', 'Greedy'],
    },
  ]);

  const [tpoMaterials] = useState(() => {
    const fallbackMaterials = [
      {
        id: 1,
        title: 'Aptitude Formula Sheet',
        type: 'PDF',
        uploadedBy: 'TPO Office',
        uploadedOn: '2026-03-10',
        link: '#',
      },
      {
        id: 2,
        title: 'Interview HR Questions Bank',
        type: 'PDF',
        uploadedBy: 'TPO Office',
        uploadedOn: '2026-03-11',
        link: '#',
      },
      {
        id: 3,
        title: 'Resume Review Checklist',
        type: 'DOC',
        uploadedBy: 'Placement Mentor',
        uploadedOn: '2026-03-12',
        link: '#',
      },
      {
        id: 4,
        title: 'Top DSA Patterns (Company Wise)',
        type: 'PDF',
        uploadedBy: 'Coding Cell',
        uploadedOn: '2026-03-14',
        link: '#',
      },
      {
        id: 5,
        title: 'Core CS Handbook (OS/DBMS/CN)',
        type: 'PDF',
        uploadedBy: 'TPO Office',
        uploadedOn: '2026-03-16',
        link: '#',
      },
    ];

    const storedMaterials = localStorage.getItem(TPO_MATERIALS_STORAGE_KEY);
    if (storedMaterials) {
      try {
        const parsedMaterials = JSON.parse(storedMaterials);
        if (Array.isArray(parsedMaterials) && parsedMaterials.length > 0) {
          return parsedMaterials;
        }
      } catch (error) {
        return fallbackMaterials;
      }
    }

    return fallbackMaterials;
  });

  const completedQuizCount = useMemo(
    () => scheduledQuizzes.filter((quiz) => quiz.status === 'completed').length,
    [scheduledQuizzes]
  );

  const averageScore = useMemo(() => {
    const completed = scheduledQuizzes.filter((quiz) => quiz.score !== null);
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, quiz) => sum + (quiz.score / quiz.totalMarks) * 100, 0);
    return Math.round(total / completed.length);
  }, [scheduledQuizzes]);

  const activeQuestions = activeQuiz ? quizQuestionBank[activeQuiz.id] || [] : [];

  useEffect(() => {
    if (!activeQuiz || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft]);

  useEffect(() => {
    if (activeQuiz && timeLeft === 0) {
      handleSubmitQuiz(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, activeQuiz]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const startQuiz = (quiz) => {
    setQuizMessage('');
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setTimeLeft(quiz.timerSeconds || 600);
  };

  const selectAnswer = (questionId, optionIndex) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = (timedOut = false) => {
    if (!activeQuiz) return;

    const questions = quizQuestionBank[activeQuiz.id] || [];
    const correctCount = questions.reduce((sum, question) => {
      if (quizAnswers[question.id] === question.correctIndex) return sum + 1;
      return sum;
    }, 0);

    const perQuestionMarks = questions.length > 0 ? activeQuiz.totalMarks / questions.length : 0;
    const finalScore = Math.round(correctCount * perQuestionMarks);

    setScheduledQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === activeQuiz.id
          ? {
              ...quiz,
              status: 'completed',
              score: finalScore,
            }
          : quiz
      )
    );

    setActiveQuiz(null);
    setQuizAnswers({});
    setTimeLeft(0);
    setQuizMessage(
      timedOut
        ? `Time up. Quiz submitted automatically. Score: ${finalScore}/${activeQuiz.totalMarks}`
        : `Quiz submitted. Score: ${finalScore}/${activeQuiz.totalMarks}`
    );
  };

  return (
    <div className="student-preparation simple-prep-page">
      <section className="prep-hero-simple">
        <span className="prep-kicker">Preparation Panel</span>
        <h1>Simple Practice & Preparation</h1>
        <p>Attend scheduled TPO quizzes, practice aptitude, solve top LeetCode company questions, and refer TPO study materials.</p>
      </section>

      {quizMessage && <p className="quiz-result-banner">{quizMessage}</p>}

      <div className="prep-summary-grid">
        <div className="summary-card blue">
          <span>Scheduled Quizzes</span>
          <strong>{scheduledQuizzes.length}</strong>
        </div>
        <div className="summary-card green">
          <span>Completed Quizzes</span>
          <strong>{completedQuizCount}</strong>
        </div>
        <div className="summary-card orange">
          <span>Average Score</span>
          <strong>{averageScore}%</strong>
        </div>
        <div className="summary-card violet">
          <span>TPO Materials</span>
          <strong>{tpoMaterials.length}</strong>
        </div>
      </div>

      <Card title="Scheduled Quizzes (Uploaded by TPO)" className="prep-section-card quiz-section">
        <div className="quiz-list">
          {scheduledQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-item">
              <div>
                <h4>{quiz.title}</h4>
                <p>{quiz.companyFocus}</p>
                <small>
                  Date: {new Date(quiz.date).toLocaleDateString()} | Duration: {quiz.duration} | Marks: {quiz.totalMarks}
                </small>
              </div>
              <div className="quiz-actions">
                {quiz.score !== null ? (
                  <span className="quiz-score">Score: {quiz.score}/{quiz.totalMarks}</span>
                ) : (
                  <button type="button" className="btn btn-primary btn-small" onClick={() => startQuiz(quiz)}>
                    Start Quiz
                  </button>
                )}
                <span className={`quiz-status ${quiz.status}`}>{quiz.status}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="prep-two-column">
        <Card title="Aptitude Preparation" className="prep-section-card aptitude-section">
          <div className="topic-list">
            {aptitudePlan.map((topic) => (
              <div key={topic.topic} className="topic-item">
                <div>
                  <h5>{topic.topic}</h5>
                  <p>Practice Questions: {topic.questions}</p>
                </div>
                <span className={`level-badge ${topic.level.toLowerCase()}`}>{topic.level}</span>
              </div>
            ))}
          </div>

          <div className="aptitude-resources">
            <h5>Aptitude Question PDFs</h5>
            <div className="resource-link-list">
              {aptitudeResources.map((resource) => (
                <a key={resource.title} href={resource.link} target="_blank" rel="noreferrer" className="resource-link-item">
                  <span>{resource.title}</span>
                  <strong>{resource.type}</strong>
                </a>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Top LeetCode Questions (Company Wise)" className="prep-section-card leetcode-section">
          <div className="leetcode-list">
            {leetcodeByCompany.map((item) => (
              <div key={item.company} className="leetcode-item">
                <div>
                  <h5>{item.company}</h5>
                  <p>{item.count} predicted questions</p>
                  <div className="tag-row">
                    {item.tags.map((tag) => (
                      <span key={tag} className="tag-chip">{tag}</span>
                    ))}
                  </div>
                </div>
                <a href={item.link} target="_blank" rel="noreferrer" className="btn btn-outlined btn-small">
                  Open LeetCode
                </a>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="TPO Study Materials" className="prep-section-card material-section">
        <div className="material-list">
          {tpoMaterials.map((material) => (
            <div key={material.id} className="material-item">
              <div>
                <h5>{material.title}</h5>
                <p>
                  Uploaded by {material.uploadedBy} on {new Date(material.uploadedOn).toLocaleDateString()}
                </p>
              </div>
              <div className="material-actions">
                <span className="file-type">{material.type}</span>
                <a href={material.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-small">
                  View Material
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={!!activeQuiz}
        title={activeQuiz ? `${activeQuiz.title}` : 'Quiz'}
        onClose={() => setActiveQuiz(null)}
        onConfirm={() => handleSubmitQuiz(false)}
        confirmText="Submit Quiz"
      >
        {activeQuiz && (
          <div className="quiz-modal-body">
            <div className="quiz-meta-row">
              <span className="quiz-pill">{activeQuiz.companyFocus}</span>
              <span className="quiz-timer">Time Left: {formatTime(timeLeft)}</span>
            </div>

            <div className="quiz-question-list">
              {activeQuestions.map((question, index) => (
                <div key={question.id} className="quiz-question-card">
                  <h4>
                    Q{index + 1}. {question.question}
                  </h4>
                  <div className="quiz-options">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        type="button"
                        className={`option-btn ${quizAnswers[question.id] === optionIndex ? 'selected' : ''}`}
                        onClick={() => selectAnswer(question.id, optionIndex)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentPreparation;
