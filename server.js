const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Rate limiting (3 requests/min for free tier)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: 'Too many requests - OpenAI free tier allows 3 requests/minute'
});

// Middleware
app.use(express.json()); // For JSON payloads (user prompt)
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cors());

// Cache to avoid duplicate API calls
const summaryCache = new Map();

app.post('/upload', upload.single('file'), limiter, async (req, res) => {
  try {
    // 1. Get inputs: File (optional) + User Prompt (required)
    const userPrompt = req.body.prompt || "Summarize the key points";
    if (!req.file && !userPrompt) {
      return res.status(400).json({ error: "Either a file or prompt is required" });
    }

    // 2. Extract text (mock for now - replace with real parsing later)
    let textToAnalyze = userPrompt;
    if (req.file) {
      textToAnalyze += `\n\nFile content (${req.file.originalname}):\n` + 
        "Mock extracted text - replace with python-pptx/pdf-parse later";
    }

    // 3. Check cache
    const cacheKey = `${userPrompt}-${req.file?.originalname || 'no-file'}`;
    if (summaryCache.has(cacheKey)) {
      return res.json(summaryCache.get(cacheKey));
    }

    // 4. Call OpenAI (GPT-3.5-turbo - cheapest option)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You summarize content based on user instructions. Be concise." 
        },
        { 
          role: "user", 
          content: `User instructions: ${userPrompt}\n\nContent to analyze: ${textToAnalyze}` 
        }
      ],
      max_tokens: 150, // Strict limit to control costs
      temperature: 0.3 // Less creative = more predictable
    });

    // 5. Cache and respond
    const summary = completion.choices[0].message.content;
    summaryCache.set(cacheKey, { summary, source: req.file ? 'file+prompt' : 'prompt-only' });
    
    res.json({ 
      summary,
      model: "gpt-3.5-turbo",
      cost_estimate: `~$${(150/1000)*0.002}` // Approx cost
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'AI processing failed',
      solution: 'Try again in 20 seconds or simplify your prompt',
      details: error.message 
    });
  }
});

app.listen(3001, () => console.log('Server running (GPT-3.5-turbo optimized)'));