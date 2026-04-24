# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run the Express server on `PORT` (default 3000)
- `npm run dev` — same, with `node --watch` for auto-restart
- No build step, no linter, no test suite. Frontend is plain HTML/CSS/JS served from `public/`.

Before running, copy `.env.example` to `.env` and set at least one of `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`. The server logs which providers are active at boot and warns if none are configured.

## Architecture

Two pieces, no framework on either side:

- **[server.js](server.js)** — Express server that serves `public/` statically and exposes three JSON POST endpoints:
  - `/api/question` — generates a new comprehension question from `{ text, history, language }`
  - `/api/feedback` — grades an answer as `correct` / `partial` / `incorrect` with written feedback
  - `/api/lookup` — returns a vocabulary explanation (`base_form`, `part_of_speech`, `meaning`, `example`, `image_query`) for a word
- **[public/app.js](public/app.js)** — all frontend logic: PDF.js rendering, drag-drop file handling, word selection, API calls, i18n, theme toggle, and collapsible side panes. Uses no framework — DOM by `getElementById`, state in a single `state` object.

### LLM provider dispatch (the load-bearing piece of the server)

`server.js` defines a **fallback chain** of `provider:model` specs (`MODEL_CHAIN`), built from `LLM_MODELS` env var or a hardcoded `DEFAULT_CHAIN`. Each API request funnels through `callLLM(prompt)`, which:

1. Starts at `currentModelIdx` (remembered across requests) and walks the chain.
2. For each spec, calls `callModel` which dispatches to `callOpenAICompat` (Groq/OpenAI/OpenRouter — all share the OpenAI chat-completions shape) or `callGemini` (Google's different request/response format).
3. On failure, checks `isRetriable` (no API key, 429/500/502/503/404, or error message matching rate-limit/quota/decommissioned/not-found patterns) and moves to the next model.
4. When a non-zero-index model succeeds, updates `currentModelIdx` to stick with it — avoids re-hitting known-throttled providers on every request.

Providers are configured in the `PROVIDERS` map by `type` (`openai` or `gemini`). Adding a new OpenAI-compatible provider is one entry; adding a new shape means a new `callX` function and a new `type`.

### Prompts and language handling

All three endpoints accept a `language` field (validated against `SUPPORTED_LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese']`, defaulting to English). The prompt builders (`buildQuestionPrompt`, `buildFeedbackPrompt`, `buildLookupPrompt`) interpolate the language name directly into the system instructions so the model responds in-language. Responses are requested as JSON via `response_format: { type: 'json_object' }` (OpenAI-compat) or `responseMimeType: 'application/json'` (Gemini), with `extractJson` as a regex fallback if the model wraps the JSON in prose.

### Frontend i18n

`TRANSLATIONS` in `public/app.js` is a dictionary keyed by language name, then by key. Values are either strings or functions (for interpolated strings like `char_count(n)`). `t(key, ...args)` falls back to English if a key is missing. DOM elements carry `data-i18n` / `data-i18n-placeholder` attributes and are re-translated by `applyUi()` whenever the language changes. The selected language is persisted in `localStorage` and sent on every API call — keep new user-facing strings in all four language dictionaries.

### PDF rendering

When a PDF is dropped or attached, `state.pdfDoc` holds the parsed `pdfjsLib` document. On "Start practicing":
- `extractPdfText` concatenates `getTextContent` from every page → sent to the LLM as `state.text`.
- `renderPdfPages` renders each page as a canvas + an overlaid `textLayer` div, so the user can select words visually while the LLM sees the extracted text. A `ResizeObserver` re-renders on width changes (debounced 200ms). `pdfRenderId` is bumped on each call so an in-flight render bails when a new one starts.

Images for word lookup are fetched **client-side** from Wikimedia Commons (`commons.wikimedia.org/w/api.php`) using the LLM-generated English `image_query` — the server never touches the images API.

### Split deployment (GitHub Pages + Render)

The frontend supports pointing at a remote backend by setting `window.READING_TEACHER_API_BASE` in [public/index.html](public/index.html) — `postJson` prepends it to every API path. Empty string = same origin (local dev). CORS is open by default; set `ALLOWED_ORIGIN` env var on the backend to lock it down to the Pages origin. See README for the full deploy flow.
