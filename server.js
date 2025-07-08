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
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 requests per windowMs
  message: 'Too many requests - OpenAI free tier allows 3 requests/minute'
});
app.use('/upload', limiter);

// Cache to avoid duplicate API calls
const summaryCache = new Map();

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // 1. Mock text extraction (replace with real parsing later)
    const mockText = `Slide content from ${req.file.originalname}:\n` + 
                     "- Topic: Artificial Intelligence\n" +
                     "- Key Points: Machine Learning, Neural Networks";

    // 2. Check cache first
    const cacheKey = mockText.substring(0, 50); // Simple hash for demo
    if (summaryCache.has(cacheKey)) {
      return res.json(summaryCache.get(cacheKey));
    }

    // 3. Call OpenAI (GPT-3.5-turbo)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "Summarize this in 2 bullet points. Be concise." // Short prompt
        },
        { 
          role: "user", 
          content: mockText 
        }
      ],
      max_tokens: 60 // Limit response length
    });

    // 4. Cache and respond
    const summary = completion.choices[0].message.content;
    summaryCache.set(cacheKey, { summary });
    res.json({ summary });

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      error: 'AI service overloaded. Try again in 20 seconds.',
      details: error.message 
    });
  }
});

app.listen(3001, () => console.log('Server running (GPT-3.5-turbo free tier mode)'));