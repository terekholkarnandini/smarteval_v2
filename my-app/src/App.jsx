import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import StudentPage from "./components/StudentPage";
import FacultyPage from "./components/FacultyPage";
import SignupPage from "./components/SignupPage";
import FacultyDashboard from "./components/FacultyDashboard";
import SelfEvalPage from "./components/SelfEvalPage"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
         <Route path="/login" element={<LoginPage />} /> 
        <Route path="/student" element={<StudentPage />} />
        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/faculty/create-quiz" element={<FacultyDashboard />} />
         <Route path="/signup" element={<SignupPage />} />
         <Route path="/self-eval" element ={<SelfEvalPage/>}/>
     
      </Routes>
    </BrowserRouter>
  );
}

export default App;
