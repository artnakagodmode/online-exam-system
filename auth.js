// ===== auth.js =====

const ADMIN = { username: 'admin', password: 'admin123', name: 'Admin' };

function doLogin() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const err = document.getElementById('loginError');

  // Check custom admin credentials from settings
  const settings = JSON.parse(localStorage.getItem('ep_settings') || '{}');
  const adminUser = settings.adminUsername || ADMIN.username;
  const adminPass = settings.adminPassword || ADMIN.password;

  if (u === adminUser && p === adminPass) {
    sessionStorage.setItem('ep_auth', JSON.stringify({ role: 'admin', name: settings.adminName || 'Admin' }));
    window.location.href = 'dashboard.html';
  } else {
    err.classList.remove('hidden');
    setTimeout(() => err.classList.add('hidden'), 3000);
  }
}

function logout() {
  sessionStorage.removeItem('ep_auth');
  window.location.href = 'index.html';
}

function requireAuth() {
  const auth = sessionStorage.getItem('ep_auth');
  if (!auth) { window.location.href = 'index.html'; return null; }
  return JSON.parse(auth);
}

function togglePw() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Protect all non-login pages
if (!window.location.pathname.endsWith('index.html') &&
    !window.location.pathname.endsWith('take-exam.html') &&
    !window.location.pathname.endsWith('/')) {
  requireAuth();
}

// Enter key on login
document.addEventListener('DOMContentLoaded', () => {
  ['username','password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
});
