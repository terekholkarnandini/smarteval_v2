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
    if (!selectedQuiz) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("⏰ Time’s up! Quiz is auto-submitted.");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedQuiz]);

  // Proctoring
  useEffect(() => {
    if (!selectedQuiz) return;

    const handleTabSwitch = () => {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;

        if (newCount < 3) {
          pendingWarningRef.current = `⚠️ Warning: You switched tabs (${newCount}/3). After 3 switches, the quiz will terminate.`;
        } else {
          pendingWarningRef.current = "❌ You switched tabs 3 times. The quiz is terminated!";
          // Terminate quiz
          setSelectedQuiz(null);
          setScore(null);
          return 3; // Stop increment
        }

        return newCount;
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleTabSwitch();
      if (document.visibilityState === "visible" && pendingWarningRef.current) {
        alert(pendingWarningRef.current);
        pendingWarningRef.current = null;
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [selectedQuiz]);

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
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Answer
  const handleAnswer = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

 // Submit
const handleSubmit = async () => {
  if (!selectedQuiz) return;

  // Calculate score
  let correct = 0;
  selectedQuiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) correct++;
  });
  setScore(correct);

  // Get logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("❌ User not logged in. Please login again.");
    return;
  }

  // Prepare result data
  const totalQuestions = selectedQuiz.questions.length;
  const percentage = ((correct / totalQuestions) * 100).toFixed(2);

  const resultData = {
    studentId: user?.studentId || user?.id,
    studentName: user?.name,
    quizId: selectedQuiz._id,
    quizTitle: selectedQuiz.title,
    score: correct,
    totalQuestions,
    percentage,
    correctAnswers: correct,
    tabSwitchCount,
    suspiciousActivity: tabSwitchCount > 0
  };

  console.log("📤 Sending result data:", resultData);

  try {
    const res = await fetch("http://localhost:5000/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resultData)
    });

    if (res.ok) {
      console.log("✅ Result saved successfully");
      alert(`🎉 Quiz submitted! Your score: ${correct} / ${totalQuestions}`);
    } else {
      const errorData = await res.json();
      console.error("❌ Failed to save result:", errorData);
      alert("❌ Failed to save result. Try again.");
    }
  } catch (err) {
    console.error("❌ Error saving result:", err);
    alert("❌ Server error. Please try again later.");
  }
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
      <h1>Available Quizzes</h1>
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