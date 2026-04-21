const $ = (id) => document.getElementById(id);

(function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      btn.textContent = next === 'dark' ? 'Light mode' : 'Dark mode';
    });
  }
})();

const state = {
  text: '',
  currentQuestion: null,
  history: [],
  lookupCache: new Map(),
  pdfDoc: null,
  pdfName: ''
};

const els = {
  setup: $('setup'),
  practice: $('practice'),
  readingInput: $('reading-input'),
  startBtn: $('start-btn'),
  charCount: $('char-count'),
  readingDisplay: $('reading-display'),
  questionText: $('question-text'),
  answerInput: $('answer-input'),
  submitBtn: $('submit-btn'),
  nextBtn: $('next-btn'),
  resetBtn: $('reset-btn'),
  feedbackBox: $('feedback-box'),
  feedbackLabel: $('feedback-label'),
  feedbackText: $('feedback-text'),
  historyCount: $('history-count'),
  historyList: $('history-list'),
  errorBanner: $('error-banner'),
  lookupInput: $('lookup-input'),
  lookupBtn: $('lookup-btn'),
  lookupStatus: $('lookup-status'),
  lookupResult: $('lookup-result'),
  attachBtn: $('attach-btn'),
  fileInput: $('file-input'),
  fileStatus: $('file-status')
};

els.attachBtn.addEventListener('click', () => els.fileInput.click());
els.fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (file) handleFile(file);
  e.target.value = '';
});

['dragenter', 'dragover'].forEach((ev) => {
  els.readingInput.addEventListener(ev, (e) => {
    if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
    e.preventDefault();
    els.readingInput.classList.add('drag-over');
  });
});
['dragleave', 'drop'].forEach((ev) => {
  els.readingInput.addEventListener(ev, () => els.readingInput.classList.remove('drag-over'));
});
els.readingInput.addEventListener('drop', (e) => {
  const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (!file) return;
  e.preventDefault();
  handleFile(file);
});

async function handleFile(file) {
  const name = (file.name || '').toLowerCase();
  els.fileStatus.textContent = `Loading ${file.name}...`;
  try {
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      if (!window.pdfjsLib) throw new Error('PDF library failed to load.');
      const buf = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      state.pdfDoc = pdf;
      state.pdfName = file.name;
      els.readingInput.value = '';
      els.charCount.textContent = '0 characters';
      els.fileStatus.textContent = `PDF attached: ${file.name} (${pdf.numPages} pages)`;
    } else if (name.endsWith('.txt') || file.type.startsWith('text/')) {
      const text = (await file.text()).trim();
      if (!text) throw new Error('No text found in the file.');
      state.pdfDoc = null;
      state.pdfName = '';
      els.readingInput.value = text;
      els.charCount.textContent = `${text.length} characters`;
      els.fileStatus.textContent = `Loaded: ${file.name}`;
    } else {
      throw new Error('Unsupported file. Use .pdf or .txt.');
    }
  } catch (err) {
    state.pdfDoc = null;
    state.pdfName = '';
    els.fileStatus.textContent = `Error: ${err.message}`;
  }
}

els.readingInput.addEventListener('input', () => {
  els.charCount.textContent = `${els.readingInput.value.length} characters`;
});

els.startBtn.addEventListener('click', startPractice);
els.submitBtn.addEventListener('click', submitAnswer);
els.nextBtn.addEventListener('click', loadNextQuestion);
els.resetBtn.addEventListener('click', resetSession);

els.answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    if (!els.submitBtn.classList.contains('hidden')) submitAnswer();
    else if (!els.nextBtn.classList.contains('hidden')) loadNextQuestion();
  }
});

els.readingDisplay.addEventListener('mouseup', handleReadingSelection);
els.readingDisplay.addEventListener('dblclick', handleReadingSelection);

document.querySelectorAll('.pane-toggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePaneCollapse(btn.dataset.pane);
  });
});

document.querySelectorAll('.pane').forEach((pane) => {
  pane.addEventListener('click', () => {
    if (!pane.classList.contains('collapsed')) return;
    const btn = pane.querySelector('.pane-toggle');
    if (btn) togglePaneCollapse(btn.dataset.pane);
  });
});

function togglePaneCollapse(key) {
  const paneId = key === 'search' ? 'pane-search' : key === 'qa' ? 'pane-qa' : null;
  if (!paneId) return;
  const pane = document.getElementById(paneId);
  const grid = document.querySelector('.practice-grid');
  const collapsed = pane.classList.toggle('collapsed');
  grid.classList.toggle(`collapsed-${key}`, collapsed);
  const btn = pane.querySelector('.pane-toggle');
  if (btn) {
    btn.textContent = collapsed ? '+' : '−';
    btn.title = collapsed ? 'Expand' : 'Minimize';
  }
}
els.lookupBtn.addEventListener('click', () => {
  const w = els.lookupInput.value.trim();
  if (w) lookupWord(w);
});
els.lookupInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const w = els.lookupInput.value.trim();
    if (w) lookupWord(w);
  }
});

function handleReadingSelection() {
  const sel = window.getSelection();
  if (!sel) return;
  const raw = sel.toString().trim();
  if (!raw) return;
  const cleaned = raw.replace(/^[^\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+$/gu, '');
  if (!cleaned) return;
  if (cleaned.length > 40) return;
  lookupWord(cleaned);
}

async function lookupWord(word) {
  const key = word.toLowerCase();
  els.lookupInput.value = word;
  els.lookupStatus.textContent = '';

  if (state.lookupCache.has(key)) {
    renderLookup(state.lookupCache.get(key));
    return;
  }

  els.lookupResult.classList.add('hidden');
  els.lookupStatus.textContent = `Looking up "${word}"...`;

  try {
    const data = await postJson('/api/lookup', { word, text: state.text });
    state.lookupCache.set(key, data);
    renderLookup(data);
  } catch (err) {
    els.lookupStatus.textContent = `Lookup failed: ${err.message}`;
  }
}

function renderLookup(data) {
  els.lookupStatus.textContent = '';
  els.lookupResult.classList.remove('hidden');
  const headWord = data.base_form && data.base_form.toLowerCase() !== data.word.toLowerCase()
    ? `${escapeHtml(data.word)} <span style="color:var(--muted);font-weight:400">→ ${escapeHtml(data.base_form)}</span>`
    : escapeHtml(data.word);

  els.lookupResult.innerHTML = `
    <p class="word-head">${headWord}</p>
    <p class="word-pos">${escapeHtml(data.part_of_speech || '')}</p>
    <p class="word-meaning">${escapeHtml(data.meaning || '')}</p>
    ${data.note ? `<div class="word-note">${escapeHtml(data.note)}</div>` : ''}
    ${data.example ? `<p class="word-example">"${escapeHtml(data.example)}"</p>` : ''}
    <div id="lookup-images-container"></div>
  `;

  const imgContainer = document.getElementById('lookup-images-container');
  if (data.image_query) {
    imgContainer.innerHTML = '<p class="lookup-images-empty">Loading images...</p>';
    fetchImages(data.image_query).then((imgs) => renderImages(imgContainer, imgs));
  } else {
    imgContainer.innerHTML = '<p class="lookup-images-empty">No images for this word.</p>';
  }
}

function renderImages(container, images) {
  if (!images.length) {
    container.innerHTML = '<p class="lookup-images-empty">No images found.</p>';
    return;
  }
  container.innerHTML = `<div class="lookup-images">${images.map(img => `
    <a href="${escapeHtml(img.full)}" target="_blank" rel="noopener" title="${escapeHtml(img.title)}">
      <img src="${escapeHtml(img.thumb)}" alt="${escapeHtml(img.title)}" loading="lazy" />
    </a>
  `).join('')}</div>`;
}

async function fetchImages(query) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=300&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return [];
    return Object.values(pages)
      .map(p => ({
        thumb: p.imageinfo?.[0]?.thumburl,
        full: p.imageinfo?.[0]?.url || p.imageinfo?.[0]?.thumburl,
        title: (p.title || '').replace(/^File:/, '')
      }))
      .filter(p => p.thumb && /\.(jpe?g|png|gif|webp|svg)$/i.test(p.thumb))
      .slice(0, 4);
  } catch {
    return [];
  }
}

function showError(msg) {
  els.errorBanner.textContent = msg;
  els.errorBanner.classList.remove('hidden');
}

function clearError() {
  els.errorBanner.classList.add('hidden');
  els.errorBanner.textContent = '';
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function startPractice() {
  clearError();
  state.history = [];

  if (state.pdfDoc) {
    els.readingDisplay.textContent = 'Rendering PDF...';
    els.setup.classList.add('hidden');
    els.practice.classList.remove('hidden');
    try {
      const extracted = await extractPdfText(state.pdfDoc);
      state.text = extracted.trim();
      if (state.text.length < 20) {
        showError('This PDF has no selectable text (maybe a scanned image). Word lookup and questions need real text.');
        resetSession();
        return;
      }
      await renderPdfPages(state.pdfDoc, els.readingDisplay);
    } catch (err) {
      showError(`Failed to render PDF: ${err.message}`);
      return;
    }
  } else {
    const text = els.readingInput.value.trim();
    if (text.length < 20) {
      showError('Please paste a longer reading (at least 20 characters) or attach a PDF.');
      return;
    }
    state.text = text;
    els.readingDisplay.textContent = text;
    els.readingDisplay.classList.remove('pdf-mode');
    els.setup.classList.add('hidden');
    els.practice.classList.remove('hidden');
  }

  await loadNextQuestion();
}

async function extractPdfText(pdf) {
  const parts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((it) => ('str' in it ? it.str : '')).join(' '));
  }
  return parts.join('\n\n');
}

let pdfRenderId = 0;
let lastRenderedWidth = 0;

async function renderPdfPages(pdf, container) {
  const myId = ++pdfRenderId;
  container.innerHTML = '';
  container.classList.add('pdf-mode');

  const availWidth = Math.max(240, container.clientWidth - 32);
  const firstPage = await pdf.getPage(1);
  const baseViewport = firstPage.getViewport({ scale: 1 });
  const scale = Math.max(0.5, Math.min(2.5, availWidth / baseViewport.width));
  lastRenderedWidth = container.clientWidth;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    if (myId !== pdfRenderId) return;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const pageWrap = document.createElement('div');
    pageWrap.className = 'pdf-page';
    pageWrap.style.width = `${viewport.width}px`;
    pageWrap.style.height = `${viewport.height}px`;

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    pageWrap.appendChild(canvas);

    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    textLayerDiv.style.width = `${viewport.width}px`;
    textLayerDiv.style.height = `${viewport.height}px`;
    pageWrap.appendChild(textLayerDiv);

    container.appendChild(pageWrap);

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    if (myId !== pdfRenderId) return;

    const textContent = await page.getTextContent();
    const task = window.pdfjsLib.renderTextLayer({
      textContentSource: textContent,
      container: textLayerDiv,
      viewport,
      textDivs: []
    });
    if (task && task.promise) await task.promise;
  }
}

let pdfResizeTimer = null;
const pdfResizeObserver = new ResizeObserver(() => {
  if (!state.pdfDoc) return;
  const w = els.readingDisplay.clientWidth;
  if (Math.abs(w - lastRenderedWidth) < 20) return;
  clearTimeout(pdfResizeTimer);
  pdfResizeTimer = setTimeout(() => {
    if (state.pdfDoc) renderPdfPages(state.pdfDoc, els.readingDisplay);
  }, 200);
});
pdfResizeObserver.observe(els.readingDisplay);

async function loadNextQuestion() {
  clearError();
  els.questionText.textContent = 'Loading a new question...';
  els.answerInput.value = '';
  els.answerInput.disabled = false;
  els.feedbackBox.classList.add('hidden');
  els.submitBtn.classList.remove('hidden');
  els.nextBtn.classList.add('hidden');
  els.submitBtn.disabled = true;

  try {
    const data = await postJson('/api/question', {
      text: state.text,
      history: state.history
    });
    state.currentQuestion = data.question;
    els.questionText.textContent = data.question;
    els.submitBtn.disabled = false;
    els.answerInput.focus();
  } catch (err) {
    showError(err.message);
    els.questionText.textContent = '(failed to load question)';
  }
}

async function submitAnswer() {
  clearError();
  const answer = els.answerInput.value.trim();
  if (!answer) {
    showError('Please write an answer before submitting.');
    return;
  }
  els.submitBtn.disabled = true;
  els.answerInput.disabled = true;

  try {
    const data = await postJson('/api/feedback', {
      text: state.text,
      question: state.currentQuestion,
      answer
    });
    showFeedback(data.verdict, data.feedback);
    state.history.push({
      question: state.currentQuestion,
      answer,
      verdict: data.verdict,
      feedback: data.feedback
    });
    updateHistory();
    els.submitBtn.classList.add('hidden');
    els.nextBtn.classList.remove('hidden');
    els.nextBtn.focus();
  } catch (err) {
    showError(err.message);
    els.submitBtn.disabled = false;
    els.answerInput.disabled = false;
  }
}

function showFeedback(verdict, feedback) {
  els.feedbackBox.classList.remove('hidden', 'correct', 'partial', 'incorrect');
  els.feedbackBox.classList.add(verdict);
  const labels = { correct: 'Correct', partial: 'Partially correct', incorrect: 'Not quite' };
  els.feedbackLabel.textContent = labels[verdict] || 'Feedback';
  els.feedbackText.textContent = feedback;
}

function updateHistory() {
  els.historyCount.textContent = state.history.length;
  els.historyList.innerHTML = '';
  state.history.forEach((h) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>Q:</strong> ${escapeHtml(h.question)}<br><strong>You:</strong> ${escapeHtml(h.answer)}<br><em>${escapeHtml(h.verdict)} — ${escapeHtml(h.feedback)}</em>`;
    els.historyList.appendChild(li);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function resetSession() {
  state.text = '';
  state.currentQuestion = null;
  state.history = [];
  state.pdfDoc = null;
  state.pdfName = '';
  els.practice.classList.add('hidden');
  els.setup.classList.remove('hidden');
  els.readingDisplay.classList.remove('pdf-mode');
  els.readingDisplay.innerHTML = '';
  els.fileStatus.textContent = '';
  els.readingInput.focus();
  updateHistory();
}
