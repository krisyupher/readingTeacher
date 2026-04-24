(() => {
  if (window.__readingTeacherContentLoaded) return;
  window.__readingTeacherContentLoaded = true;

  function getPageText() {
    const article = document.querySelector('article');
    const main = document.querySelector('main');
    const node = article || main || document.body;
    return (node?.innerText || '').replace(/\s+\n/g, '\n').trim();
  }

  function handleSelection() {
    const sel = window.getSelection();
    if (!sel) return;
    const raw = sel.toString().trim();
    if (!raw) return;
    const cleaned = raw.replace(/^[^\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+$/gu, '');
    if (!cleaned || cleaned.length > 40) return;
    chrome.runtime
      .sendMessage({ type: 'word-selected', word: cleaned })
      .catch(() => {});
  }

  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('dblclick', handleSelection);

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'get-page-text') {
      sendResponse({
        text: getPageText(),
        title: document.title,
        url: location.href
      });
    }
    return false;
  });
})();
