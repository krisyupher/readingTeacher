const $ = (id) => document.getElementById(id);

const API_BASE = window.READING_TEACHER_API_BASE || '';

const LANG_CODES = { English: 'en', Spanish: 'es', French: 'fr', Portuguese: 'pt' };
const LANG_BCP47 = { English: 'en-US', Spanish: 'es-ES', French: 'fr-FR', Portuguese: 'pt-BR' };

const TRANSLATIONS = {
  English: {
    app_title: 'Reading Teacher',
    dark_mode: 'Dark mode',
    light_mode: 'Light mode',
    toggle_theme: 'Toggle theme',
    reading_placeholder: 'Paste or type text here, or drop a PDF / .txt file onto this box',
    start_btn: 'Start practicing',
    attach_btn: 'Attach file',
    language_label: 'Language',
    word_lookup: 'Word lookup',
    lookup_hint: 'Double-click or highlight a word in the reading to look it up.',
    lookup_placeholder: 'Or type a word...',
    lookup_btn: 'Look up',
    reading: 'Reading',
    practice: 'Practice',
    question_label: 'Question',
    answer_placeholder: 'Type your answer in English...',
    submit_btn: 'Submit answer',
    next_btn: 'Next question',
    reset_btn: 'Change reading',
    feedback_label: 'Feedback',
    history: 'History',
    minimize: 'Minimize',
    expand: 'Expand',
    lang_english: 'English',
    lang_spanish: 'Spanish',
    lang_french: 'French',
    lang_portuguese: 'Portuguese',
    char_count: (n) => `${n} characters`,
    loading_file: (name) => `Loading ${name}...`,
    pdf_attached: (name, n) => `PDF attached: ${name} (${n} pages)`,
    loaded_file: (name) => `Loaded: ${name}`,
    error_prefix: (msg) => `Error: ${msg}`,
    no_text_in_file: 'No text found in the file.',
    unsupported_file: 'Unsupported file. Use .pdf or .txt.',
    pdf_lib_failed: 'PDF library failed to load.',
    looking_up: (word) => `Looking up "${word}"...`,
    lookup_failed: (msg) => `Lookup failed: ${msg}`,
    loading_images: 'Loading images...',
    no_images_found: 'No images found.',
    no_images_for_word: 'No images for this word.',
    loading_question: 'Loading a new question...',
    failed_question: '(failed to load question)',
    rendering_pdf: 'Rendering PDF...',
    pdf_no_text: 'This PDF has no selectable text (maybe a scanned image). Word lookup and questions need real text.',
    pdf_render_failed: (msg) => `Failed to render PDF: ${msg}`,
    need_answer: 'Please write an answer before submitting.',
    short_reading: 'Please paste a longer reading (at least 20 characters) or attach a PDF.',
    verdict_correct: 'Correct',
    verdict_partial: 'Partially correct',
    verdict_incorrect: 'Not quite',
    history_q: 'Q:',
    history_you: 'You:',
    listen_btn: '🔊 Listen',
    stop_btn: '⏹ Stop',
    listen_title: 'Read the text aloud',
    speak_word: 'Pronounce this word',
    tts_unsupported: 'Your browser does not support text-to-speech.'
  },
  Spanish: {
    app_title: 'Profesor de Lectura',
    dark_mode: 'Modo oscuro',
    light_mode: 'Modo claro',
    toggle_theme: 'Cambiar tema',
    reading_placeholder: 'Pega o escribe texto aquí, o arrastra un PDF / .txt a este cuadro',
    start_btn: 'Empezar a practicar',
    attach_btn: 'Adjuntar archivo',
    language_label: 'Idioma',
    word_lookup: 'Buscar palabra',
    lookup_hint: 'Haz doble clic o selecciona una palabra en la lectura para buscarla.',
    lookup_placeholder: 'O escribe una palabra...',
    lookup_btn: 'Buscar',
    reading: 'Lectura',
    practice: 'Práctica',
    question_label: 'Pregunta',
    answer_placeholder: 'Escribe tu respuesta en español...',
    submit_btn: 'Enviar respuesta',
    next_btn: 'Siguiente pregunta',
    reset_btn: 'Cambiar lectura',
    feedback_label: 'Comentario',
    history: 'Historial',
    minimize: 'Minimizar',
    expand: 'Expandir',
    lang_english: 'Inglés',
    lang_spanish: 'Español',
    lang_french: 'Francés',
    lang_portuguese: 'Portugués',
    char_count: (n) => `${n} caracteres`,
    loading_file: (name) => `Cargando ${name}...`,
    pdf_attached: (name, n) => `PDF adjuntado: ${name} (${n} páginas)`,
    loaded_file: (name) => `Cargado: ${name}`,
    error_prefix: (msg) => `Error: ${msg}`,
    no_text_in_file: 'No se encontró texto en el archivo.',
    unsupported_file: 'Archivo no compatible. Usa .pdf o .txt.',
    pdf_lib_failed: 'No se pudo cargar la biblioteca de PDF.',
    looking_up: (word) => `Buscando "${word}"...`,
    lookup_failed: (msg) => `Error en la búsqueda: ${msg}`,
    loading_images: 'Cargando imágenes...',
    no_images_found: 'No se encontraron imágenes.',
    no_images_for_word: 'No hay imágenes para esta palabra.',
    loading_question: 'Cargando una nueva pregunta...',
    failed_question: '(error al cargar la pregunta)',
    rendering_pdf: 'Renderizando PDF...',
    pdf_no_text: 'Este PDF no tiene texto seleccionable (quizá es una imagen escaneada). La búsqueda de palabras y las preguntas necesitan texto real.',
    pdf_render_failed: (msg) => `Error al renderizar el PDF: ${msg}`,
    need_answer: 'Escribe una respuesta antes de enviar.',
    short_reading: 'Pega una lectura más larga (al menos 20 caracteres) o adjunta un PDF.',
    verdict_correct: 'Correcto',
    verdict_partial: 'Parcialmente correcto',
    verdict_incorrect: 'No del todo',
    history_q: 'P:',
    history_you: 'Tú:',
    listen_btn: '🔊 Escuchar',
    stop_btn: '⏹ Detener',
    listen_title: 'Leer el texto en voz alta',
    speak_word: 'Pronunciar esta palabra',
    tts_unsupported: 'Tu navegador no admite la lectura en voz alta.'
  },
  French: {
    app_title: 'Professeur de Lecture',
    dark_mode: 'Mode sombre',
    light_mode: 'Mode clair',
    toggle_theme: 'Changer le thème',
    reading_placeholder: 'Collez ou tapez du texte ici, ou déposez un fichier PDF / .txt sur cette zone',
    start_btn: 'Commencer à pratiquer',
    attach_btn: 'Joindre un fichier',
    language_label: 'Langue',
    word_lookup: 'Recherche de mot',
    lookup_hint: 'Double-cliquez ou sélectionnez un mot dans la lecture pour le rechercher.',
    lookup_placeholder: 'Ou tapez un mot...',
    lookup_btn: 'Rechercher',
    reading: 'Lecture',
    practice: 'Pratique',
    question_label: 'Question',
    answer_placeholder: 'Tapez votre réponse en français...',
    submit_btn: 'Envoyer la réponse',
    next_btn: 'Question suivante',
    reset_btn: 'Changer de lecture',
    feedback_label: 'Commentaire',
    history: 'Historique',
    minimize: 'Réduire',
    expand: 'Agrandir',
    lang_english: 'Anglais',
    lang_spanish: 'Espagnol',
    lang_french: 'Français',
    lang_portuguese: 'Portugais',
    char_count: (n) => `${n} caractères`,
    loading_file: (name) => `Chargement de ${name}...`,
    pdf_attached: (name, n) => `PDF joint : ${name} (${n} pages)`,
    loaded_file: (name) => `Chargé : ${name}`,
    error_prefix: (msg) => `Erreur : ${msg}`,
    no_text_in_file: 'Aucun texte trouvé dans le fichier.',
    unsupported_file: 'Fichier non pris en charge. Utilisez .pdf ou .txt.',
    pdf_lib_failed: 'Échec du chargement de la bibliothèque PDF.',
    looking_up: (word) => `Recherche de « ${word} »...`,
    lookup_failed: (msg) => `Échec de la recherche : ${msg}`,
    loading_images: 'Chargement des images...',
    no_images_found: 'Aucune image trouvée.',
    no_images_for_word: "Pas d'images pour ce mot.",
    loading_question: 'Chargement d’une nouvelle question...',
    failed_question: '(échec du chargement de la question)',
    rendering_pdf: 'Rendu du PDF...',
    pdf_no_text: "Ce PDF n'a pas de texte sélectionnable (peut-être une image scannée). La recherche de mots et les questions nécessitent du vrai texte.",
    pdf_render_failed: (msg) => `Échec du rendu du PDF : ${msg}`,
    need_answer: "Écrivez une réponse avant d'envoyer.",
    short_reading: 'Collez une lecture plus longue (au moins 20 caractères) ou joignez un PDF.',
    verdict_correct: 'Correct',
    verdict_partial: 'Partiellement correct',
    verdict_incorrect: 'Pas tout à fait',
    history_q: 'Q :',
    history_you: 'Toi :',
    listen_btn: '🔊 Écouter',
    stop_btn: '⏹ Arrêter',
    listen_title: 'Lire le texte à voix haute',
    speak_word: 'Prononcer ce mot',
    tts_unsupported: 'Votre navigateur ne prend pas en charge la synthèse vocale.'
  },
  Portuguese: {
    app_title: 'Professor de Leitura',
    dark_mode: 'Modo escuro',
    light_mode: 'Modo claro',
    toggle_theme: 'Alternar tema',
    reading_placeholder: 'Cole ou digite o texto aqui, ou arraste um PDF / .txt para esta caixa',
    start_btn: 'Começar a praticar',
    attach_btn: 'Anexar arquivo',
    language_label: 'Idioma',
    word_lookup: 'Buscar palavra',
    lookup_hint: 'Clique duas vezes ou selecione uma palavra na leitura para buscá-la.',
    lookup_placeholder: 'Ou digite uma palavra...',
    lookup_btn: 'Buscar',
    reading: 'Leitura',
    practice: 'Prática',
    question_label: 'Pergunta',
    answer_placeholder: 'Digite sua resposta em português...',
    submit_btn: 'Enviar resposta',
    next_btn: 'Próxima pergunta',
    reset_btn: 'Mudar leitura',
    feedback_label: 'Comentário',
    history: 'Histórico',
    minimize: 'Minimizar',
    expand: 'Expandir',
    lang_english: 'Inglês',
    lang_spanish: 'Espanhol',
    lang_french: 'Francês',
    lang_portuguese: 'Português',
    char_count: (n) => `${n} caracteres`,
    loading_file: (name) => `Carregando ${name}...`,
    pdf_attached: (name, n) => `PDF anexado: ${name} (${n} páginas)`,
    loaded_file: (name) => `Carregado: ${name}`,
    error_prefix: (msg) => `Erro: ${msg}`,
    no_text_in_file: 'Nenhum texto encontrado no arquivo.',
    unsupported_file: 'Arquivo não suportado. Use .pdf ou .txt.',
    pdf_lib_failed: 'Falha ao carregar a biblioteca de PDF.',
    looking_up: (word) => `Buscando "${word}"...`,
    lookup_failed: (msg) => `Falha na busca: ${msg}`,
    loading_images: 'Carregando imagens...',
    no_images_found: 'Nenhuma imagem encontrada.',
    no_images_for_word: 'Sem imagens para esta palavra.',
    loading_question: 'Carregando uma nova pergunta...',
    failed_question: '(falha ao carregar a pergunta)',
    rendering_pdf: 'Renderizando PDF...',
    pdf_no_text: 'Este PDF não tem texto selecionável (talvez seja uma imagem escaneada). A busca de palavras e as perguntas precisam de texto real.',
    pdf_render_failed: (msg) => `Falha ao renderizar o PDF: ${msg}`,
    need_answer: 'Escreva uma resposta antes de enviar.',
    short_reading: 'Cole uma leitura mais longa (pelo menos 20 caracteres) ou anexe um PDF.',
    verdict_correct: 'Correto',
    verdict_partial: 'Parcialmente correto',
    verdict_incorrect: 'Não exatamente',
    history_q: 'P:',
    history_you: 'Você:',
    listen_btn: '🔊 Ouvir',
    stop_btn: '⏹ Parar',
    listen_title: 'Ler o texto em voz alta',
    speak_word: 'Pronunciar esta palavra',
    tts_unsupported: 'Seu navegador não suporta leitura em voz alta.'
  }
};

function t(key, ...args) {
  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.English;
  const v = dict[key] ?? TRANSLATIONS.English[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

(function initTheme() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'));
})();

const state = {
  text: '',
  currentQuestion: null,
  history: [],
  lookupCache: new Map(),
  pdfDoc: null,
  pdfName: '',
  language: localStorage.getItem('language') || 'English'
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
  fileStatus: $('file-status'),
  languageSelect: $('language-select'),
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

els.languageSelect.value = state.language;
els.languageSelect.addEventListener('change', () => {
  state.language = els.languageSelect.value;
  localStorage.setItem('language', state.language);
  state.lookupCache.clear();
  stopSpeaking();
  applyUi();
});

const themeBtn = $('theme-toggle');
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  applyUi();
});

function applyUi() {
  document.title = t('app_title');
  document.documentElement.lang = LANG_CODES[state.language] || 'en';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  els.languageSelect.querySelectorAll('option').forEach((opt) => {
    opt.textContent = t('lang_' + opt.value.toLowerCase());
  });

  els.charCount.textContent = t('char_count', els.readingInput.value.length);
  els.answerInput.placeholder = t('answer_placeholder');

  const theme = document.documentElement.getAttribute('data-theme');
  themeBtn.textContent = theme === 'dark' ? t('light_mode') : t('dark_mode');
  themeBtn.title = t('toggle_theme');

  document.querySelectorAll('.pane').forEach((pane) => {
    const btn = pane.querySelector('.pane-toggle');
    if (btn) btn.title = pane.classList.contains('collapsed') ? t('expand') : t('minimize');
  });

  updateListenBtn();
  document.querySelectorAll('.speak-word').forEach((b) => (b.title = t('speak_word')));
}

applyUi();

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
  els.fileStatus.textContent = t('loading_file', file.name);
  try {
    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      if (!window.pdfjsLib) throw new Error(t('pdf_lib_failed'));
      const buf = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      state.pdfDoc = pdf;
      state.pdfName = file.name;
      els.readingInput.value = '';
      els.charCount.textContent = t('char_count', 0);
      els.fileStatus.textContent = t('pdf_attached', file.name, pdf.numPages);
    } else if (name.endsWith('.txt') || file.type.startsWith('text/')) {
      const text = (await file.text()).trim();
      if (!text) throw new Error(t('no_text_in_file'));
      state.pdfDoc = null;
      state.pdfName = '';
      els.readingInput.value = text;
      els.charCount.textContent = t('char_count', text.length);
      els.fileStatus.textContent = t('loaded_file', file.name);
    } else {
      throw new Error(t('unsupported_file'));
    }
  } catch (err) {
    state.pdfDoc = null;
    state.pdfName = '';
    els.fileStatus.textContent = t('error_prefix', err.message);
  }
}

els.readingInput.addEventListener('input', () => {
  els.charCount.textContent = t('char_count', els.readingInput.value.length);
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
    btn.title = collapsed ? t('expand') : t('minimize');
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
  els.lookupStatus.textContent = t('looking_up', word);

  try {
    const data = await postJson('/api/lookup', { word, text: state.text, language: state.language });
    state.lookupCache.set(key, data);
    renderLookup(data);
  } catch (err) {
    els.lookupStatus.textContent = t('lookup_failed', err.message);
  }
}

function renderLookup(data) {
  els.lookupStatus.textContent = '';
  els.lookupResult.classList.remove('hidden');
  const headWord = data.base_form && data.base_form.toLowerCase() !== data.word.toLowerCase()
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
  const res = await fetch(API_BASE + url, {
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
    els.readingDisplay.textContent = t('rendering_pdf');
    els.setup.classList.add('hidden');
    els.practice.classList.remove('hidden');
    try {
      const extracted = await extractPdfText(state.pdfDoc);
      state.text = extracted.trim();
      if (state.text.length < 20) {
        showError(t('pdf_no_text'));
        resetSession();
        return;
      }
      await renderPdfPages(state.pdfDoc, els.readingDisplay);
    } catch (err) {
      showError(t('pdf_render_failed', err.message));
      return;
    }
  } else {
    const text = els.readingInput.value.trim();
    if (text.length < 20) {
      showError(t('short_reading'));
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
  const key = { correct: 'verdict_correct', partial: 'verdict_partial', incorrect: 'verdict_incorrect' }[verdict];
  els.feedbackLabel.textContent = key ? t(key) : t('feedback_label');
  els.feedbackText.textContent = feedback;
}

function updateHistory() {
  els.historyCount.textContent = state.history.length;
  els.historyList.innerHTML = '';
  state.history.forEach((h) => {
    const verdictKey = { correct: 'verdict_correct', partial: 'verdict_partial', incorrect: 'verdict_incorrect' }[h.verdict];
    const verdictLabel = verdictKey ? t(verdictKey) : h.verdict;
    const li = document.createElement('li');
    li.innerHTML = `<strong>${escapeHtml(t('history_q'))}</strong> ${escapeHtml(h.question)}<br><strong>${escapeHtml(t('history_you'))}</strong> ${escapeHtml(h.answer)}<br><em>${escapeHtml(verdictLabel)} — ${escapeHtml(h.feedback)}</em>`;
    els.historyList.appendChild(li);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function resetSession() {
  stopSpeaking();
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
