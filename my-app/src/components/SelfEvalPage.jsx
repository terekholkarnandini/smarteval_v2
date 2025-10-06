import { useState } from "react";
import axios from "axios";

export default function SelfEvalPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    if (!topic) return alert("Please enter a topic");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/self-eval", {
        topic,
        numQuestions,
        difficulty,
      });

      setQuestions(response.data.questions);
    } catch (error) {
      console.error(error);
      alert("Failed to generate quiz. Check backend or API key.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Self Evaluation Quiz Generator</h1>

      <input
        type="text"
        placeholder="Enter Topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        style={{ margin: "10px", padding: "5px" }}
      />

      <input
        type="number"
        placeholder="Number of Questions"
        value={numQuestions}
        onChange={(e) => setNumQuestions(e.target.value)}
        style={{ margin: "10px", padding: "5px", width: "150px" }}
      />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        style={{ margin: "10px", padding: "5px" }}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <button onClick={generateQuiz} style={{ padding: "5px 10px" }}>
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      <div style={{ marginTop: "30px" }}>
        {questions.map((q, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "5px",
            }}
          >
            <p>
              <strong>Q{idx + 1}:</strong> {q.question}
            </p>
            <ul>
              {q.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>
            <p>
              <strong>Answer:</strong> {q.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
