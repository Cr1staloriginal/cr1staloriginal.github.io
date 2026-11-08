(() => {
  'use strict';

  const owner = 'Cr1staloriginal';
  const repository = 'cr1staloriginal.github.io';
  const workflowUrl = `https://github.com/${owner}/${repository}/actions/workflows/portfolio-cms.yml`;
  const fileSelect = document.getElementById('file-select');
  const editor = document.getElementById('json-editor');
  const feedback = document.getElementById('editor-feedback');
  const preview = document.getElementById('json-preview');
  const previewState = document.getElementById('preview-state');
  const result = document.getElementById('pr-result');
  const loadButton = document.getElementById('reload-button');
  const prepareButton = document.getElementById('save-button');
  const downloadButton = document.getElementById('download-button');
  let loadedFile = '';

  const message = (text, kind = '') => {
    feedback.textContent = text;
    feedback.className = 'admin-feedback ' + kind;
  };

  function validateContent() {
    let value;
    try {
      value = JSON.parse(editor.value);
    } catch (error) {
      throw new Error('Ошибка JSON: ' + error.message);
    }

    if (fileSelect.value === 'data/site-data.json') {
      if (!value || Array.isArray(value) || typeof value !== 'object' ||
          !value.status || typeof value.status !== 'object' ||
          typeof value.status.label !== 'string' ||
          typeof value.status.state !== 'string' ||
          typeof value.status.description !== 'string' ||
          !Array.isArray(value.focus)) {
        throw new Error('Структура site-data.json неверна: нужны status.label, status.state, status.description и массив focus.');
      }
      if (value.focus.some(item => !item || typeof item !== 'object' ||
          typeof item.name !== 'string' || typeof item.kind !== 'string' ||
          typeof item.state !== 'string')) {
        throw new Error('Каждый элемент focus должен содержать name, kind и state.');
      }
    } else {
      if (!Array.isArray(value)) throw new Error('Для этого раздела нужен JSON-массив.');
      if (value.length > 200) throw new Error('В одном файле допускается не более 200 записей.');
    }

    const normalized = JSON.stringify(value, null, 2) + '\n';
    if (new TextEncoder().encode(normalized).length > 24000) {
      throw new Error('Размер JSON не должен превышать 24 КБ.');
    }
    return normalized;
  }

  function updatePreview(text, valid) {
    preview.textContent = text;
    previewState.textContent = valid ? 'JSON проверен' : 'Предпросмотр без проверки';
    previewState.dataset.valid = String(valid);
  }

  async function loadContent() {
    loadButton.disabled = true;
    result.hidden = true;
    message('Загружаю актуальные данные из GitHub Pages…');
    try {
      const response = await fetch(`../${fileSelect.value}?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Не удалось загрузить файл (HTTP ' + response.status + ').');
      const data = await response.json();
      editor.value = JSON.stringify(data, null, 2);
      loadedFile = fileSelect.value;
      updatePreview(editor.value, false);
      message('Актуальная версия загружена. Изменения пока находятся только в редакторе.', 'admin-success');
    } catch (error) {
      message(error.message, 'admin-error');
      updatePreview('Не удалось загрузить файл. Проверь соединение и попробуй ещё раз.', false);
    } finally {
      loadButton.disabled = false;
    }
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    editor.focus();
    editor.select();
    const copied = document.execCommand('copy');
    editor.setSelectionRange(editor.value.length, editor.value.length);
    if (!copied) throw new Error('Браузер не разрешил копирование. Выдели текст вручную.');
  }

  loadButton.addEventListener('click', loadContent);
  fileSelect.addEventListener('change', loadContent);

  editor.addEventListener('input', () => {
    updatePreview(editor.value, false);
    message('Есть несохранённые изменения. Проверь JSON перед публикацией.');
  });

  prepareButton.addEventListener('click', async () => {
    prepareButton.disabled = true;
    result.hidden = true;
    try {
      const normalized = validateContent();
      editor.value = normalized.trimEnd();
      updatePreview(normalized, true);
      await copyText(normalized);
      message('JSON прошёл проверку и скопирован. Теперь запусти workflow Portfolio CMS в GitHub Actions.', 'admin-success');
      const link = document.createElement('a');
      link.href = workflowUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Открыть Portfolio CMS в GitHub Actions ↗';
      result.replaceChildren(link);
      result.hidden = false;
    } catch (error) {
      message(error.message, 'admin-error');
      previewState.textContent = 'Проверка не пройдена';
      previewState.dataset.valid = 'false';
    } finally {
      prepareButton.disabled = false;
    }
  });

  downloadButton.addEventListener('click', () => {
    try {
      const normalized = validateContent();
      const blob = new Blob([normalized], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileSelect.value.split('/').pop();
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      updatePreview(normalized, true);
      message('Резервная копия JSON скачана.', 'admin-success');
    } catch (error) {
      message(error.message, 'admin-error');
    }
  });

  editorPanelReady();
  function editorPanelReady() {
    document.getElementById('admin-login').textContent = 'GitHub Actions · публикация через Pull Request';
    loadContent();
  }
})();