# Reading Teacher

A small web app that helps English learners practice reading comprehension. Paste a text or drop a PDF, and an LLM asks comprehension questions (who / what / why / action / reflection) and grades your answers. A side panel looks up unfamiliar words — meaning, part of speech, base form, and images from Wikimedia Commons.

## Features

- Paste text or drop a `.pdf` / `.txt` file (PDFs render with their original layout; you can select words directly on the page).
- LLM-generated comprehension questions, one at a time, with correct / partial / incorrect feedback.
- Word lookup panel with definition, example, and images.
- Minimizable side panels, dark mode, and keyboard-friendly layout.
- Multi-provider LLM fallback chain (Groq → Gemini → OpenRouter → OpenAI) — swaps automatically when a provider is rate-limited.

## Stack

- Node.js 18+ · Express
- Vanilla HTML / CSS / JS (no build step)
- PDF.js for PDF rendering
- Wikimedia Commons API for word images

## Run locally

```bash
git clone <your-repo-url>
cd ReadingTeacher
npm install
cp .env.example .env
# edit .env and add at least one API key (see below)
npm start
```

Open `http://localhost:3000`.

## API keys

You only need **one** of the following. Unset keys are skipped automatically.

| Provider   | Tier        | Get a key                                           |
| ---------- | ----------- | --------------------------------------------------- |
| Groq       | Free (fast) | https://console.groq.com/keys                       |
| Gemini     | Free        | https://aistudio.google.com/app/apikey              |
| OpenRouter | Free models | https://openrouter.ai/keys                          |
| OpenAI     | Paid        | https://platform.openai.com/api-keys                |

### Custom model chain

Set `LLM_MODELS` in `.env` to a comma-separated list of `provider:model` entries. The server tries them in order and sticks with the first one that works:

```
LLM_MODELS=groq:llama-3.3-70b-versatile,gemini:gemini-2.0-flash,openrouter:qwen/qwen-2.5-72b-instruct:free
```

Leave it unset to use the built-in default chain (defined in [server.js](server.js)).

## Deploy: GitHub Pages (frontend) + Render (backend)

GitHub Pages is static-only, so the Node.js backend has to live elsewhere. Render's free web service tier works well.

### 1. Deploy the backend to Render

1. Push this repo to GitHub.
2. At https://render.com, **New → Web Service** → connect your GitHub repo.
3. Settings:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: add `GROQ_API_KEY` (and any others you use). Optionally add `ALLOWED_ORIGIN=https://<your-user>.github.io` to restrict CORS.
4. Deploy. Copy the service URL (e.g. `https://reading-teacher-api.onrender.com`).

> **Cold start:** Render's free tier sleeps after ~15 min of inactivity, so the first request after idle takes ~30 seconds.

### 2. Point the frontend at the backend

Edit [public/index.html](public/index.html) and set:

```html
<script>
  window.READING_TEACHER_API_BASE = 'https://reading-teacher-api.onrender.com';
</script>
```

Commit and push.

### 3. Enable GitHub Pages

In your repo → **Settings → Pages**:

- Source: Deploy from a branch
- Branch: `main` · folder: `/public`

Save. GitHub gives you a URL like `https://<your-user>.github.io/ReadingTeacher/`. Open it — questions, feedback, and word lookup should all route to your Render backend.

## Project layout

```
server.js          Express server + LLM provider dispatch
public/
  index.html       Layout + PDF.js loader + API base config
  app.js           Frontend logic (PDF rendering, lookup, Q&A)
  style.css        Themes (light/dark) and grid layout
.env.example       Copy to .env and fill in
```
