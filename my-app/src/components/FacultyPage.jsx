import "./FacultyPage.css";
import { useNavigate } from "react-router-dom";

export default function FacultyPage({ faculty }) {
  const { facultyName } = faculty || {};
    const navigate = useNavigate();
 

  return (
    <div className="faculty-dashboard">
      {/* Sidebar */}
      <div className="faculty-sidebar">
        <ul className="faculty-sidebar-nav">
          <li><span>Profile</span></li>
          <li onClick={() => navigate("/faculty/create-quiz")}><span>Create Quiz</span></li>
          
          <li><span>Proctoring Reports</span></li>
          <li><span>Student Analysis</span></li>
          
          
          <li><span>Logout</span></li>
        </ul>
      </div>

  
      <main className="faculty-main-content">
        <h2 className="faculty-heading">Faculty Dashboard</h2>
        <p className="faculty-welcome">Welcome, {facultyName || "Faculty Member"}!</p>

        
        <div className="create-quiz-card">
          <h3>Create Your Quiz</h3>
          <p>Quickly create and manage your quizzes from here.</p>
          <button 
            className="create-btn"
            onClick={() => navigate("/faculty/create-quiz")}
          >+ Create New Quiz</button>
        </div>
      </main>
    </div>
  );
}
