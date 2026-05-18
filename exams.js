// ===== exams.js =====
document.addEventListener('DOMContentLoaded', renderExams);

function renderExams() {
  const q   = document.getElementById('examSearch').value.toLowerCase();
  const all = DB.getExams().filter(e =>
    e.name.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q)
  );
  const tbl = document.getElementById('examsTbl');
  if (all.length === 0) {
    tbl.innerHTML = '<tr><td colspan="8" class="empty-row">No exams found</td></tr>';
    return;
  }
  tbl.innerHTML = all.map((e, i) => {
    const qCount = DB.getQsByExam(e.id).length;
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${e.name}</strong></td>
      <td>${e.subject}</td>
      <td>${e.duration} min</td>
      <td>${e.pass || 60}%</td>
      <td>${qCount}</td>
      <td>${DB.statusBadge(e.status)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit" onclick="editExam('${e.id}')">✏️</button>
          <button class="btn-icon" title="Delete" onclick="deleteExam('${e.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openExamModal(id = null) {
  document.getElementById('examId').value = '';
  document.getElementById('examName').value = '';
  document.getElementById('examSubject').value = '';
  document.getElementById('examDuration').value = '';
  document.getElementById('examPass').value = '60';
  document.getElementById('examDesc').value = '';
  document.getElementById('examStart').value = '';
  document.getElementById('examEnd').value = '';
  document.getElementById('examStatus').value = 'active';
  document.getElementById('examModalTitle').textContent = 'Add Exam';
  document.getElementById('examModal').classList.remove('hidden');
}

function editExam(id) {
  const e = DB.getExam(id);
  if (!e) return;
  document.getElementById('examId').value      = e.id;
  document.getElementById('examName').value    = e.name;
  document.getElementById('examSubject').value = e.subject;
  document.getElementById('examDuration').value= e.duration;
  document.getElementById('examPass').value    = e.pass || 60;
  document.getElementById('examDesc').value    = e.desc || '';
  document.getElementById('examStart').value   = e.start || '';
  document.getElementById('examEnd').value     = e.end || '';
  document.getElementById('examStatus').value  = e.status;
  document.getElementById('examModalTitle').textContent = 'Edit Exam';
  document.getElementById('examModal').classList.remove('hidden');
}

function closeExamModal() {
  document.getElementById('examModal').classList.add('hidden');
}

function saveExam() {
  const name    = document.getElementById('examName').value.trim();
  const subject = document.getElementById('examSubject').value.trim();
  const duration= parseInt(document.getElementById('examDuration').value);

  if (!name || !subject || !duration) {
    alert('Please fill in required fields (Name, Subject, Duration).');
    return;
  }

  const exam = {
    id:       document.getElementById('examId').value || DB.uid(),
    name, subject, duration,
    pass:     parseInt(document.getElementById('examPass').value) || 60,
    desc:     document.getElementById('examDesc').value.trim(),
    start:    document.getElementById('examStart').value,
    end:      document.getElementById('examEnd').value,
    status:   document.getElementById('examStatus').value,
  };

  if (document.getElementById('examId').value) {
    DB.updateExam(exam);
  } else {
    DB.addExam(exam);
  }
  closeExamModal();
  renderExams();
}

function deleteExam(id) {
  if (!confirm('Delete this exam? All its questions will also be deleted.')) return;
  DB.deleteExam(id);
  // Delete related questions
  DB.saveQuestions(DB.getQuestions().filter(q => q.examId !== id));
  renderExams();
}
