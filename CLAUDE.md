# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run the Express server on `PORT` (default 3000)
- `npm run dev` — same, with `node --watch` for auto-restart
- No build step, no linter, no test suite. Frontend is plain HTML/CSS/JS served from `public/`.

Before running, copy `.env.example` to `.env` and set at least one of `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`. The server logs which providers are active at boot and warns if none are configured.

## Architecture

Three pieces, no framework on any of them:

- **[server.js](server.js)** — Express server that serves `public/` statically and exposes three JSON POST endpoints:
  - `/api/question` — generates a new comprehension question from `{ text, history, language }`
  - `/api/feedback` — grades an answer as `correct` / `partial` / `incorrect` with written feedback
  - `/api/lookup` — returns a vocabulary explanation (`base_form`, `part_of_speech`, `meaning`, `example`, `image_query`) for a word
- **[public/app.js](public/app.js)** — web frontend: PDF.js rendering, drag-drop file handling, word selection, API calls, i18n, theme toggle, and collapsible side panes. Uses no framework — DOM by `getElementById`, state in a single `state` object.
- **[extension/](extension/)** — Chrome MV3 extension that brings the same Q&A + lookup UX into a side panel against the active tab's page text (rather than a pasted text or PDF). Calls the same three backend endpoints.

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

### Chrome extension

Manifest V3 with a side panel ([extension/manifest.json](extension/manifest.json), [extension/sidepanel.html](extension/sidepanel.html)). Three moving parts:

- **[extension/background.js](extension/background.js)** — service worker. Single job: `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` so clicking the toolbar icon opens the panel.
- **[extension/content.js](extension/content.js)** — injected into every `http(s)` page (`run_at: document_idle`, guarded by `window.__readingTeacherContentLoaded` to dedupe). Two responsibilities: (1) replies to `{ type: 'get-page-text' }` with `innerText` from `<article>` → `<main>` → `<body>` (in that priority order) plus title/url; (2) on `mouseup` / `dblclick`, sends `{ type: 'word-selected', word }` to the panel after trimming non-letter punctuation and rejecting selections > 40 chars.
- **[extension/sidepanel.js](extension/sidepanel.js)** — the panel UI. Mirrors the structure of `public/app.js` (same `state` shape, same `TRANSLATIONS` keyed by language, same `applyUi()` pattern, same `lookupCache` Map) but pulls reading text from the active tab via `chrome.tabs.sendMessage(tabId, { type: 'get-page-text' })` and uses `chrome.storage.local` for prefs instead of `localStorage`. If the content script hasn't loaded (e.g. the tab existed before the extension), it falls back to `chrome.scripting.executeScript({ files: ['content.js'] })` and retries. Re-fetches page text on `chrome.tabs.onActivated` and on `onUpdated` when status is `complete`. Page text is sliced to 20000 chars before being sent to the LLM.

`API_BASE` is **hardcoded** at the top of [extension/sidepanel.js](extension/sidepanel.js) (currently a Vercel URL); update it there when redeploying the backend. The extension does not read `window.READING_TEACHER_API_BASE` — that mechanism is web-frontend only.

Translations in `sidepanel.js` are a **separate** dictionary from `public/app.js` (the panel has its own keys like `page_ready`, `no_page_text`, `reload_page` that the web app doesn't have). Keep them in sync only where the same key exists in both; do not assume the dictionaries are identical.
