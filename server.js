import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const PROVIDERS = {
  groq: {
    key: () => process.env.GROQ_API_KEY,
    url: 'https://api.groq.com/openai/v1/chat/completions',
    type: 'openai'
  },
  openai: {
    key: () => process.env.OPENAI_API_KEY,
    url: 'https://api.openai.com/v1/chat/completions',
    type: 'openai'
  },
  openrouter: {
    key: () => process.env.OPENROUTER_API_KEY,
    url: 'https://openrouter.ai/api/v1/chat/completions',
    type: 'openai'
  },
  gemini: {
    key: () => process.env.GEMINI_API_KEY,
    type: 'gemini'
  }
};

const DEFAULT_CHAIN = [
  'groq:llama-3.3-70b-versatile',
  'groq:llama-3.1-8b-instant',
  'groq:llama3-70b-8192',
  'groq:llama3-8b-8192',
  'groq:gemma2-9b-it',
  'gemini:gemini-2.0-flash',
  'gemini:gemini-1.5-flash',
  'openrouter:qwen/qwen-2.5-72b-instruct:free',
  'openrouter:meta-llama/llama-3.3-70b-instruct:free',
  'openrouter:google/gemini-2.0-flash-exp:free',
  'openai:gpt-4o-mini'
];

const MODEL_CHAIN = (process.env.LLM_MODELS || process.env.GROQ_MODELS || DEFAULT_CHAIN.join(','))
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

let currentModelIdx = 0;

function parseModel(spec) {
  const colon = spec.indexOf(':');
  if (colon < 0) return { provider: 'groq', model: spec };
  const provider = spec.slice(0, colon);
  if (!PROVIDERS[provider]) return { provider: 'groq', model: spec };
  return { provider, model: spec.slice(colon + 1) };
}

function isRetriable(err) {
  if (err.noKey) return true;
  const s = err.status;
  if (s === 429 || s === 500 || s === 502 || s === 503 || s === 404) return true;
  return /rate[ _-]?limit|quota|exceeded|credit|unavailable|decommissioned|not found|does not exist|insufficient/i.test(err.message || '');
}

async function callOpenAICompat(url, apiKey, model, prompt) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(body.slice(0, 400));
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response');
  return text;
}

async function callGemini(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
    })
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(body.slice(0, 400));
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response');
  return text;
}

async function callModel(spec, prompt) {
  const { provider, model } = parseModel(spec);
  const p = PROVIDERS[provider];
  const apiKey = p.key();
  if (!apiKey) {
    const err = new Error(`No API key for "${provider}". Set ${provider.toUpperCase()}_API_KEY in .env to enable.`);
    err.noKey = true;
    throw err;
  }
  if (p.type === 'openai') return callOpenAICompat(p.url, apiKey, model, prompt);
  if (p.type === 'gemini') return callGemini(apiKey, model, prompt);
  throw new Error(`Unknown provider type: ${p.type}`);
}

async function callLLM(prompt) {
  const configuredProviders = Object.entries(PROVIDERS).filter(([, p]) => p.key()).map(([n]) => n);
  if (configuredProviders.length === 0) {
    throw new Error('No LLM provider API keys configured. Set at least one of GROQ_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY in .env.');
  }
  const errors = [];
  for (let attempt = 0; attempt < MODEL_CHAIN.length; attempt++) {
    const idx = (currentModelIdx + attempt) % MODEL_CHAIN.length;
    const spec = MODEL_CHAIN[idx];
    try {
      const result = await callModel(spec, prompt);
      if (idx !== currentModelIdx) {
        console.log(`Switched active model to: ${spec}`);
        currentModelIdx = idx;
      }
      return result;
    } catch (err) {
      errors.push(`${spec} [${err.status ?? (err.noKey ? 'no-key' : '?')}]: ${(err.message || '').slice(0, 120)}`);
      if (!err.noKey) {
        console.warn(`Model ${spec} failed (${err.status ?? '?'}): ${(err.message || '').slice(0, 120)}`);
      }
      if (!isRetriable(err)) throw err;
    }
  }
  throw new Error('All models in the chain failed:\n' + errors.join('\n'));
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

const SUPPORTED_LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese'];

function pickLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value) ? value : 'English';
}

function buildQuestionPrompt(text, history, language) {
  const asked = history.map((h, i) => `${i + 1}. ${h.question}`).join('\n') || '(none yet)';
  return `You are a ${language} reading-comprehension teacher for a student.

The student just read this text (in ${language}):
"""
${text}
"""

Previously asked questions (do NOT repeat these or ask very similar ones):
${asked}

Generate ONE new comprehension question about the text, written in ${language}. Vary the question type across the session — mix literal ("who/what/where/when"), inferential ("why"), action-focused ("what did X do"), and reflective ("how does X feel / what would happen if...") questions. Keep the wording clear and natural, suitable for a ${language} learner.

Respond ONLY as valid JSON in this exact shape:
{"question": "<the question in ${language}>"}`;
}

function buildFeedbackPrompt(text, question, answer, language) {
  return `You are an encouraging but accurate ${language} reading-comprehension teacher.

The student read this text (in ${language}):
"""
${text}
"""

You asked: "${question}"
The student answered: "${answer}"

Evaluate the answer based ONLY on the text. Decide if it is "correct", "partial", or "incorrect". Then write 1–3 sentences of warm feedback IN ${language}: confirm what they got right, gently correct mistakes, and if helpful, quote the relevant part of the text.

Respond ONLY as valid JSON in this exact shape:
{"verdict": "correct" | "partial" | "incorrect", "feedback": "<your feedback in ${language}>"}`;
}

app.post('/api/question', async (req, res) => {
  try {
    const { text, history = [], language } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a reading text of at least 20 characters.' });
    }
    const raw = await callLLM(buildQuestionPrompt(text, history, pickLanguage(language)));
    const parsed = extractJson(raw);
    if (!parsed.question) return res.status(502).json({ error: 'Model did not return a question.' });
    res.json({ question: parsed.question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function buildLookupPrompt(word, text, language) {
  return `You are a helpful ${language} vocabulary assistant for a language learner.

The student is reading this ${language} text (use it for context if relevant):
"""
${text}
"""

The word they want to understand: "${word}"

Explain the word briefly and clearly IN ${language}. If it is an inflected form (past tense, plural, conjugation, gender, comparative, etc.), give its base/dictionary form in ${language}. Provide a short ENGLISH image-search query that would return HELPFUL illustrations of the word (image search works best in English):
- For concrete nouns, use the English noun (e.g., for "chal" use "shawl").
- For verbs, suggest an English scene (e.g., for "sopló" use "person blowing air"; for "corrió" use "person running").
- For abstract words or function words where images would not help, use an empty string "".

Respond ONLY as valid JSON in this exact shape:
{
  "word": "<the word as given>",
  "base_form": "<base/dictionary form in ${language}; same as word if not inflected>",
  "part_of_speech": "<noun, verb, adjective, adverb, etc. — in ${language}>",
  "meaning": "<1-2 sentence clear definition in simple ${language}>",
  "note": "<short note in ${language} about inflection or context, or empty string>",
  "example": "<a short example sentence in ${language} using the word>",
  "image_query": "<English search query for images, or empty string>"
}`;
}

app.post('/api/lookup', async (req, res) => {
  try {
    const { word, text = '', language } = req.body || {};
    if (!word || typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ error: 'Missing word.' });
    }
    const clean = word.trim().slice(0, 60);
    const raw = await callLLM(buildLookupPrompt(clean, text, pickLanguage(language)));
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
    const { text, question, answer, language } = req.body || {};
    if (!text || !question || typeof answer !== 'string') {
      return res.status(400).json({ error: 'Missing text, question, or answer.' });
    }
    const raw = await callLLM(buildFeedbackPrompt(text, question, answer, pickLanguage(language)));
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
  const active = Object.entries(PROVIDERS).filter(([, p]) => p.key()).map(([n]) => n);
  console.log(`Providers with API keys: ${active.length ? active.join(', ') : '(none)'}`);
  console.log(`Model fallback chain (${MODEL_CHAIN.length}):`);
  MODEL_CHAIN.forEach((m, i) => {
    const { provider } = parseModel(m);
    const ok = PROVIDERS[provider]?.key() ? '✓' : '·';
    console.log(`  ${ok} ${i + 1}. ${m}`);
  });
  if (active.length === 0) {
    console.warn('WARNING: No API keys configured. Set at least one of GROQ_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY in .env');
  }
});
