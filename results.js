// ===== results.js =====
document.addEventListener('DOMContentLoaded', () => {
  populateExamFilter();
  renderResults();
});

function populateExamFilter() {
  const sel = document.getElementById('resultExamFilter');
  sel.innerHTML = '<option value="">All Exams</option>' +
    DB.getExams().map(e => `<option value="${e.id}">${e.name}</option>`).join('');
}

function renderResults() {
  const q     = document.getElementById('resultSearch').value.toLowerCase();
  const efilt = document.getElementById('resultExamFilter').value;
  const all   = DB.getResults().filter(r => {
    const s = DB.getStudent(r.studentId);
    const e = DB.getExam(r.examId);
    const name = s ? (s.first+' '+s.last).toLowerCase() : '';
    const ename = e ? e.name.toLowerCase() : '';
    return (name.includes(q) || ename.includes(q)) && (!efilt || r.examId === efilt);
  });

  // Summary stats
  const passed = all.filter(r => r.passed).length;
  const avg    = all.length ? Math.round(all.reduce((a,r)=>a+r.pct,0)/all.length) : 0;
  const high   = all.length ? Math.max(...all.map(r=>r.pct)) : 0;
  document.getElementById('passCount').textContent = passed;
  document.getElementById('failCount').textContent = all.length - passed;
  document.getElementById('avgScore').textContent  = avg + '%';
  document.getElementById('highScore').textContent = high + '%';

  const tbl = document.getElementById('resultsTbl');
  if (all.length === 0) {
    tbl.innerHTML = '<tr><td colspan="9" class="empty-row">No results found</td></tr>';
    return;
  }
  const sorted = [...all].sort((a,b) => new Date(b.date) - new Date(a.date));
  tbl.innerHTML = sorted.map((r, i) => {
    const s = DB.getStudent(r.studentId);
    const e = DB.getExam(r.examId);
    return `<tr>
      <td>${i+1}</td>
      <td>${s ? s.first+' '+s.last : 'Unknown'}</td>
      <td>${e ? e.name : 'Unknown'}</td>
      <td>${r.score}/${r.total}</td>
      <td>${r.pct}%</td>
      <td><strong>${DB.getGrade(r.pct)}</strong></td>
      <td>${DB.passBadge(r.passed)}</td>
      <td>${new Date(r.date).toLocaleString()}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="View Details" onclick="viewResult('${r.id}')">👁️</button>
          <button class="btn-icon" title="Delete" onclick="deleteResult('${r.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function viewResult(id) {
  const r = DB.getResults().find(x => x.id === id);
  if (!r) return;
  const s = DB.getStudent(r.studentId);
  const e = DB.getExam(r.examId);
  const body = document.getElementById('resultDetailBody');

  let html = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
      <div><strong>Student:</strong> ${s ? s.first+' '+s.last : 'Unknown'}</div>
      <div><strong>Student ID:</strong> ${s ? s.sid : '—'}</div>
      <div><strong>Exam:</strong> ${e ? e.name : 'Unknown'}</div>
      <div><strong>Subject:</strong> ${e ? e.subject : '—'}</div>
      <div><strong>Score:</strong> ${r.score} / ${r.total}</div>
      <div><strong>Percentage:</strong> ${r.pct}%</div>
      <div><strong>Grade:</strong> ${DB.getGrade(r.pct)}</div>
      <div><strong>Status:</strong> ${DB.passBadge(r.passed)}</div>
      <div><strong>Date:</strong> ${new Date(r.date).toLocaleString()}</div>
      <div><strong>Time Taken:</strong> ${r.timeTaken || '—'}</div>
    </div>
    <h4 style="margin-bottom:1rem;font-size:.9rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">Answer Review</h4>
  `;

  if (r.answers && r.answers.length) {
    r.answers.forEach((a, i) => {
      const correct = a.isCorrect;
      html += `<div class="review-item ${correct ? 'correct' : 'wrong'}">
        <span>${correct ? '✅' : '❌'}</span>
        <div>
          <div style="font-weight:600;margin-bottom:.2rem">Q${i+1}: ${a.question}</div>
          <div style="font-size:.8rem;color:var(--text-muted)">Your answer: <strong>${a.given || '(none)'}</strong></div>
          ${!correct ? `<div style="font-size:.8rem;color:var(--green)">Correct: <strong>${a.correct}</strong></div>` : ''}
        </div>
      </div>`;
    });
  } else {
    html += '<p style="color:var(--text-muted)">No detailed answer data available.</p>';
  }

  body.innerHTML = html;
  document.getElementById('resultModal').classList.remove('hidden');
}

function closeResultModal() {
  document.getElementById('resultModal').classList.add('hidden');
}

function deleteResult(id) {
  if (!confirm('Delete this result?')) return;
  DB.deleteResult(id);
  renderResults();
}

function exportResults() {
  const results = DB.getResults();
  if (!results.length) { alert('No results to export.'); return; }
  const rows = [['Student Name','Student ID','Exam','Subject','Score','Total','Percentage','Grade','Status','Date']];
  results.forEach(r => {
    const s = DB.getStudent(r.studentId);
    const e = DB.getExam(r.examId);
    rows.push([
      s ? s.first+' '+s.last : 'Unknown',
      s ? s.sid : '',
      e ? e.name : 'Unknown',
      e ? e.subject : '',
      r.score, r.total, r.pct+'%',
      DB.getGrade(r.pct),
      r.passed ? 'Passed' : 'Failed',
      new Date(r.date).toLocaleString()
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'exam_results.csv';
  a.click();
}
