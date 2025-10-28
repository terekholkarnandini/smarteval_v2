import { useState, useEffect, useRef } from "react";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false); // 🧠 prevent double submit
  const timerRef = useRef(null);
  const pendingWarningRef = useRef(null);

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzesWithStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/quizzes");
        const quizzesData = await res.json();

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return setQuizzes(quizzesData);

        const quizzesWithStatus = await Promise.all(
          quizzesData.map(async (quiz) => {
            const res = await fetch(
              `http://localhost:5000/api/results/check/${user.studentId}/${quiz._id}`
            );
            const data = await res.json();
            return { ...quiz, attempted: data.attempted };
          })
        );

        setQuizzes(quizzesWithStatus);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
      }
    };

    fetchQuizzesWithStatus();
  }, []);

  // Timer
  useEffect(() => {
    if (!selectedQuiz) return;

    // Clear any old timer before starting new one
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // ⏰ Auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [selectedQuiz]);

  // Proctoring
  useEffect(() => {
    if (!selectedQuiz) return;

    const handleTabSwitch = () => {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        if (newCount < 3) {
          pendingWarningRef.current = `⚠️ Warning: You switched tabs (${newCount}/3). After 3 switches, the quiz will terminate.`;
        } else {
          pendingWarningRef.current =
            "❌ You switched tabs 3 times. The quiz is terminated!";
          alert(pendingWarningRef.current);
          clearInterval(timerRef.current);
          setSelectedQuiz(null);
          setScore(null);
          return 3;
        }
        return newCount;
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") handleTabSwitch();
      if (
        document.visibilityState === "visible" &&
        pendingWarningRef.current
      ) {
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
    setSubmitting(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (qIdx, optIdx) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  // ✅ Submit (with fix)
  const handleSubmit = async (auto = false) => {
    if (!selectedQuiz || submitting) return;
    setSubmitting(true);

    clearInterval(timerRef.current); // stop timer cleanly

    let correct = 0;
    selectedQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("❌ User not logged in. Please login again.");
      setSubmitting(false);
      return;
    }

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
      suspiciousActivity: tabSwitchCount > 0,
    };

    try {
      const res = await fetch("http://localhost:5000/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultData),
      });

      if (res.ok) {
        if (!auto) {
          alert(`🎉 Quiz submitted! Your score: ${correct} / ${totalQuestions}`);
        } else {
          alert("⏰ Time’s up! Your quiz was auto-submitted.");
        }

        // Reset after a short delay
        setTimeout(async () => {
          setSelectedQuiz(null);
          setScore(null);
          setTabSwitchCount(0);
          pendingWarningRef.current = null;

          const res = await fetch("http://localhost:5000/api/quizzes");
          const quizzesData = await res.json();
          const user = JSON.parse(localStorage.getItem("user"));

          const quizzesWithStatus = await Promise.all(
            quizzesData.map(async (quiz) => {
              const res = await fetch(
                `http://localhost:5000/api/results/check/${user.studentId}/${quiz._id}`
              );
              const data = await res.json();
              return { ...quiz, attempted: data.attempted };
            })
          );
          setQuizzes(quizzesWithStatus);
          setSubmitting(false);
        }, 1200);
      } else {
        const errorData = await res.json();
        console.error("❌ Failed to save result:", errorData);
        alert("❌ Failed to save result. Try again.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("❌ Error saving result:", err);
      alert("❌ Server error. Please try again later.");
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    clearInterval(timerRef.current);
    setSelectedQuiz(null);
    setScore(null);
    setTabSwitchCount(0);
    pendingWarningRef.current = null;
  };

  // UI Rendering
  if (selectedQuiz) {
    const progress = (timeLeft / (selectedQuiz.timeLimit * 60)) * 100;

    return (
      <div className="main-content">
        <div className="quiz-header">
          <button onClick={handleBack} className="attempt-btn">
            ← Back
          </button>
          <div>
            <p className="timer">⏱ {formatTime(timeLeft)}</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="quiz-card">
          <h2>{selectedQuiz.title}</h2>
          <p>
            Topic: {selectedQuiz.topic} | {selectedQuiz.timeLimit} mins
          </p>
        </div>

        {selectedQuiz.questions.map((q, i) => (
          <div key={i} className="question-card">
            <p>
              Q{i + 1}. {q.questionText}
            </p>
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

        <div>
          <button
            onClick={() => handleSubmit(false)}
            className="submit-btn"
            disabled={score !== null || submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
          <p>Tab switches: {tabSwitchCount} / 3</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <h1>Available Quizzes</h1>
      {quizzes.map((q) => (
        <div
          key={q._id}
          className={`quiz-card ${q.attempted ? "attempted" : ""}`}
        >
          <h2>{q.title}</h2>
          <p>
            {q.topic} • {q.timeLimit} mins
          </p>
          <button
            onClick={() => !q.attempted && handleSelectQuiz(q)}
            className="attempt-btn"
            disabled={q.attempted}
          >
            {q.attempted ? "Attempted " : "Attempt"}
          </button>
        </div>
      ))}
    </div>
  );
}
