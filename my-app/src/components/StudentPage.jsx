import { useState, useEffect } from "react";
import "./StudentPage.css";
import { useNavigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard";

export default function StudentPage({ student }) {
  const [studentInfo, setStudentInfo] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    // Load student info either from props or localStorage
    let info = null;
    if (student) {
      info = student;
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        info = JSON.parse(storedUser);
      }
    }
    // Attach studentId from localStorage if present
    const storedStudentId = localStorage.getItem("studentId");
    if (info && storedStudentId) {
      info.studentId = storedStudentId;
    }
    setStudentInfo(info);
  }, [student]);

  // If student clicks "Attempt Quiz"
  if (showDashboard) {
    return <StudentDashboard />;
  }

  return (
    <div className="student-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        
        <ul className="sidebar-nav">
          <li><span onClick={() => { setShowProfile(true); setShowDashboard(false); }}>Profile</span></li>
          <li><span>Analysis</span></li>
          <li><span onClick={() => { setShowDashboard(true); setShowProfile(false); }}>Attempt Quiz</span></li>
          <li><span>Resources</span></li>
           <li><span onClick={() => navigate("/results")}>View Results</span></li>
          
        </ul>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {!showProfile ? (
          <>
            <h1>Welcome, {studentInfo?.name || "Student"} </h1>
            <p>Overall Progress</p>

            <div className="section-grid">
              <div className="section-card" onClick={() => navigate("/analysis")}>
                <img src="/images/analysis.png" alt="Analysis" />
                <h3>Performance Analysis</h3>
              </div>

              <div className="section-card" onClick={() => navigate("/self-eval")}>
                <img src="/images/selfeval.png" alt="Self Evaluation" />
                <h3>Self Evaluation</h3>
              </div>

              <div className="section-card" onClick={() => navigate("/resources")}>
                <img src="/images/resources.png" alt="Resources" />
                <h3>Learning Resources</h3>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1>👤 Student Profile</h1>
            <div className="profile-card">
              <p><strong>Name:</strong> {studentInfo?.name}</p>
              <p><strong>Email:</strong> {studentInfo?.email}</p>
              <p><strong>Role:</strong> {studentInfo?.role}</p>
              {studentInfo?.studentId && (
                <p><strong>Student ID:</strong> {studentInfo.studentId}</p>
              )}
            </div>
          </>
        )}
      </main>

      <div className="chatbot"></div>
    </div>
  );
}
