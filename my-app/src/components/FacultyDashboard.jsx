import { useState, useEffect } from "react";
import "./FacultyDashboard.css"; 

export default function FacultyDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", topic: "", timeLimit: 10 });

  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Fetch quizzes
  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data));
  }, []);

  // Create quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newQuiz = await res.json();
    setQuizzes([...quizzes, newQuiz]);
    setForm({ title: "", description: "", topic: "", timeLimit: 10 });
  };

  // Delete quiz
  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/quizzes/${id}`, { method: "DELETE" });
    setQuizzes(quizzes.filter((q) => q._id !== id));
  };

  // Add question to quiz
  const handleAddQuestion = async (quizId) => {
    const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        $push: { questions: questionForm },
      }),
    });

    const updatedQuiz = await res.json();
    setQuizzes(quizzes.map((q) => (q._id === quizId ? updatedQuiz : q)));

    setQuestionForm({ questionText: "", options: ["", "", "", ""], correctAnswer: 0 });
    setSelectedQuiz(null);
  };
  const [file, setFile] = useState(null);

const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};

const handleUploadClick = async () => {
  if (!file) return alert("Please select a file first!");
  const formData = new FormData();
  formData.append("quizFile", file);

  const res = await fetch("http://localhost:5000/api/quizzes/upload", {
    method: "POST",
    body: formData,
  });

  const newQuiz = await res.json();
  setQuizzes([...quizzes, newQuiz]);
  setFile(null);
};


  return (
    <div className="faculty-dashboard">
     <div className="left-panel">
  <h1 className="dashboard-title">Faculty Quiz Management</h1>

  {/* Quiz Form */}
  <form onSubmit={handleSubmit} className="quiz-form">
    <input
      className="input-field"
      placeholder="Title"
      value={form.title}
      onChange={(e) => setForm({ ...form, title: e.target.value })}
    />
    <input
      className="input-field"
      placeholder="Description"
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
    />
    <input
      className="input-field"
      placeholder="Topic"
      value={form.topic}
      onChange={(e) => setForm({ ...form, topic: e.target.value })}
    />
    <input
      className="input-field time-limit"
      type="number"
      placeholder="Time Limit"
      value={form.timeLimit}
      onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
    />
    <button className="btn add-quiz-btn">Add Quiz</button>
  </form>

  {/* ⬇️ Upload section moved OUTSIDE form to prevent conflict */}
  <div className="upload-section">
    <input type="file" accept=".txt,.pdf" onChange={handleFileChange} />
    <button
      type="button"
      onClick={handleUploadClick}
      className="btn upload-btn"
    >
      Upload Quiz
    </button>
  </div>
</div>


      <div className="right-panel">
        {/* Quiz List */}
      
        <ul className="quiz-list">
          {quizzes.map((q) => (
            <li key={q._id} className="quiz-item">
              <div className="quiz-header">
                <span>
                  <strong>{q.title}</strong> ({q.topic})
                </span>
                <button onClick={() => handleDelete(q._id)} className="btn delete-btn">
                  Delete
                </button>
              </div>

              {/* Questions */}
              {q.questions && q.questions.length > 0 && (
                <ul className="questions-list">
                  {q.questions.map((ques, i) => (
                    <li key={i} className="question-item">
                      <p>{ques.questionText}</p>
                      <ol type="a">
                        {ques.options.map((opt, idx) => (
                          <li key={idx}>
                            {opt} {idx === ques.correctAnswer ? "✅" : ""}
                          </li>
                        ))}
                      </ol>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add Question Form */}
              {selectedQuiz === q._id ? (
                <div className="add-question-form">
                  <input
                    className="input-field full-width"
                    placeholder="Question Text"
                    value={questionForm.questionText}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, questionText: e.target.value })
                    }
                  />
                  {questionForm.options.map((opt, idx) => (
                    <input
                      key={idx}
                      className="input-field full-width"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...questionForm.options];
                        newOptions[idx] = e.target.value;
                        setQuestionForm({ ...questionForm, options: newOptions });
                      }}
                    />
                  ))}
                  <label>
                    Correct Answer(0-3):
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={questionForm.correctAnswer}
                      onChange={(e) =>
                        setQuestionForm({ ...questionForm, correctAnswer: parseInt(e.target.value) })
                      }
                      className="input-field small-input"
                    />
                  </label>
                  <button
                    onClick={() => handleAddQuestion(q._id)}
                    className="btn save-question-btn"
                  >
                    Save Question
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedQuiz(q._id)}
                  className="btn add-question-btn"
                >
                  + Add Question
                </button>
              )}
            </li>
          ))}
        </ul>
        
      


      </div>
    </div>
  );
}
