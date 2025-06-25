import { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Upload failed: ' + error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        {/* File Upload Section */}
        <div style={{ margin: '20px' }}>
          <input 
            type="file" 
            onChange={handleUpload} 
            accept=".pdf,.pptx" 
            id="file-upload"
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="file-upload" 
            className="App-link"
            style={{ cursor: 'pointer', padding: '10px 15px', border: '1px solid white' }}
          >
            Upload Slides (PDF/PPTX)
          </label>
          {fileName && <p>Selected: {fileName}</p>}
          {message && <p>{message}</p>}
        </div>

        <p>Slide Sage: AI-powered slide enhancement</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;