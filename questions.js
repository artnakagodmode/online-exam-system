// ===== questions.js =====
document.addEventListener('DOMContentLoaded', () => {
  populateExamFilters();
  renderQuestions();
});

function populateExamFilters() {
  const exams = DB.getExams();
  const filter = document.getElementById('qExamFilter');
  const select = document.getElementById('qExam');
  const opts = exams.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
  filter.innerHTML = '<option value="">All Exams</option>' + opts;
  select.innerHTML = '<option value="">-- Select Exam --</option>' + opts;
}

function renderQuestions() {
  const q    = document.getElementById('qSearch').value.toLowerCase();
  const efilt= document.getElementById('qExamFilter').value;
  const all  = DB.getQuestions().filter(q2 => {
    const matchText = q2.text.toLowerCase().includes(q);
    const matchExam = !efilt || q2.examId === efilt;
    return matchText && matchExam;
  });
  const tbl = document.getElementById('questionsTbl');
  if (all.length === 0) {
    tbl.innerHTML = '<tr><td colspan="6" class="empty-row">No questions found</td></tr>';
    return;
  }
  tbl.innerHTML = all.map((q2, i) => {
    const exam = DB.getExam(q2.examId);
    const typeLabel = { mcq:'MCQ', truefalse:'True/False', identification:'Identification' }[q2.type] || q2.type;
    return `<tr>
      <td>${i+1}</td>
      <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q2.text}</td>
      <td><span class="badge badge-inactive">${typeLabel}</span></td>
      <td>${exam ? exam.name : '—'}</td>
      <td>${q2.points || 1}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit" onclick="editQuestion('${q2.id}')">✏️</button>
          <button class="btn-icon" title="Delete" onclick="deleteQuestion('${q2.id}')">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

let choiceCount = 0;

function openQModal() {
  document.getElementById('qId').value = '';
  document.getElementById('qText').value = '';
  document.getElementById('qType').value = 'mcq';
  document.getElementById('qPoints').value = '1';
  document.getElementById('qExam').value = '';
  document.getElementById('identAnswer').value = '';
  document.getElementById('qModalTitle').textContent = 'Add Question';
  choiceCount = 0;
  document.getElementById('choicesList').innerHTML = '';
  addChoice(); addChoice(); addChoice(); addChoice();
  toggleQType();
  document.getElementById('qModal').classList.remove('hidden');
}

function editQuestion(id) {
  const q = DB.getQuestions().find(x => x.id === id);
  if (!q) return;
  document.getElementById('qId').value    = q.id;
  document.getElementById('qText').value  = q.text;
  document.getElementById('qType').value  = q.type;
  document.getElementById('qPoints').value= q.points || 1;
  document.getElementById('qExam').value  = q.examId;
  document.getElementById('qModalTitle').textContent = 'Edit Question';

  choiceCount = 0;
  document.getElementById('choicesList').innerHTML = '';
  if (q.type === 'mcq' && q.choices) {
    q.choices.forEach(c => addChoice(c.t, c.c));
  } else if (q.type === 'truefalse') {
    const radios = document.querySelectorAll('input[name="tfAnswer"]');
    radios.forEach(r => { r.checked = r.value === q.answer; });
  } else if (q.type === 'identification') {
    document.getElementById('identAnswer').value = q.answer || '';
  }
  toggleQType();
  document.getElementById('qModal').classList.remove('hidden');
}

function closeQModal() {
  document.getElementById('qModal').classList.add('hidden');
}

function addChoice(text = '', correct = false) {
  choiceCount++;
  const idx = choiceCount;
  const list = document.getElementById('choicesList');
  const div = document.createElement('div');
  div.className = 'choice-item';
  div.id = `choiceItem_${idx}`;
  div.innerHTML = `
    <input type="radio" name="correctChoice" value="${idx}" ${correct ? 'checked' : ''}/>
    <input type="text" placeholder="Choice ${idx}" value="${text}" id="choiceText_${idx}"/>
    <button class="choice-remove" onclick="removeChoice(${idx})">✕</button>
  `;
  list.appendChild(div);
}

function removeChoice(idx) {
  const el = document.getElementById(`choiceItem_${idx}`);
  if (el) el.remove();
}

function toggleQType() {
  const t = document.getElementById('qType').value;
  document.getElementById('mcqOptions').style.display  = t === 'mcq' ? '' : 'none';
  document.getElementById('tfOptions').style.display   = t === 'truefalse' ? '' : 'none';
  document.getElementById('identOptions').style.display= t === 'identification' ? '' : 'none';
}

function saveQuestion() {
  const text   = document.getElementById('qText').value.trim();
  const type   = document.getElementById('qType').value;
  const examId = document.getElementById('qExam').value;
  const points = parseInt(document.getElementById('qPoints').value) || 1;

  if (!text || !examId) {
    alert('Please fill in Question Text and select an Exam.');
    return;
  }

  let answer = null, choices = [];

  if (type === 'mcq') {
    const checked = document.querySelector('input[name="correctChoice"]:checked');
    if (!checked) { alert('Please mark the correct answer.'); return; }
    const cIdx = checked.value;
    const items = document.querySelectorAll('.choice-item');
    items.forEach(item => {
      const inp = item.querySelector('input[type="text"]');
      const rad = item.querySelector('input[type="radio"]');
      if (inp && inp.value.trim()) {
        choices.push({ t: inp.value.trim(), c: rad && rad.checked });
      }
    });
    if (choices.length < 2) { alert('Please add at least 2 choices.'); return; }
  } else if (type === 'truefalse') {
    const checked = document.querySelector('input[name="tfAnswer"]:checked');
    if (!checked) { alert('Please select True or False as the answer.'); return; }
    answer = checked.value;
  } else if (type === 'identification') {
    answer = document.getElementById('identAnswer').value.trim();
    if (!answer) { alert('Please enter the correct answer.'); return; }
  }

  const question = {
    id:     document.getElementById('qId').value || DB.uid(),
    examId, text, type, points, choices, answer
  };

  if (document.getElementById('qId').value) {
    DB.updateQuestion(question);
  } else {
    DB.addQuestion(question);
  }
  closeQModal();
  renderQuestions();
}

function deleteQuestion(id) {
  if (!confirm('Delete this question?')) return;
  DB.deleteQuestion(id);
  renderQuestions();
}
