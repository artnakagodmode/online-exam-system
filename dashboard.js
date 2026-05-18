// ===== dashboard.js =====
document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  startClock();
});

function loadDashboard() {
  const exams    = DB.getExams();
  const students = DB.getStudents();
  const questions= DB.getQuestions();
  const results  = DB.getResults();

  document.getElementById('totalExams').textContent    = exams.length;
  document.getElementById('totalStudents').textContent = students.length;
  document.getElementById('totalQuestions').textContent= questions.length;
  document.getElementById('totalResults').textContent  = results.length;

  // Recent exams (last 5)
  const rExams = [...exams].reverse().slice(0, 5);
  const eTbl = document.getElementById('recentExamsTbl');
  if (rExams.length === 0) {
    eTbl.innerHTML = '<tr><td colspan="4" class="empty-row">No exams yet</td></tr>';
  } else {
    eTbl.innerHTML = rExams.map(e => `
      <tr>
        <td>${e.name}</td>
        <td>${e.subject}</td>
        <td>${e.duration} min</td>
        <td>${DB.statusBadge(e.status)}</td>
      </tr>`).join('');
  }

  // Recent results (last 5)
  const rResults = [...results].reverse().slice(0, 5);
  const rTbl = document.getElementById('recentResultsTbl');
  if (rResults.length === 0) {
    rTbl.innerHTML = '<tr><td colspan="4" class="empty-row">No results yet</td></tr>';
  } else {
    rTbl.innerHTML = rResults.map(r => {
      const student = DB.getStudent(r.studentId);
      const exam    = DB.getExam(r.examId);
      return `<tr>
        <td>${student ? student.first+' '+student.last : 'Unknown'}</td>
        <td>${exam ? exam.name : 'Unknown'}</td>
        <td>${r.score}/${r.total}</td>
        <td>${DB.getGrade(r.pct)}</td>
      </tr>`;
    }).join('');
  }
}

function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  };
  tick();
  setInterval(tick, 1000);
}
