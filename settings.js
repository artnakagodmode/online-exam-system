// ===== settings.js =====
document.addEventListener('DOMContentLoaded', loadSettings);

function loadSettings() {
  const s = DB.getSettings();
  if (s.schoolName)      document.getElementById('schoolName').value      = s.schoolName;
  if (s.sysTitle)        document.getElementById('sysTitle').value         = s.sysTitle;
  if (s.schoolYear)      document.getElementById('schoolYear').value       = s.schoolYear;
  if (s.semester)        document.getElementById('semester').value         = s.semester;
  if (s.adminName)       document.getElementById('adminName').value        = s.adminName || 'Admin';
  if (s.adminUsername)   document.getElementById('adminUsername').value    = s.adminUsername || 'admin';
  if (s.defaultDuration) document.getElementById('defaultDuration').value  = s.defaultDuration;
  if (s.defaultPass)     document.getElementById('defaultPass').value      = s.defaultPass;
  if (s.shuffleQ)        document.getElementById('shuffleQ').value         = s.shuffleQ;
  if (s.shuffleC)        document.getElementById('shuffleC').value         = s.shuffleC;
  if (s.showResult)      document.getElementById('showResult').value       = s.showResult;
}

function saveSystemInfo() {
  const s = DB.getSettings();
  s.schoolName  = document.getElementById('schoolName').value.trim();
  s.sysTitle    = document.getElementById('sysTitle').value.trim();
  s.schoolYear  = document.getElementById('schoolYear').value.trim();
  s.semester    = document.getElementById('semester').value.trim();
  DB.saveSettings(s);
  showMsg('System info saved!', 'success');
}

function changePassword() {
  const curr    = document.getElementById('currPw').value;
  const newPw   = document.getElementById('newPw').value;
  const confirm = document.getElementById('confirmPw').value;
  const msg     = document.getElementById('pwMsg');
  const s       = DB.getSettings();
  const currentPw = s.adminPassword || 'admin123';

  if (curr !== currentPw) {
    msg.className = 'alert alert-error';
    msg.textContent = 'Current password is incorrect.';
    msg.classList.remove('hidden');
    return;
  }
  if (newPw.length < 6) {
    msg.className = 'alert alert-error';
    msg.textContent = 'New password must be at least 6 characters.';
    msg.classList.remove('hidden');
    return;
  }
  if (newPw !== confirm) {
    msg.className = 'alert alert-error';
    msg.textContent = 'Passwords do not match.';
    msg.classList.remove('hidden');
    return;
  }

  s.adminPassword = newPw;
  s.adminUsername = document.getElementById('adminUsername').value.trim() || 'admin';
  s.adminName     = document.getElementById('adminName').value.trim() || 'Admin';
  DB.saveSettings(s);
  ['currPw','newPw','confirmPw'].forEach(id => document.getElementById(id).value = '');
  msg.className = 'alert alert-success';
  msg.textContent = 'Password updated successfully!';
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 3000);
}

function saveExamDefaults() {
  const s = DB.getSettings();
  s.defaultDuration = document.getElementById('defaultDuration').value;
  s.defaultPass     = document.getElementById('defaultPass').value;
  s.shuffleQ        = document.getElementById('shuffleQ').value;
  s.shuffleC        = document.getElementById('shuffleC').value;
  s.showResult      = document.getElementById('showResult').value;
  DB.saveSettings(s);
  showMsg('Exam defaults saved!', 'success');
}

function exportAllData() {
  const data = {
    exams:    DB.getExams(),
    questions:DB.getQuestions(),
    students: DB.getStudents(),
    results:  DB.getResults(),
    settings: DB.getSettings(),
    exportedAt: new Date().toISOString()
  };
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  a.download = 'exampro_backup.json';
  a.click();
}

function confirmReset() {
  if (!confirm('WARNING: This will permanently delete ALL exams, questions, students, and results. Are you sure?')) return;
  if (!confirm('Are you absolutely sure? This cannot be undone.')) return;
  ['ep_exams','ep_questions','ep_students','ep_results'].forEach(k => localStorage.removeItem(k));
  showMsg('All data has been reset.', 'success');
  setTimeout(() => window.location.href = 'dashboard.html', 1500);
}

function showMsg(text, type) {
  // Simple toast
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.textContent = text;
  toast.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:999;min-width:260px;animation:slideUp .2s ease';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
