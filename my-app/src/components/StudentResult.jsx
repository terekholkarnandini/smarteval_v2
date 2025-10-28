import { useEffect, useState } from "react";
import "./StudentResult.css";

export default function StudentResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    fetch(`http://localhost:5000/api/results/student/${user.studentId}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error("Error fetching results:", err));
  }, []);

  return (
    <div className="results-page">
      <h1> Your Quiz Results</h1>
      {results.length === 0 ? (
        <p>No results yet. Attempt a quiz to see your performance!</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr>
              <th>Quiz Title</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Tab Switches</th>
              <th>Suspicious</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id}>
                <td>{r.quizTitle}</td>
                <td>{r.score}/{r.totalQuestions}</td>
                <td>{r.percentage}%</td>
                <td>{r.tabSwitchCount}</td>
                <td>{r.suspiciousActivity ? "⚠️ Yes" : "✅ No"}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
