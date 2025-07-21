import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';



//login page
function Login() {
  return (
    <div>
      <h2 className="login-form">Login</h2>
      <form className="login-form">
        <input className="login-input" type="text" placeholder="Username" /><br />
        <input className="login-input" type="password" placeholder="Password" /><br />
        <button className="login-submit-btn" type="submit">Log In</button>
      </form>
    </div>
  );
}


//UI for the front page
function Wizard(){
const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (file) => {
    console.log("Upload button pressed. File:", file);
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pptx_file', file);
      
      console.log("Sending POST to backend...");
      
      const response = await fetch('http://localhost:5000/', {
        method: 'POST',
        body: formData,
      });
      console.log("Response status:", response.status);
      
      if (!response.ok) throw new Error(await response.text());

      const text = await response.text();
      console.log("Raw response text:", text);
      let data;
      try {
        data = JSON.parse(text);
        console.log("Parsed response data:", data);
      } 
      catch (e) {
        console.error("Failed to parse JSON:", e);
        setError("Invalid response from server.");
        return;
      }

      const summaryText = data.ai_response?.choices?.[0]?.message?.content || "No summary found.";
      setSummary(summaryText);
      localStorage.setItem(`cache-${file.name}`, summaryText);

    } catch (err) {
      setError(err.message.includes('rate limit') 
        ? "Speed limit reached (3/min). Wait 20 seconds." 
        : "AI busy. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('last-summary');
    if (cached) setSummary(cached);
  }, []);

  return (
    <div className="wizard-container">
      <button className="login-btn" onClick={() => navigate('/login')}>
          Login
        </button>
      <h1 className="wizard-title">🧙‍♂️ Slide Sage</h1>

      <label className="upload-label">
        Upload Your Scroll (PDF or PPTX):
        <input 
          type="file" 
          onChange={(e) => handleUpload(e.target.files[0])}
          disabled={isLoading}
        />
      </label>

      {isLoading && <p className="wizard-loading">Casting Summarize Spell...</p>}
      {error && <p className="wizard-error">{error}</p>}

      {summary && (
        <div className="wizard-summary">
          <h2>📜 Enchanted Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
  

}

//functionality for routing to different pages (/login, /, etc..)
function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Wizard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;