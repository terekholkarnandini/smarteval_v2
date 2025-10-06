import { useState, useEffect, useRef } from "react";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const pendingWarningRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch quizzes
  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then(res => res.json())
      .then(data => setQuizzes(data))
      .catch(err => console.error("Failed to fetch quizzes:", err));
  }, []);

  // Timer
  useEffect(() => {
    if (!selectedQuiz || timeLeft === null) return;
    if (timeLeft <= 0) {
      alert("⏰ Time’s up! Quiz is auto-submitted.");
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, selectedQuiz]);

  // Proctoring
  useEffect(() => {
    if (!selectedQuiz) return;
    const handleTabSwitch = () => {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount < 3) {
          pendingWarningRef.current = `Warning: You switched tabs! (${newCount}/3). After the 3rd switch, the quiz will be terminated.`;
        } else if (newCount === 3) {
          pendingWarningRef.current = "You switched tabs 3 times. The quiz is terminated!";
        }
        return newCount;
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleTabSwitch();
      else if (document.visibilityState === "visible" && pendingWarningRef.current) {
        alert(pendingWarningRef.current);
        if (tabSwitchCount + 1 > 3) {
          setSelectedQuiz(null);
          setScore(null);
          setTabSwitchCount(0);
        }
        pendingWarningRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [selectedQuiz, tabSwitchCount]);

  // Select quiz
  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setAnswers({});
    setScore(null);
    setTimeLeft(quiz.timeLimit * 60);
    setTabSwitchCount(0);
    pendingWarningRef.current = null;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Answer
  const handleAnswer = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  // Submit
  const handleSubmit = () => {
    if (!selectedQuiz) return;
    if (tabSwitchCount >= 3) {
      alert(" Quiz submission blocked due to excessive tab switching!");
      return;
    }
    let correct = 0;
    selectedQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
  };

  const handleBack = () => {
    setSelectedQuiz(null);
    setScore(null);
    setTabSwitchCount(0);
    pendingWarningRef.current = null;
  };

  // UI
  if (selectedQuiz) {
    const progress = (timeLeft / (selectedQuiz.timeLimit * 60)) * 100;
    return (
      <div className="main-content">
        {/* Header */}
        <div className="quiz-header">
          <button onClick={handleBack} className="attempt-btn">← Back</button>
          <div>
            <p className="timer">⏱ {formatTime(timeLeft)}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        
        <div className="quiz-card">
          <h2>{selectedQuiz.title}</h2>
          <p>Topic: {selectedQuiz.topic} | {selectedQuiz.timeLimit} mins</p>
        </div>

        {/* Questions */}
        {selectedQuiz.questions.map((q, i) => (
          <div key={i} className="question-card">
            <p>Q{i + 1}. {q.questionText}</p>
            {q.options.map((opt, oi) => (
              <label key={oi} className="option">
                <input
                  type="radio"
                  name={`q-${i}`}
                  checked={answers[i] === oi}
                  onChange={() => handleAnswer(i, oi)}
                  disabled={score !== null}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ))}

        {/* Actions */}
        <div>
          <button onClick={handleSubmit} className="submit-btn" disabled={score !== null}>
            Submit Quiz
          </button>
          <p>Tab switches: {tabSwitchCount} / 3</p>
        </div>

        {/* Results */}
        {score !== null && (
          <div className="result-box">
            <h3>Results</h3>
            <p>Your Score: {score} / {selectedQuiz.questions.length}</p>
          </div>
        )}
      </div>
    );
  }

  // Quiz List
  return (
    <div className="main-content">
      <h1> Available Quizzes</h1>
      {quizzes.map(q => (
        <div key={q._id} className="quiz-card">
          <h2>{q.title}</h2>
          <p>{q.topic} • {q.timeLimit} mins</p>
          <button onClick={() => handleSelectQuiz(q)} className="attempt-btn">
            Attempt
          </button>
        </div>
      ))}
    </div>
  );
}
