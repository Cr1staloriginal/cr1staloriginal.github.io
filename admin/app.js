(() => {
  const owner = 'Cr1staloriginal';
  const repository = 'cr1staloriginal.github.io';
  const workflowUrl = `https://github.com/${owner}/${repository}/actions/workflows/portfolio-cms.yml`;
  const loginPanel = document.getElementById('login-panel');
  const editorPanel = document.getElementById('editor-panel');
  const fileSelect = document.getElementById('file-select');
  const editor = document.getElementById('json-editor');
  const feedback = document.getElementById('editor-feedback');
  const prResult = document.getElementById('pr-result');
  const loadButton = document.getElementById('reload-button');
  const prepareButton = document.getElementById('save-button');

  function message(text, kind = '') {
    feedback.textContent = text;
    feedback.className = 'admin-feedback ' + kind;
  }

  async function loadContent() {
    message('Загружаю актуальную версию из GitHub…');
    prResult.hidden = true;
    try {
      const response = await fetch(`../${fileSelect.value}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('GitHub Pages пока не отдал файл (' + response.status + ').');
      const data = await response.json();
      editor.value = JSON.stringify(data, null, 2);
      message('Данные загружены. После публикации PR обнови страницу, чтобы увидеть новую версию.', 'admin-success');
    } catch (error) {
      message(error.message, 'admin-error');
    }
  }

  function validateContent() {
    const value = JSON.parse(editor.value);
    if (fileSelect.value === 'data/site-data.json') {
      if (!value || Array.isArray(value) || typeof value !== 'object' ||
          !value.status || typeof value.status !== 'object' ||
          typeof value.status.label !== 'string' ||
          typeof value.status.state !== 'string' ||
          typeof value.status.description !== 'string' ||
          !Array.isArray(value.focus)) {
        throw new Error('Проверь структуру: status должен содержать label, state, description, а focus должен быть массивом.');
      }
    } else if (!Array.isArray(value)) {
      throw new Error('Для этого файла нужен JSON-массив.');
    }
    const normalized = JSON.stringify(value, null, 2);
    if (new Blob([normalized]).size > 24000) throw new Error('Размер JSON не должен превышать 24 КБ.');
    return normalized;
  }

  loadButton.addEventListener('click', loadContent);
  fileSelect.addEventListener('change', loadContent);

  prepareButton.addEventListener('click', async () => {
    prepareButton.disabled = true;
    prResult.hidden = true;
    try {
      const normalized = validateContent();
      editor.value = normalized;
      await navigator.clipboard.writeText(normalized);
      message('JSON проверен и скопирован. Открой GitHub Actions по ссылке ниже, запусти workflow и вставь содержимое в поле content.', 'admin-success');
      const link = document.createElement('a');
      link.href = workflowUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Открыть Portfolio CMS в GitHub Actions ↗';
      prResult.replaceChildren(link);
      prResult.hidden = false;
    } catch (error) {
      message(error.name === 'NotAllowedError'
        ? 'Браузер запретил копирование. Разреши доступ к буферу обмена или скопируй JSON вручную.'
        : error instanceof SyntaxError ? 'JSON содержит ошибку синтаксиса: ' + error.message : error.message,
        'admin-error');
    } finally {
      prepareButton.disabled = false;
    }
  });

  document.getElementById('login-button').addEventListener('click', () => {
    window.open('https://github.com/login', '_blank', 'noopener');
  });
  document.getElementById('logout-button').addEventListener('click', () => {
    message('Отдельной CMS-сессии нет: доступ проверяет сам GitHub при запуске workflow.');
  });

  loginPanel.hidden = true;
  editorPanel.hidden = false;
  document.getElementById('admin-login').textContent = 'GitHub Actions · доступ только владельцу репозитория';
  loadContent();
})();
