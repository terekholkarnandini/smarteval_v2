import { useState, useEffect } from "react";
import "./FacultyPage.css";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science"
];

export default function FacultyPage({ faculty }) {
  const { facultyName } = faculty || {};
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", topic: "", timeLimit: 10 });

  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
  });

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [file, setFile] = useState(null);

  // NEW: Subject state for upload
  const [uploadSubject, setUploadSubject] = useState("");

  // Track which section is active, default to "profile"
  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes")
      .then((res) => res.json())
      .then((data) => setQuizzes(data));
  }, []);

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

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/quizzes/${id}`, { method: "DELETE" });
    setQuizzes(quizzes.filter((q) => q._id !== id));
  };

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Modified to include uploadSubject in FormData, sent as "topic"
  const handleUploadClick = async () => {
    if (!file) return alert("Please select a file first!");
    if (!uploadSubject) return alert("Please select a subject!");
    const formData = new FormData();
    formData.append("quizFile", file);
    formData.append("topic", uploadSubject);

    const res = await fetch("http://localhost:5000/api/quizzes/upload", {
      method: "POST",
      body: formData,
    });

    const newQuiz = await res.json();
    setQuizzes([...quizzes, newQuiz]);
    setFile(null);
    setUploadSubject("");
  };

  return (
    <div className="faculty-dashboard">
      <div className="faculty-sidebar">
        <ul className="faculty-sidebar-nav">
          <li onClick={() => setActiveSection("profile")}><span>Profile</span></li>
          <li onClick={() => setActiveSection("createQuiz")}><span>Create Quiz</span></li>
          <li onClick={() => setActiveSection("proctoring")}><span>Proctoring Reports</span></li>
          <li onClick={() => setActiveSection("analysis")}><span>Student Analysis</span></li>
          <li onClick={() => setActiveSection("selfEval")}><span>Student Self-Evaluation</span></li>
          <li><span>Logout</span></li>
        </ul>
      </div>

      <div className="right-panel">
        {activeSection === "profile" && (
          <div style={{ padding: 20 }}>
            <h2>Welcome, {facultyName || "Faculty"}!</h2>
            <p>This is your profile section.</p>
          </div>
        )}

        {activeSection === "createQuiz" && (
          <>
            <div className="left-panel">
              <h1 className="dashboard-title">Faculty Quiz Management</h1>
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
            </div>
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
                      <button onClick={() => handleAddQuestion(q._id)} className="btn save-question-btn">
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
          </>
        )}

        {activeSection === "selfEval" && (
          <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8, maxWidth: 600, margin: "20px auto" }}>
            <h2>Upload PYQ PDF for Self Evaluation</h2>
            <label style={{ display: "block", marginBottom: 12 }}>
              Select Subject:
              <select
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                style={{ display: "block", margin: "12px 0", padding: "8px", width: "100%" }}
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </label>
            <input type="file" accept=".pdf,.txt" onChange={handleFileChange} style={{ marginBottom: 12 }} />
            <button onClick={handleUploadClick} className="btn upload-btn" style={{ marginTop: 12 }}>
              Upload Quiz
            </button>
          </div>
        )}

        {/* You can add similar blocks for "proctoring" and "analysis" if needed */}
      </div>
    </div>
  );
}
