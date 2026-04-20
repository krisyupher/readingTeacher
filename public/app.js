const $ = (id) => document.getElementById(id);

const state = {
  text: '',
  currentQuestion: null,
  history: [],
  lookupCache: new Map()
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
  lookupResult: $('lookup-result')
};

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
  const text = els.readingInput.value.trim();
  if (text.length < 20) {
    showError('Please paste a longer reading (at least 20 characters).');
    return;
  }
  state.text = text;
  state.history = [];
  els.readingDisplay.textContent = text;
  els.setup.classList.add('hidden');
  els.practice.classList.remove('hidden');
  await loadNextQuestion();
}

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
  els.practice.classList.add('hidden');
  els.setup.classList.remove('hidden');
  els.readingInput.focus();
  updateHistory();
}
