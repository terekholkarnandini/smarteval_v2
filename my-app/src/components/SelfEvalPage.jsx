import React, { useState, useEffect, useMemo } from 'react';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science'
];

export default function SelfEvalPage() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [score, setScore] = useState(0);
  const [lastScore, setLastScore] = useState(null);
  const [lastTotal, setLastTotal] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then(res => res.json())
      .then(data => setQuizzes(data));
  }, []);

  // Stable questions only per quiz-start
  const quizQuestions = useMemo(() => (
    quizStarted
      ? quizzes
        .flatMap(q => q.questions)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
      : []
  ), [quizStarted, quizzes]);

  // Dynamically recalculate score whenever answers or quizQuestions change
  useEffect(() => {
    if (quizQuestions.length > 0) {
      let currentScore = 0;
      quizQuestions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) currentScore++;
      });
      setScore(currentScore);
    }
  }, [answers, quizQuestions]);

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setLastScore(null);
    setLastTotal(null);
  };

  // Save the answer as the index of the selected option
  const handleAnswerSelect = (optionIdx) => {
    const questionId = quizQuestions[currentQuestionIndex].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const goNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    setLastScore(score); // Save the score to display after quiz is finished
    setLastTotal(quizQuestions.length);
    setQuizStarted(false);
    setSelectedSubject('');
    setAnswers({});
    setCurrentQuestionIndex(0);
    alert(`Quiz submitted! Your score: ${score} out of ${quizQuestions.length}`);
  };

  const questionIsAvailable = quizQuestions[currentQuestionIndex];

  return (
    <div style={{
      maxWidth: 600,
      margin: '60px auto',
      padding: 30,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: 10,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#fff'
    }}>
      <h1 style={{ color: '#4a148c', marginBottom: 20, textAlign: 'center' }}>
        Self Evaluation - PYQ Quiz
      </h1>
      {!quizStarted ? (
        <>
          {lastScore !== null && lastTotal !== null && (
            <div style={{ marginTop: 20, fontWeight: 'bold', color: '#4a148c', textAlign: 'center', fontSize: 20 }}>
              Last Score: {lastScore} / {lastTotal}
            </div>
          )}
          <label style={{ display: 'block', marginBottom: 12, fontWeight: '600', fontSize: 16 }}>
            Choose Subject:
          </label>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 15px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 16,
              marginBottom: 30,
              outline: 'none'
            }}
          >
            <option value="">-- Select a subject --</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <button
            onClick={startQuiz}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 8,
              fontSize: 18,
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: '#6a1b9a',
              color: 'white',
              border: 'none',
              transition: 'background-color 0.3s ease'
            }}
          >
            Take Quiz
          </button>
          <div style={{ marginTop: 40, fontStyle: 'italic', color: '#777', textAlign: 'center' }}>
            Quiz questions will appear here once added.
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ marginBottom: 10 }}>Random Quiz</h3>
            <span style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>
              Score: {score}
            </span>
          </div>
          {!questionIsAvailable ? (
            <p>No questions available yet.</p>
          ) : (
            <>
              <p>Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
              <p style={{ fontSize: 20, color: "black" }}>
                {questionIsAvailable.questionText}
              </p>
              <div>
                {questionIsAvailable.options.map((opt, idx) => (
                  <label key={opt} style={{ display: 'block', margin: '8px 0', cursor: 'pointer', color: "black" }}>
                    <input
                      type="radio"
                      name={`answer_${questionIsAvailable.id}`}
                      checked={answers[questionIsAvailable.id] === idx}
                      onChange={() => handleAnswerSelect(idx)}
                      style={{ marginRight: 8 }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={goPrev}
                  disabled={currentQuestionIndex === 0}
                  style={{ marginRight: 10, padding: '8px 16px' }}
                >
                  Previous
                </button>
                {currentQuestionIndex < quizQuestions.length - 1 ? (
                  <button
                    onClick={goNext}
                    disabled={answers[questionIsAvailable.id] === undefined}
                    style={{ padding: '8px 16px' }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={submitQuiz}
                    disabled={answers[questionIsAvailable.id] === undefined}
                    style={{ padding: '8px 16px', backgroundColor: '#6a1b9a', color: 'white' }}
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
              <div style={{ marginTop: 30 }}>
                <button onClick={() => setQuizStarted(false)} style={{ color: '#6a1b9a', border: 'none', background: 'none', cursor: 'pointer' }}>
                  Cancel Quiz
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
