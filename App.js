import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setSummary(data.summary);
      localStorage.setItem(`cache-${file.name}`, data.summary);

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
      <h1 className="wizard-title">🧙‍♂️ Slide Sage</h1>

      <label className="upload-label">
        Upload Your Scroll (PDF)
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

export default App;
