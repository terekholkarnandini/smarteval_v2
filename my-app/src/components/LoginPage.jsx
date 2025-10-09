import { useState, useEffect, useRef } from "react";
import "./LoginPage.css";
import FOG from "vanta/dist/vanta.fog.min";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";  

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const navigate = useNavigate(); 
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = FOG({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0x1f3b73,
        midtoneColor: 0x215caa,
        lowlightColor: 0x184a8c,
        baseColor: 0x2364aa,
        blurFactor: 0.78,
        speed: 5,
      });
    }
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);



 const handleLogin = async (e) => {
  e.preventDefault();

  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

  if (response.ok) {
  console.log("Login success:", data);

  localStorage.setItem("user", JSON.stringify(data.user));
  localStorage.setItem("token", data.token);

  // ✅ Add this line
  localStorage.setItem("name", data.user.name);  // 🔥 this fixes studentName=null

  // ✅ Store student ID if exists
  if (data.user.role === "student" && data.user.studentId) {
    localStorage.setItem("studentId", data.user.studentId);

    // ✅ Friendly welcome message with student ID
    alert(`✅ Welcome, ${data.user.name}!\nYour Student ID: ${data.user.studentId}`);
  } else {
    alert(`✅ Welcome, ${data.user.name}!`);
  }

  // Navigate after showing alert
  if (role === "student") navigate("/student");
  else navigate("/faculty");
}

else {
      alert(data.error || "Invalid credentials");
    }
  } catch (err) {
    console.error("Error logging in:", err);
    alert("⚠️ Unable to login. Please try again.");
  }
};


  return (
    <>
      <div id="vanta" ref={vantaRef}></div>
      <div className="login-container">
        <div className="login-card">
          <h1 className="title">SmartEval Login</h1>

          <div className="role-switch">
            <button
              className={role === "student" ? "active" : ""}
              onClick={() => setRole("student")}
            >
              Student
            </button>
            <button
              className={role === "faculty" ? "active" : ""}
              onClick={() => setRole("faculty")}
            >
              Faculty
            </button>
          </div>

        
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit" className="login-btn">
              Login as {role}
            </button>
          </form>

          <p className="signup-text">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
}
