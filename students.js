// ===== students.js =====
document.addEventListener('DOMContentLoaded', renderStudents);

function renderStudents() {
  const q = document.getElementById('studentSearch').value.toLowerCase();
  const all = DB.getStudents().filter(s =>
    (s.first+' '+s.last).toLowerCase().includes(q) ||
    s.sid.toLowerCase().includes(q) ||
    (s.email||'').toLowerCase().includes(q)
  );
  const tbl = document.getElementById('studentsTbl');
  if (all.length === 0) {
    tbl.innerHTML = '<tr><td colspan="7" class="empty-row">No students found</td></tr>';
    return;
  }
  tbl.innerHTML = all.map((s, i) => {
    const taken = DB.getResults().filter(r => r.studentId === s.id).length;
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${s.first} ${s.last}</strong></td>
      <td>${s.sid}</td>
      <td>${s.email || '—'}</td>
      <td>${s.course||'—'} / ${s.section||'—'}</td>
      <td>${taken}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit" onclick="editStudent('${s.id}')">✏️</button>
          <button class="btn-icon" title="Delete" onclick="deleteStudent('${s.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openStudentModal() {
  ['studentId','studentFirst','studentLast','studentSID','studentEmail',
   'studentCourse','studentSection','studentUsername','studentPassword'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('studentModalTitle').textContent = 'Add Student';
  document.getElementById('studentModal').classList.remove('hidden');
}

function editStudent(id) {
  const s = DB.getStudent(id);
  if (!s) return;
  document.getElementById('studentId').value      = s.id;
  document.getElementById('studentFirst').value   = s.first;
  document.getElementById('studentLast').value    = s.last;
  document.getElementById('studentSID').value     = s.sid;
  document.getElementById('studentEmail').value   = s.email || '';
  document.getElementById('studentCourse').value  = s.course || '';
  document.getElementById('studentSection').value = s.section || '';
  document.getElementById('studentUsername').value= s.username;
  document.getElementById('studentPassword').value= s.password;
  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentModal').classList.remove('hidden');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.add('hidden');
}

function saveStudent() {
  const first   = document.getElementById('studentFirst').value.trim();
  const last    = document.getElementById('studentLast').value.trim();
  const sid     = document.getElementById('studentSID').value.trim();
  const username= document.getElementById('studentUsername').value.trim();
  const password= document.getElementById('studentPassword').value.trim();

  if (!first || !last || !sid || !username || !password) {
    alert('Please fill in all required fields.');
    return;
  }

  const student = {
    id:       document.getElementById('studentId').value || DB.uid(),
    first, last, sid, username, password,
    email:    document.getElementById('studentEmail').value.trim(),
    course:   document.getElementById('studentCourse').value.trim(),
    section:  document.getElementById('studentSection').value.trim(),
  };

  if (document.getElementById('studentId').value) {
    DB.updateStudent(student);
  } else {
    DB.addStudent(student);
  }
  closeStudentModal();
  renderStudents();
}

function deleteStudent(id) {
  if (!confirm('Delete this student? Their results will also be removed.')) return;
  DB.deleteStudent(id);
  DB.saveResults(DB.getResults().filter(r => r.studentId !== id));
  renderStudents();
}
