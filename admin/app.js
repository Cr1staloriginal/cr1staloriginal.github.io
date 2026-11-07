(() => {
  const apiBase = (document.querySelector('meta[name="portfolio-api"]')?.content || '').replace(/\/$/, '');
  const api = (path) => apiBase + path;
  const loginPanel = document.getElementById('login-panel');
  const editorPanel = document.getElementById('editor-panel');
  const loginFeedback = document.getElementById('login-feedback');
  const editorFeedback = document.getElementById('editor-feedback');
  const fileSelect = document.getElementById('file-select');
  const editor = document.getElementById('json-editor');
  const saveButton = document.getElementById('save-button');
  const prResult = document.getElementById('pr-result');

  async function request(path, options = {}) {
    const response = await fetch(api(path), {
      credentials: 'include',
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Ошибка API: ' + response.status);
    return data;
  }
  function feedback(element, message, kind = '') {
    element.textContent = message;
    element.className = 'admin-feedback ' + kind;
  }
  async function checkSession() {
    try {
      const data = await request('/api/auth/me');
      loginPanel.hidden = true;
      editorPanel.hidden = false;
      document.getElementById('admin-login').textContent = data.login;
      await loadContent();
    } catch {
      loginPanel.hidden = false;
      editorPanel.hidden = true;
    }
  }
  async function loadContent() {
    feedback(editorFeedback, 'Загружаю данные…');
    prResult.hidden = true;
    try {
      const data = await request('/api/admin/content?file=' + encodeURIComponent(fileSelect.value));
      editor.value = data.content;
      feedback(editorFeedback, 'Данные загружены.');
    } catch (error) {
      feedback(editorFeedback, error.message, 'admin-error');
    }
  }

  document.getElementById('login-button').addEventListener('click', () => {
    loginFeedback.textContent = 'Переход к GitHub…';
    window.location.assign(api('/api/auth/github'));
  });
  document.getElementById('logout-button').addEventListener('click', async () => {
    try { await request('/api/auth/logout', { method: 'POST', body: '{}' }); }
    finally { window.location.reload(); }
  });
  document.getElementById('reload-button').addEventListener('click', loadContent);
  fileSelect.addEventListener('change', loadContent);
  saveButton.addEventListener('click', async () => {
    saveButton.disabled = true;
    feedback(editorFeedback, 'Проверяю JSON и создаю Pull Request…');
    prResult.hidden = true;
    try {
      JSON.parse(editor.value);
      const result = await request('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({ file: fileSelect.value, content: editor.value })
      });
      feedback(editorFeedback, 'Pull Request создан.', 'admin-success');
      const link = document.createElement('a');
      link.href = result.pullRequest;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Открыть PR #' + result.number + ' ↗';
      prResult.replaceChildren(link);
      prResult.hidden = false;
    } catch (error) {
      feedback(editorFeedback, error.message, 'admin-error');
    } finally {
      saveButton.disabled = false;
    }
  });

  checkSession();
})();
