import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callLLM(prompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Copy .env.example to .env and add your key from https://console.groq.com/keys');
  }
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse JSON from model response');
  }
}

function buildQuestionPrompt(text, history) {
  const asked = history.map((h, i) => `${i + 1}. ${h.question}`).join('\n') || '(none yet)';
  return `You are an English reading-comprehension teacher for a student.

The student just read this text:
"""
${text}
"""

Previously asked questions (do NOT repeat these or ask very similar ones):
${asked}

Generate ONE new comprehension question about the text. Vary the question type across the session — mix literal ("who/what/where/when"), inferential ("why"), action-focused ("what did X do"), and reflective ("how does X feel / what would happen if...") questions. Keep the language clear and natural, suitable for an English learner.

Respond ONLY as valid JSON in this exact shape:
{"question": "<the question>"}`;
}

function buildFeedbackPrompt(text, question, answer) {
  return `You are an encouraging but accurate English reading-comprehension teacher.

The student read this text:
"""
${text}
"""

You asked: "${question}"
The student answered: "${answer}"

Evaluate the answer based ONLY on the text. Decide if it is "correct", "partial", or "incorrect". Then write 1–3 sentences of warm feedback: confirm what they got right, gently correct mistakes, and if helpful, quote the relevant part of the text.

Respond ONLY as valid JSON in this exact shape:
{"verdict": "correct" | "partial" | "incorrect", "feedback": "<your feedback>"}`;
}

app.post('/api/question', async (req, res) => {
  try {
    const { text, history = [] } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a reading text of at least 20 characters.' });
    }
    const raw = await callLLM(buildQuestionPrompt(text, history));
    const parsed = extractJson(raw);
    if (!parsed.question) return res.status(502).json({ error: 'Model did not return a question.' });
    res.json({ question: parsed.question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function buildLookupPrompt(word, text) {
  return `You are a helpful English vocabulary assistant for a language learner.

The student is reading this text (use it for context if relevant):
"""
${text}
"""

The word they want to understand: "${word}"

Explain the word briefly and clearly. If it is an inflected form (past tense, plural, comparative, etc.), give its base/dictionary form. Provide a short image-search query that would return HELPFUL illustrations of the word:
- For concrete nouns, use the noun itself (e.g., "shawl").
- For verbs, suggest a scene (e.g., for "blew" use "person blowing air"; for "ran" use "person running").
- For abstract words or function words where images would not help, use an empty string "".

Respond ONLY as valid JSON in this exact shape:
{
  "word": "<the word as given>",
  "base_form": "<base/dictionary form; same as word if not inflected>",
  "part_of_speech": "<noun, verb, adjective, adverb, etc.>",
  "meaning": "<1-2 sentence clear definition in simple English>",
  "note": "<short note about inflection or context, or empty string>",
  "example": "<a short example sentence using the word>",
  "image_query": "<search query for images, or empty string>"
}`;
}

app.post('/api/lookup', async (req, res) => {
  try {
    const { word, text = '' } = req.body || {};
    if (!word || typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ error: 'Missing word.' });
    }
    const clean = word.trim().slice(0, 60);
    const raw = await callLLM(buildLookupPrompt(clean, text));
    const parsed = extractJson(raw);
    if (!parsed.meaning) return res.status(502).json({ error: 'Model did not return a meaning.' });
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { text, question, answer } = req.body || {};
    if (!text || !question || typeof answer !== 'string') {
      return res.status(400).json({ error: 'Missing text, question, or answer.' });
    }
    const raw = await callLLM(buildFeedbackPrompt(text, question, answer));
    const parsed = extractJson(raw);
    if (!parsed.feedback || !parsed.verdict) {
      return res.status(502).json({ error: 'Model did not return proper feedback.' });
    }
    res.json({ verdict: parsed.verdict, feedback: parsed.feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Reading Teacher running at http://localhost:${PORT}`);
  console.log(`Using Groq model: ${GROQ_MODEL}`);
  if (!GROQ_API_KEY) {
    console.warn('WARNING: GROQ_API_KEY is not set. The app will not work until you add it to .env');
  }
});
