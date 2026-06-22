import { html } from '../api/_shared.js';

export async function onRequestGet() {
  return html(`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Talpis Admin</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#101113;color:#ece8df;font-family:Arial,sans-serif}.wrap{max-width:1100px;margin:0 auto;padding:28px 18px}.top{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:20px}h1{font-size:22px;margin:0}.panel{background:#17191d;border:1px solid #2a2d34;border-radius:8px;padding:18px}input{height:42px;border-radius:6px;border:1px solid #343842;background:#0d0e10;color:#fff;padding:0 12px;font-size:15px}button,a.btn{height:42px;border:0;border-radius:6px;background:#d8b85b;color:#111;padding:0 16px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}.muted{color:#a7a39a;font-size:13px}.login{max-width:360px;margin:15vh auto}.login form{display:flex;flex-direction:column;gap:12px}.actions{display:flex;gap:10px;align-items:center}table{width:100%;border-collapse:collapse;background:#17191d;border:1px solid #2a2d34;border-radius:8px;overflow:hidden}th,td{text-align:left;padding:11px 10px;border-bottom:1px solid #2a2d34;font-size:14px;vertical-align:top}th{color:#d8b85b;font-size:12px;text-transform:uppercase;letter-spacing:.04em}tr:last-child td{border-bottom:0}.error{color:#ff8a8a}.hidden{display:none}@media(max-width:760px){.top{align-items:flex-start;flex-direction:column}table{display:block;overflow:auto;white-space:nowrap}.actions{flex-wrap:wrap}}
</style>
</head>
<body>
<div class="wrap">
  <section id="login" class="login panel">
    <h1>Talpis Admin</h1>
    <p class="muted">Введите пароль для просмотра таблицы.</p>
    <form id="loginForm">
      <input id="password" type="password" placeholder="Пароль" autocomplete="current-password" required>
      <button type="submit">Войти</button>
      <div id="loginError" class="error"></div>
    </form>
  </section>

  <section id="app" class="hidden">
    <div class="top">
      <div>
        <h1>Зрители вебинара</h1>
        <div id="count" class="muted">Загрузка...</div>
      </div>
      <div class="actions">
        <button id="refresh">Обновить</button>
        <a class="btn" href="/api/export.csv">Скачать CSV</a>
        <button id="logout">Выйти</button>
      </div>
    </div>
    <table>
      <thead><tr><th>Дата</th><th>Имя</th><th>Мэйл</th><th>Телефон</th><th>Страница</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </section>
</div>
<script>
const login = document.getElementById('login');
const app = document.getElementById('app');
const rowsEl = document.getElementById('rows');
const countEl = document.getElementById('count');

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  document.getElementById('loginError').textContent = '';
  const password = document.getElementById('password').value;
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!response.ok) {
    document.getElementById('loginError').textContent = 'Неверный пароль';
    return;
  }
  await loadRows();
});

document.getElementById('refresh').addEventListener('click', loadRows);
document.getElementById('logout').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  app.classList.add('hidden');
  login.classList.remove('hidden');
});

async function loadRows() {
  const response = await fetch('/api/viewers');
  if (response.status === 401) {
    app.classList.add('hidden');
    login.classList.remove('hidden');
    return;
  }
  const data = await response.json();
  login.classList.add('hidden');
  app.classList.remove('hidden');
  const rows = data.rows || [];
  countEl.textContent = rows.length + ' записей';
  rowsEl.innerHTML = rows.map((row) => '<tr>' +
    '<td>' + escapeHtml(formatDate(row.created_at)) + '</td>' +
    '<td>' + escapeHtml(row.name || '') + '</td>' +
    '<td>' + escapeHtml(row.email || '') + '</td>' +
    '<td>' + escapeHtml(row.phone || '') + '</td>' +
    '<td>' + escapeHtml(row.video_page || '') + '</td>' +
  '</tr>').join('');
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('ru-RU');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

loadRows();
</script>
</body>
</html>`);
}
