// ===== take-exam.js =====

let currentStudent = null;
let currentExam    = null;
let questions      = [];
let answers        = {};
let timerInterval  = null;
let secondsLeft    = 0;
let currentQ       = 0;
let startTime      = null;

// ── Student Login ──
function studentLogin() {
  const u = document.getElementById('sUsername').value.trim();
  const p = document.getElementById('sPassword').value;
  const student = DB.findStudentByLogin(u, p);
  if (!student) {
    document.getElementById('sLoginErr').classList.remove('hidden');
    setTimeout(() => document.getElementById('sLoginErr').classList.add('hidden'), 3000);
    return;
  }
  currentStudent = student;
  showLobby();
}

function studentLogout() {
  currentStudent = null;
  document.getElementById('examLobbyView').classList.add('hidden');
  document.getElementById('studentLoginView').classList.remove('hidden');
}

function showLobby() {
  document.getElementById('studentLoginView').classList.add('hidden');
  document.getElementById('examLobbyView').classList.remove('hidden');
  document.getElementById('sStudentName').textContent =
    `👤 ${currentStudent.first} ${currentStudent.last}`;
  renderLobby();
}

function renderLobby() {
  const exams = DB.getExams().filter(e => e.status === 'active');
  const container = document.getElementById('availableExams');
  if (!exams.length) {
    container.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:3rem">No active exams available right now.</div>';
    return;
  }
  container.innerHTML = exams.map(e => {
    const qCount  = DB.getQsByExam(e.id).length;
    const already = DB.hasResult(currentStudent.id, e.id);
    return `<div class="exam-lobby-card">
      <div class="exam-lobby-subject">${e.subject}</div>
      <div class="exam-lobby-title">${e.name}</div>
      <div class="exam-lobby-meta">
        <span>⏱ ${e.duration} min</span>
        <span>❓ ${qCount} questions</span>
        <span>✅ Pass: ${e.pass||60}%</span>
      </div>
      ${e.desc ? `<div style="font-size:.8rem;color:var(--text-muted)">${e.desc}</div>` : ''}
      ${already
        ? `<div class="exam-lobby-already">✔ Already taken</div><button class="btn-secondary btn-sm" onclick="startExam('${e.id}')">Retake</button>`
        : `<button class="btn-primary btn-sm" onclick="startExam('${e.id}')">Start Exam →</button>`
      }
    </div>`;
  }).join('');
}

// ── Start Exam ──
function startExam(examId) {
  const exam = DB.getExam(examId);
  if (!exam) return;
  const qs = DB.getQsByExam(examId);
  if (!qs.length) { alert('This exam has no questions yet.'); return; }

  currentExam = exam;
  questions   = shuffle([...qs]); // respect shuffle setting
  answers     = {};
  currentQ    = 0;
  startTime   = new Date();

  document.getElementById('examLobbyView').classList.add('hidden');
  document.getElementById('activeExamView').classList.remove('hidden');
  document.getElementById('activeExamTitle').textContent = exam.name;
  document.getElementById('qTotal').textContent = questions.length;

  secondsLeft = (exam.duration || 60) * 60;
  startTimer();
  renderQuestion();
}

function shuffle(arr) {
  const s = DB.getSettings();
  if (s.shuffleQ === 'no') return arr;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsLeft--;
    updateTimerDisplay();
    if (secondsLeft <= 0) { clearInterval(timerInterval); submitExam(); }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const el = document.getElementById('examTimer');
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.className = 'timer';
  if (secondsLeft <= 60)  el.className = 'timer danger';
  else if (secondsLeft <= 300) el.className = 'timer warning';
}

// ── Render Question ──
function renderQuestion() {
  const q = questions[currentQ];
  document.getElementById('qCurrent').textContent = currentQ + 1;
  document.getElementById('qNumLabel').textContent = `Question ${currentQ + 1}`;
  document.getElementById('qPointsLabel').textContent = `${q.points || 1} point${q.points > 1 ? 's' : ''}`;
  document.getElementById('qTextDisplay').textContent = q.text;

  const choicesDiv = document.getElementById('qChoicesDisplay');
  choicesDiv.innerHTML = '';

  if (q.type === 'mcq') {
    let choices = q.choices || [];
    const s = DB.getSettings();
    if (s.shuffleC !== 'no') choices = [...choices].sort(() => Math.random() - .5);
    choices.forEach((c, i) => {
      const label = String.fromCharCode(65 + i);
      const sel   = answers[q.id] === c.t;
      const div = document.createElement('div');
      div.className = `q-choice ${sel ? 'selected' : ''}`;
      div.onclick = () => selectAnswer(q.id, c.t, div, choicesDiv);
      div.innerHTML = `<input type="radio" name="q_${q.id}" ${sel?'checked':''} readonly/>
        <label class="q-choice-label">${label}. ${c.t}</label>`;
      choicesDiv.appendChild(div);
    });

  } else if (q.type === 'truefalse') {
    ['True','False'].forEach(opt => {
      const sel = answers[q.id] === opt;
      const div = document.createElement('div');
      div.className = `q-choice ${sel ? 'selected' : ''}`;
      div.onclick = () => selectAnswer(q.id, opt, div, choicesDiv);
      div.innerHTML = `<input type="radio" name="q_${q.id}" ${sel?'checked':''} readonly/>
        <label class="q-choice-label">${opt}</label>`;
      choicesDiv.appendChild(div);
    });

  } else if (q.type === 'identification') {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'q-ident-input';
    inp.placeholder = 'Type your answer here...';
    inp.value = answers[q.id] || '';
    inp.oninput = () => { answers[q.id] = inp.value.trim(); updateDots(); };
    choicesDiv.appendChild(inp);
  }

  // Nav
  document.getElementById('prevBtn').disabled = currentQ === 0;
  document.getElementById('nextBtn').textContent =
    currentQ === questions.length - 1 ? '✅ Submit Exam' : 'Next →';

  updateDots();
  updateProgress();
}

function selectAnswer(qid, val, el, container) {
  container.querySelectorAll('.q-choice').forEach(d => {
    d.classList.remove('selected');
    d.querySelector('input').checked = false;
  });
  el.classList.add('selected');
  el.querySelector('input').checked = true;
  answers[qid] = val;
  updateDots();
}

function updateDots() {
  const container = document.getElementById('qNavDots');
  container.innerHTML = questions.map((q, i) => {
    let cls = 'q-dot';
    if (i === currentQ) cls += ' current';
    else if (answers[q.id] !== undefined) cls += ' answered';
    return `<div class="${cls}" onclick="goToQ(${i})" title="Q${i+1}"></div>`;
  }).join('');
}

function updateProgress() {
  const pct = ((currentQ + 1) / questions.length) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
}

function goToQ(i) { currentQ = i; renderQuestion(); }
function prevQuestion() { if (currentQ > 0) { currentQ--; renderQuestion(); } }
function nextQuestion() {
  if (currentQ < questions.length - 1) { currentQ++; renderQuestion(); }
  else {
    const answered = Object.keys(answers).length;
    const unanswered = questions.length - answered;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    submitExam();
  }
}

// ── Submit ──
function submitExam() {
  clearInterval(timerInterval);
  const timeTaken = Math.round((new Date() - startTime) / 1000);
  const mins  = Math.floor(timeTaken / 60);
  const secs  = timeTaken % 60;
  const timeStr = `${mins}m ${secs}s`;

  let score = 0, total = 0;
  const answerLog = [];

  questions.forEach(q => {
    const given   = answers[q.id];
    let correct   = false;
    let correctAns = '';

    if (q.type === 'mcq') {
      const correctChoice = (q.choices || []).find(c => c.c);
      correctAns = correctChoice ? correctChoice.t : '';
      correct = given === correctAns;
    } else if (q.type === 'truefalse') {
      correctAns = q.answer;
      correct = given === q.answer;
    } else if (q.type === 'identification') {
      correctAns = q.answer;
      correct = given && q.answer &&
        given.toLowerCase().trim() === q.answer.toLowerCase().trim();
    }

    if (correct) score += (q.points || 1);
    total += (q.points || 1);
    answerLog.push({ question: q.text, given: given || '', correct: correctAns, isCorrect: correct });
  });

  const pct    = Math.round((score / total) * 100);
  const passed = pct >= (currentExam.pass || 60);

  const result = {
    id: DB.uid(),
    studentId: currentStudent.id,
    examId:    currentExam.id,
    score, total, pct, passed,
    grade:    DB.getGrade(pct),
    date:     new Date().toISOString(),
    timeTaken: timeStr,
    answers:  answerLog
  };
  DB.addResult(result);

  showResult(result);
}

function showResult(result) {
  document.getElementById('activeExamView').classList.add('hidden');
  document.getElementById('examResultView').classList.remove('hidden');

  const settings = DB.getSettings();
  const show = settings.showResult !== 'no';

  document.getElementById('resultIcon').textContent  = result.passed ? '🎉' : '😔';
  document.getElementById('resultTitle').textContent = result.passed ? 'Congratulations!' : 'Exam Complete';
  const scoreEl = document.getElementById('resultScore');
  scoreEl.textContent = result.pct + '%';
  scoreEl.className   = 'result-score ' + (result.passed ? 'pass' : 'fail');
  document.getElementById('resultDetails').innerHTML =
    `Score: <strong>${result.score}/${result.total}</strong> &nbsp;|&nbsp;
     Grade: <strong>${DB.getGrade(result.pct)}</strong> &nbsp;|&nbsp;
     Status: <strong>${result.passed ? '✅ Passed' : '❌ Failed'}</strong> &nbsp;|&nbsp;
     Time: <strong>${result.timeTaken}</strong>`;

  const reviewDiv = document.getElementById('resultReview');
  if (show && result.answers && result.answers.length) {
    reviewDiv.innerHTML = '<h4 style="margin-bottom:.75rem;font-size:.85rem;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted)">Answer Review</h4>' +
      result.answers.map((a, i) => `
        <div class="review-item ${a.isCorrect ? 'correct' : 'wrong'}">
          <span>${a.isCorrect ? '✅' : '❌'}</span>
          <div>
            <div style="font-weight:600;font-size:.85rem">Q${i+1}: ${a.question}</div>
            <div style="font-size:.78rem;color:var(--text-muted)">Your answer: <strong>${a.given || '(none)'}</strong></div>
            ${!a.isCorrect ? `<div style="font-size:.78rem;color:var(--green)">Correct: <strong>${a.correct}</strong></div>` : ''}
          </div>
        </div>`).join('');
  } else if (!show) {
    reviewDiv.innerHTML = '<p style="color:var(--text-muted);font-size:.875rem">Results will be released by the instructor.</p>';
  }
}

function backToLobby() {
  document.getElementById('examResultView').classList.add('hidden');
  document.getElementById('examLobbyView').classList.remove('hidden');
  renderLobby();
}

// Enter key on student login
document.addEventListener('DOMContentLoaded', () => {
  ['sUsername','sPassword'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') studentLogin(); });
  });
});
