'use strict';

const express = require('express');
const crypto = require('node:crypto');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb', strict: true }));

const env = process.env;
const required = ['APP_ORIGIN', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_CALLBACK_URL',
  'ADMIN_GITHUB_LOGIN', 'SESSION_SECRET', 'GITHUB_REPOSITORY'];
const missing = required.filter((key) => !env[key]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}
if (Buffer.byteLength(env.SESSION_SECRET) < 32) {
  console.error('SESSION_SECRET must contain at least 32 bytes.');
  process.exit(1);
}

const APP_ORIGIN = new URL(env.APP_ORIGIN).origin;
const COOKIE_SECURE = env.NODE_ENV === 'production';
const SESSION_COOKIE = 'cr1stalik_session';
const STATE_COOKIE = 'cr1stalik_oauth_state';
const REPO = env.GITHUB_REPOSITORY;
const BASE_BRANCH = env.GITHUB_BASE_BRANCH || 'main';
const ALLOWED_FILES = new Set([
  'data/site-data.json',
  'data/changelog.json',
  'data/achievements.json'
]);
const secretKey = crypto.createHash('sha256').update(env.SESSION_SECRET).digest();
const rateBuckets = new Map();

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}
function setCookie(res, name, value, options = {}) {
  const parts = [name + '=' + encodeURIComponent(value), 'Path=/', 'HttpOnly', 'SameSite=' + (options.sameSite || 'Lax')];
  if (options.maxAge !== undefined) parts.push('Max-Age=' + options.maxAge);
  if (COOKIE_SECURE) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}
function clearCookie(res, name) {
  setCookie(res, name, '', { maxAge: 0 });
}
function encryptSession(data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}
function decryptSession(value) {
  try {
    const raw = Buffer.from(value, 'base64url');
    if (raw.length < 29) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const plain = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
    const session = JSON.parse(plain.toString('utf8'));
    if (!session.expiresAt || session.expiresAt < Date.now()) return null;
    return session;
  } catch { return null; }
}
function sessionFrom(req) {
  const token = cookies(req)[SESSION_COOKIE];
  return token ? decryptSession(token) : null;
}
function requireOrigin(req, res, next) {
  const origin = req.get('origin');
  if (origin && origin !== APP_ORIGIN) return res.status(403).json({ error: 'Origin not allowed' });
  next();
}
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', APP_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(requireOrigin);

function rateLimit({ windowMs = 60_000, max = 8 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now - bucket.start >= windowMs) rateBuckets.set(key, { start: now, count: 1 });
    else if (++bucket.count > max) return res.status(429).json({ error: 'Too many requests. Try again later.' });
    next();
  };
}
function requireAdmin(req, res, next) {
  const session = sessionFrom(req);
  if (!session || session.login !== env.ADMIN_GITHUB_LOGIN) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.session = session;
  next();
}
async function github(path, options = {}) {
  const response = await fetch('https://api.github.com' + path, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || 'GitHub API request failed');
    error.status = response.status;
    throw error;
  }
  return body;
}
function validateContent(file, content) {
  if (!ALLOWED_FILES.has(file)) throw new Error('File is not editable through the CMS.');
  if (typeof content !== 'string' || Buffer.byteLength(content, 'utf8') > 24_000) {
    throw new Error('Content must be a string smaller than 24 KB.');
  }
  const data = JSON.parse(content);
  if (!Array.isArray(data) && (data === null || typeof data !== 'object')) throw new Error('JSON must be an object or array.');
  if (file === 'data/site-data.json' && (Array.isArray(data) || typeof data.status !== 'string')) {
    throw new Error('site-data.json must be an object with a status string.');
  }
  if ((file === 'data/changelog.json' || file === 'data/achievements.json') && !Array.isArray(data)) {
    throw new Error('This file must contain a JSON array.');
  }
  return JSON.stringify(data, null, 2) + '\n';
}
function githubError(res, error) {
  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 502;
  res.status(status).json({ error: status === 502 ? 'External service unavailable' : error.message });
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'cr1stalik-portfolio-api' }));

app.get('/api/auth/github', rateLimit({ max: 10 }), (_req, res) => {
  const state = crypto.randomBytes(24).toString('base64url');
  setCookie(res, STATE_COOKIE, state, { maxAge: 600 });
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.GITHUB_CALLBACK_URL);
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);
  res.redirect(url.toString());
});

app.get('/api/auth/callback', rateLimit({ max: 20 }), async (req, res) => {
  const expectedState = cookies(req)[STATE_COOKIE];
  clearCookie(res, STATE_COOKIE);
  if (!req.query.code || !expectedState || req.query.state !== expectedState) {
    return res.status(400).send('OAuth state validation failed.');
  }
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET,
        code: String(req.query.code), redirect_uri: env.GITHUB_CALLBACK_URL })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) return res.status(401).send('GitHub authorization failed.');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: 'Bearer ' + tokenData.access_token, Accept: 'application/vnd.github+json' }
    });
    const user = await userResponse.json();
    if (!userResponse.ok || user.login !== env.ADMIN_GITHUB_LOGIN) return res.status(403).send('This GitHub account is not allowed.');
    const value = encryptSession({ login: user.login, token: tokenData.access_token, expiresAt: Date.now() + 3_600_000 });
    setCookie(res, SESSION_COOKIE, value, { maxAge: 3600, sameSite: 'None' });
    res.redirect(APP_ORIGIN + '/admin/');
  } catch (error) {
    console.error('OAuth callback failed:', error.message);
    res.status(502).send('Could not complete GitHub authorization.');
  }
});

app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ authenticated: true, login: req.session.login }));
app.post('/api/auth/logout', (_req, res) => {
  clearCookie(res, SESSION_COOKIE);
  res.json({ ok: true });
});

app.get('/api/admin/content', requireAdmin, async (req, res) => {
  const file = String(req.query.file || '');
  if (!ALLOWED_FILES.has(file)) return res.status(400).json({ error: 'File is not editable.' });
  try {
    const item = await github('/repos/' + REPO + '/contents/' + file + '?ref=' + encodeURIComponent(BASE_BRANCH), {
      headers: { Authorization: 'Bearer ' + req.session.token }
    });
    res.json({ file, content: Buffer.from(item.content, 'base64').toString('utf8') });
  } catch (error) { githubError(res, error); }
});

app.post('/api/admin/content', requireAdmin, rateLimit({ max: 12 }), async (req, res) => {
  try {
    const file = String(req.body.file || '');
    const content = validateContent(file, req.body.content);
    const token = req.session.token;
    const base = await github('/repos/' + REPO + '/git/ref/heads/' + encodeURIComponent(BASE_BRANCH), {
      headers: { Authorization: 'Bearer ' + token }
    });
    const branch = 'cms/content-' + Date.now().toString(36);
    await github('/repos/' + REPO + '/git/refs', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'refs/heads/' + branch, sha: base.object.sha })
    });
    const current = await github('/repos/' + REPO + '/contents/' + file + '?ref=' + encodeURIComponent(BASE_BRANCH), {
      headers: { Authorization: 'Bearer ' + token }
    });
    await github('/repos/' + REPO + '/contents/' + file, {
      method: 'PUT', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'cms: update ' + file, content: Buffer.from(content).toString('base64'),
        sha: current.sha, branch })
    });
    const pr = await github('/repos/' + REPO + '/pulls', {
      method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'CMS: update ' + file, head: branch, base: BASE_BRANCH,
        body: 'Изменение публичных данных через защищённую админ-панель портфолио. Перед публикацией проходит обычную проверку.' })
    });
    res.status(201).json({ ok: true, pullRequest: pr.html_url, number: pr.number });
  } catch (error) {
    if (error instanceof SyntaxError) return res.status(400).json({ error: 'Invalid JSON content.' });
    if (error.message.startsWith('File is not') || error.message.startsWith('Content must') ||
        error.message.startsWith('JSON must') || error.message.startsWith('site-data') ||
        error.message.startsWith('This file')) return res.status(400).json({ error: error.message });
    githubError(res, error);
  }
});

app.post('/api/contact', rateLimit({ windowMs: 10 * 60_000, max: 4 }), async (req, res) => {
  const { name, contact, message, website } = req.body || {};
  if (website) return res.json({ ok: true });
  if (![name, contact, message].every((v) => typeof v === 'string') ||
      name.trim().length < 2 || name.length > 80 || contact.trim().length < 3 ||
      contact.length > 160 || message.trim().length < 10 || message.length > 3000) {
    return res.status(400).json({ error: 'Check the name, contact and message fields.' });
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return res.status(503).json({ error: 'Message delivery is not configured yet.' });
  }
  const text = ['Новое сообщение с портфолио', '', 'Имя: ' + name.trim(),
    'Контакт: ' + contact.trim(), '', message.trim()].join('\n');
  try {
    const response = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error('Telegram delivery failed');
    res.status(202).json({ ok: true, message: 'Message delivered.' });
  } catch (error) {
    console.error('Contact delivery failed:', error.message);
    res.status(502).json({ error: 'Message could not be delivered. Please use the direct contact links.' });
  }
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled API error:', error.message);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(env.PORT || 8787);
app.listen(port, '127.0.0.1', () => console.log('Portfolio API listening on 127.0.0.1:' + port));
