import { useState, useEffect } from "react";
import "./Proctoring.css";

export default function Proctoring({ quizId }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!quizId) return;
    fetch(`http://localhost:5000/api/results/quiz/${quizId}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error("Failed to fetch results:", err));
  }, [quizId]);

  return (
    <div className="results-section">
      <h2>Proctoring Reports</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Student ID</th>
            <th>Score</th>
            <th>Total Questions</th>
            <th>Tab Switches</th>
            <th>Suspicious Activity</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} className={r.suspiciousActivity ? "alert-row" : ""}>
              <td>{r.studentName}</td>
              <td>{r.studentId}</td>
              <td>{r.score}</td>
              <td>{r.totalQuestions}</td>
              <td>{r.tabSwitchCount}</td>
              <td>
                {r.suspiciousActivity ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>⚠️ Yes</span>
                ) : (
                  "✅ No"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
