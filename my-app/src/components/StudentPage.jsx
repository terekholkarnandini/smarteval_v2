import { useState, useEffect } from "react";
import "./StudentPage.css";
import { useNavigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard"; 

export default function StudentPage({ student }) {
  const [studentName, setStudentName] = useState(""); 
  const [showDashboard, setShowDashboard] = useState(false);

    const navigate = useNavigate(); 

  useEffect(() => {
    if (student && student.name) {
      
      setStudentName(student.name);
    } else {
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setStudentName(parsedUser.name);
      }
    }
  }, [student]);

  if (showDashboard) {
    return <StudentDashboard />;
  }

  return (
    <div className="student-dashboard">
      <div className="sidebar">
        <ul className="sidebar-nav">
          <li><span>Profile</span></li>
          <li><span>Analysis</span></li>
          <li>
            <span onClick={() => setShowDashboard(true)}>Attempt Quiz</span>
          </li>
          <li><span>Resources</span></li>
        </ul>
      </div>
<main className="main-content">
   <h1>Welcome {student?.name || "Student"}!</h1>
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
</main>

      <div className="chatbot"></div>
    </div>
  );
}
