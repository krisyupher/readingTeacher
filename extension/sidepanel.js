// ============================================================================
// CONFIG: point this at your backend.
//   Local dev: 'http://localhost:3000'
//   Render:    'https://reading-teacher-api.onrender.com'
// ============================================================================
const API_BASE = 'https://reading-teacher.vercel.app';

const $ = (id) => document.getElementById(id);

const LANG_CODES = { English: 'en', Spanish: 'es', French: 'fr', Portuguese: 'pt' };
const LANG_BCP47 = { English: 'en-US', Spanish: 'es-ES', French: 'fr-FR', Portuguese: 'pt-BR' };

const TRANSLATIONS = {
  English: {
    app_title: 'Reading Teacher',
    dark_mode: 'Dark',
    light_mode: 'Light',
    word_lookup: 'Word lookup',
    lookup_hint: 'Highlight a word on the page to look it up.',
    lookup_placeholder: 'Or type a word...',
    lookup_btn: 'Look up',
    practice: 'Practice',
    reload_page: 'Reload page',
    start_btn: 'Start practicing',
    question_label: 'Question',
    answer_placeholder: 'Type your answer...',
    submit_btn: 'Submit answer',
    next_btn: 'Next question',
    feedback_label: 'Feedback',
    history: 'History',
    looking_up: (w) => `Looking up "${w}"...`,
    lookup_failed: (msg) => `Lookup failed: ${msg}`,
    loading_images: 'Loading images...',
    no_images_found: 'No images found.',
    no_images_for_word: 'No images for this word.',
    loading_question: 'Loading a new question...',
    failed_question: '(failed to load question)',
    need_answer: 'Please write an answer before submitting.',
    short_reading: 'This page has too little text. Try another page.',
    page_ready: (title, n) => `${title} — ${n} characters`,
    no_page_text: 'Could not read text from this page. Try reloading.',
    verdict_correct: 'Correct',
    verdict_partial: 'Partially correct',
    verdict_incorrect: 'Not quite',
    history_q: 'Q:',
    history_you: 'You:',
    listen_btn: '🔊 Listen',
    stop_btn: '⏹ Stop',
    listen_title: 'Read the page text aloud',
    speak_word: 'Pronounce this word',
    tts_unsupported: 'Your browser does not support text-to-speech.'
  },
  Spanish: {
    app_title: 'Profesor de Lectura',
    dark_mode: 'Oscuro',
    light_mode: 'Claro',
    word_lookup: 'Buscar palabra',
    lookup_hint: 'Selecciona una palabra en la página para buscarla.',
    lookup_placeholder: 'O escribe una palabra...',
    lookup_btn: 'Buscar',
    practice: 'Práctica',
    reload_page: 'Recargar página',
    start_btn: 'Empezar a practicar',
    question_label: 'Pregunta',
    answer_placeholder: 'Escribe tu respuesta...',
    submit_btn: 'Enviar respuesta',
    next_btn: 'Siguiente pregunta',
    feedback_label: 'Comentario',
    history: 'Historial',
    looking_up: (w) => `Buscando "${w}"...`,
    lookup_failed: (msg) => `Error en la búsqueda: ${msg}`,
    loading_images: 'Cargando imágenes...',
    no_images_found: 'No se encontraron imágenes.',
    no_images_for_word: 'No hay imágenes para esta palabra.',
    loading_question: 'Cargando una nueva pregunta...',
    failed_question: '(error al cargar la pregunta)',
    need_answer: 'Escribe una respuesta antes de enviar.',
    short_reading: 'Esta página tiene muy poco texto. Prueba con otra.',
    page_ready: (title, n) => `${title} — ${n} caracteres`,
    no_page_text: 'No se pudo leer el texto de esta página. Recárgala.',
    verdict_correct: 'Correcto',
    verdict_partial: 'Parcialmente correcto',
    verdict_incorrect: 'No del todo',
    history_q: 'P:',
    history_you: 'Tú:',
    listen_btn: '🔊 Escuchar',
    stop_btn: '⏹ Detener',
    listen_title: 'Leer el texto de la página en voz alta',
    speak_word: 'Pronunciar esta palabra',
    tts_unsupported: 'Tu navegador no admite la lectura en voz alta.'
  },
  French: {
    app_title: 'Professeur de Lecture',
    dark_mode: 'Sombre',
    light_mode: 'Clair',
    word_lookup: 'Recherche de mot',
    lookup_hint: 'Sélectionnez un mot sur la page pour le rechercher.',
    lookup_placeholder: 'Ou tapez un mot...',
    lookup_btn: 'Rechercher',
    practice: 'Pratique',
    reload_page: 'Recharger la page',
    start_btn: 'Commencer à pratiquer',
    question_label: 'Question',
    answer_placeholder: 'Tapez votre réponse...',
    submit_btn: 'Envoyer la réponse',
    next_btn: 'Question suivante',
    feedback_label: 'Commentaire',
    history: 'Historique',
    looking_up: (w) => `Recherche de « ${w} »...`,
    lookup_failed: (msg) => `Échec de la recherche : ${msg}`,
    loading_images: 'Chargement des images...',
    no_images_found: 'Aucune image trouvée.',
    no_images_for_word: "Pas d'images pour ce mot.",
    loading_question: 'Chargement d’une nouvelle question...',
    failed_question: '(échec du chargement)',
    need_answer: "Écrivez une réponse avant d'envoyer.",
    short_reading: 'Cette page a trop peu de texte. Essayez-en une autre.',
    page_ready: (title, n) => `${title} — ${n} caractères`,
    no_page_text: 'Impossible de lire le texte de cette page. Rechargez-la.',
    verdict_correct: 'Correct',
    verdict_partial: 'Partiellement correct',
    verdict_incorrect: 'Pas tout à fait',
    history_q: 'Q :',
    history_you: 'Toi :',
    listen_btn: '🔊 Écouter',
    stop_btn: '⏹ Arrêter',
    listen_title: 'Lire le texte de la page à voix haute',
    speak_word: 'Prononcer ce mot',
    tts_unsupported: 'Votre navigateur ne prend pas en charge la synthèse vocale.'
  },
  Portuguese: {
    app_title: 'Professor de Leitura',
    dark_mode: 'Escuro',
    light_mode: 'Claro',
    word_lookup: 'Buscar palavra',
    lookup_hint: 'Selecione uma palavra na página para buscá-la.',
    lookup_placeholder: 'Ou digite uma palavra...',
    lookup_btn: 'Buscar',
    practice: 'Prática',
    reload_page: 'Recarregar página',
    start_btn: 'Começar a praticar',
    question_label: 'Pergunta',
    answer_placeholder: 'Digite sua resposta...',
    submit_btn: 'Enviar resposta',
    next_btn: 'Próxima pergunta',
    feedback_label: 'Comentário',
    history: 'Histórico',
    looking_up: (w) => `Buscando "${w}"...`,
    lookup_failed: (msg) => `Falha na busca: ${msg}`,
    loading_images: 'Carregando imagens...',
    no_images_found: 'Nenhuma imagem encontrada.',
    no_images_for_word: 'Sem imagens para esta palavra.',
    loading_question: 'Carregando uma nova pergunta...',
    failed_question: '(falha ao carregar)',
    need_answer: 'Escreva uma resposta antes de enviar.',
    short_reading: 'Esta página tem pouco texto. Tente outra.',
    page_ready: (title, n) => `${title} — ${n} caracteres`,
    no_page_text: 'Não foi possível ler o texto desta página. Recarregue-a.',
    verdict_correct: 'Correto',
    verdict_partial: 'Parcialmente correto',
    verdict_incorrect: 'Não exatamente',
    history_q: 'P:',
    history_you: 'Você:',
    listen_btn: '🔊 Ouvir',
    stop_btn: '⏹ Parar',
    listen_title: 'Ler o texto da página em voz alta',
    speak_word: 'Pronunciar esta palavra',
    tts_unsupported: 'Seu navegador não suporta leitura em voz alta.'
  }
};

function t(key, ...args) {
  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.English;
  const v = dict[key] ?? TRANSLATIONS.English[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

const state = {
  text: '',
  pageTitle: '',
  pageUrl: '',
  currentQuestion: null,
  history: [],
  lookupCache: new Map(),
  language: 'English',
  theme: 'light'
};

const els = {
  readingDisplay: null,
  questionText: $('question-text'),
  answerInput: $('answer-input'),
  submitBtn: $('submit-btn'),
  nextBtn: $('next-btn'),
  startBtn: $('start-btn'),
  reloadBtn: $('reload-page-btn'),
  qaArea: $('qa-area'),
  pageInfo: $('page-info'),
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
  languageSelect: $('language-select'),
  themeToggle: $('theme-toggle'),
  listenBtn: $('listen-btn')
};

const ttsSupported = 'speechSynthesis' in window;
let ttsActive = false;
let ttsQueue = [];

function chunkText(text, maxLen = 200) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];
  const chunks = [];
  let rest = cleaned;
  while (rest.length > maxLen) {
    let split = -1;
    for (const ender of ['. ', '! ', '? ', '; ', '。', '！', '？']) {
      const i = rest.lastIndexOf(ender, maxLen);
      if (i > split) split = i + ender.length;
    }
    if (split <= 0) split = rest.lastIndexOf(' ', maxLen);
    if (split <= 0) split = maxLen;
    chunks.push(rest.slice(0, split).trim());
    rest = rest.slice(split).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}

function updateListenBtn() {
  if (!els.listenBtn) return;
  els.listenBtn.textContent = ttsActive ? t('stop_btn') : t('listen_btn');
  els.listenBtn.title = t('listen_title');
  els.listenBtn.classList.toggle('speaking', ttsActive);
}

function stopSpeaking() {
  ttsQueue = [];
  ttsActive = false;
  if (ttsSupported) window.speechSynthesis.cancel();
  updateListenBtn();
}

function speak(text, language) {
  if (!ttsSupported) {
    showError(t('tts_unsupported'));
    return false;
  }
  const chunks = chunkText(text);
  if (!chunks.length) return false;
  window.speechSynthesis.cancel();
  ttsQueue = chunks.slice();
  ttsActive = true;
  const lang = LANG_BCP47[language] || 'en-US';
  updateListenBtn();
  const next = () => {
    if (!ttsActive || ttsQueue.length === 0) {
      ttsActive = false;
      updateListenBtn();
      return;
    }
    const u = new SpeechSynthesisUtterance(ttsQueue.shift());
    u.lang = lang;
    u.rate = 0.95;
    u.onend = next;
    u.onerror = next;
    window.speechSynthesis.speak(u);
  };
  next();
  return true;
}

if (!ttsSupported && els.listenBtn) {
  els.listenBtn.classList.add('hidden');
} else if (els.listenBtn) {
  els.listenBtn.addEventListener('click', () => {
    if (ttsActive) stopSpeaking();
    else if (state.text) speak(state.text, state.language);
  });
}

async function loadPrefs() {
  const { language, theme } = await chrome.storage.local.get(['language', 'theme']);
  state.language = language || 'English';
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  state.theme = theme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', state.theme);
  els.languageSelect.value = state.language;
}

function savePref(key, value) {
  chrome.storage.local.set({ [key]: value });
}

function applyUi() {
  document.title = t('app_title');
  document.documentElement.lang = LANG_CODES[state.language] || 'en';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  els.answerInput.placeholder = t('answer_placeholder');
  els.themeToggle.textContent = state.theme === 'dark' ? t('light_mode') : t('dark_mode');

  updateListenBtn();
  document.querySelectorAll('.speak-word').forEach((b) => (b.title = t('speak_word')));
}

els.languageSelect.addEventListener('change', () => {
  state.language = els.languageSelect.value;
  savePref('language', state.language);
  state.lookupCache.clear();
  stopSpeaking();
  applyUi();
});

els.themeToggle.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  savePref('theme', state.theme);
  applyUi();
});

document.querySelectorAll('.pane-toggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const pane = btn.closest('.pane');
    const collapsed = pane.classList.toggle('collapsed');
    btn.textContent = collapsed ? '+' : '−';
  });
});

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

els.startBtn.addEventListener('click', startPractice);
els.submitBtn.addEventListener('click', submitAnswer);
els.nextBtn.addEventListener('click', loadNextQuestion);
els.reloadBtn.addEventListener('click', loadPageText);

els.answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    if (!els.submitBtn.classList.contains('hidden')) submitAnswer();
    else if (!els.nextBtn.classList.contains('hidden')) loadNextQuestion();
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'word-selected' && msg.word) {
    lookupWord(msg.word);
  }
});

chrome.tabs.onActivated.addListener(() => loadPageText());
chrome.tabs.onUpdated.addListener((_id, info, tab) => {
  if (info.status === 'complete' && tab.active) loadPageText();
});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function requestPageText(tabId) {
  try {
    return await chrome.tabs.sendMessage(tabId, { type: 'get-page-text' });
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      return await chrome.tabs.sendMessage(tabId, { type: 'get-page-text' });
    } catch {
      return null;
    }
  }
}

async function loadPageText() {
  clearError();
  stopSpeaking();
  resetQa();
  els.pageInfo.textContent = '…';
  const tab = await getActiveTab();
  if (!tab?.id || !/^https?:/.test(tab.url || '')) {
    els.pageInfo.textContent = t('no_page_text');
    els.startBtn.classList.add('hidden');
    return;
  }

  const resp = await requestPageText(tab.id);
  if (!resp?.text || resp.text.length < 40) {
    els.pageInfo.textContent = t('no_page_text');
    els.startBtn.classList.add('hidden');
    return;
  }

  state.text = resp.text.slice(0, 20000);
  state.pageTitle = resp.title || tab.title || '';
  state.pageUrl = resp.url || tab.url || '';
  els.pageInfo.textContent = t('page_ready', state.pageTitle.slice(0, 60), state.text.length);
  els.startBtn.classList.remove('hidden');
  els.qaArea.classList.add('hidden');
}

function resetQa() {
  state.currentQuestion = null;
  state.history = [];
  els.qaArea.classList.add('hidden');
  els.feedbackBox.classList.add('hidden');
  els.submitBtn.classList.remove('hidden');
  els.nextBtn.classList.add('hidden');
  els.answerInput.value = '';
  updateHistory();
}

async function startPractice() {
  clearError();
  if (!state.text || state.text.length < 20) {
    showError(t('short_reading'));
    return;
  }
  state.history = [];
  updateHistory();
  els.startBtn.classList.add('hidden');
  els.qaArea.classList.remove('hidden');
  await loadNextQuestion();
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
  els.lookupStatus.textContent = t('looking_up', word);

  try {
    const data = await postJson('/api/lookup', {
      word,
      text: state.text,
      language: state.language
    });
    state.lookupCache.set(key, data);
    renderLookup(data);
  } catch (err) {
    els.lookupStatus.textContent = t('lookup_failed', err.message);
  }
}

function renderLookup(data) {
  els.lookupStatus.textContent = '';
  els.lookupResult.classList.remove('hidden');
  const headWord =
    data.base_form && data.base_form.toLowerCase() !== data.word.toLowerCase()
      ? `${escapeHtml(data.word)} <span style="color:var(--muted);font-weight:400">→ ${escapeHtml(data.base_form)}</span>`
      : escapeHtml(data.word);
  const speakTarget = data.base_form || data.word;
  const speakBtn = ttsSupported
    ? `<button type="button" class="speak-word" data-speak="${escapeHtml(speakTarget)}" title="${escapeHtml(t('speak_word'))}" aria-label="${escapeHtml(t('speak_word'))}">🔊</button>`
    : '';

  els.lookupResult.innerHTML = `
    <p class="word-head">${headWord} ${speakBtn}</p>
    <p class="word-pos">${escapeHtml(data.part_of_speech || '')}</p>
    <p class="word-meaning">${escapeHtml(data.meaning || '')}</p>
    ${data.note ? `<div class="word-note">${escapeHtml(data.note)}</div>` : ''}
    ${data.example ? `<p class="word-example">"${escapeHtml(data.example)}"</p>` : ''}
    <div id="lookup-images-container"></div>
  `;
  const sb = els.lookupResult.querySelector('.speak-word');
  if (sb) sb.addEventListener('click', () => speak(sb.dataset.speak, state.language));

  const imgContainer = document.getElementById('lookup-images-container');
  if (data.image_query) {
    imgContainer.innerHTML = `<p class="lookup-images-empty">${escapeHtml(t('loading_images'))}</p>`;
    fetchImages(data.image_query).then((imgs) => renderImages(imgContainer, imgs));
  } else {
    imgContainer.innerHTML = `<p class="lookup-images-empty">${escapeHtml(t('no_images_for_word'))}</p>`;
  }
}

function renderImages(container, images) {
  if (!images.length) {
    container.innerHTML = `<p class="lookup-images-empty">${escapeHtml(t('no_images_found'))}</p>`;
    return;
  }
  container.innerHTML = `<div class="lookup-images">${images
    .map(
      (img) => `
    <a href="${escapeHtml(img.full)}" target="_blank" rel="noopener" title="${escapeHtml(img.title)}">
      <img src="${escapeHtml(img.thumb)}" alt="${escapeHtml(img.title)}" loading="lazy" />
    </a>
  `
    )
    .join('')}</div>`;
}

async function fetchImages(query) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=300&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return [];
    return Object.values(pages)
      .map((p) => ({
        thumb: p.imageinfo?.[0]?.thumburl,
        full: p.imageinfo?.[0]?.url || p.imageinfo?.[0]?.thumburl,
        title: (p.title || '').replace(/^File:/, '')
      }))
      .filter((p) => p.thumb && /\.(jpe?g|png|gif|webp|svg)$/i.test(p.thumb))
      .slice(0, 4);
  } catch {
    return [];
  }
}

async function postJson(url, body) {
  const res = await fetch(API_BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

async function loadNextQuestion() {
  clearError();
  els.questionText.textContent = t('loading_question');
  els.answerInput.value = '';
  els.answerInput.disabled = false;
  els.feedbackBox.classList.add('hidden');
  els.submitBtn.classList.remove('hidden');
  els.nextBtn.classList.add('hidden');
  els.submitBtn.disabled = true;

  try {
    const data = await postJson('/api/question', {
      text: state.text,
      history: state.history,
      language: state.language
    });
    state.currentQuestion = data.question;
    els.questionText.textContent = data.question;
    els.submitBtn.disabled = false;
    els.answerInput.focus();
  } catch (err) {
    showError(err.message);
    els.questionText.textContent = t('failed_question');
  }
}

async function submitAnswer() {
  clearError();
  const answer = els.answerInput.value.trim();
  if (!answer) {
    showError(t('need_answer'));
    return;
  }
  els.submitBtn.disabled = true;
  els.answerInput.disabled = true;

  try {
    const data = await postJson('/api/feedback', {
      text: state.text,
      question: state.currentQuestion,
      answer,
      language: state.language
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
  const key = {
    correct: 'verdict_correct',
    partial: 'verdict_partial',
    incorrect: 'verdict_incorrect'
  }[verdict];
  els.feedbackLabel.textContent = key ? t(key) : t('feedback_label');
  els.feedbackText.textContent = feedback;
}

function updateHistory() {
  els.historyCount.textContent = state.history.length;
  els.historyList.innerHTML = '';
  state.history.forEach((h) => {
    const verdictKey = {
      correct: 'verdict_correct',
      partial: 'verdict_partial',
      incorrect: 'verdict_incorrect'
    }[h.verdict];
    const verdictLabel = verdictKey ? t(verdictKey) : h.verdict;
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHtml(t('history_q'))}</strong> ${escapeHtml(h.question)}<br><strong>${escapeHtml(
      t('history_you')
    )}</strong> ${escapeHtml(h.answer)}<br><em>${escapeHtml(verdictLabel)} — ${escapeHtml(h.feedback)}</em>`;
    els.historyList.appendChild(li);
  });
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

function showError(msg) {
  els.errorBanner.textContent = msg;
  els.errorBanner.classList.remove('hidden');
}

function clearError() {
  els.errorBanner.classList.add('hidden');
  els.errorBanner.textContent = '';
}

(async function init() {
  await loadPrefs();
  applyUi();
  await loadPageText();
})();
