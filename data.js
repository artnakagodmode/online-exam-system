// ===== data.js — Centralized Data Layer =====

const DB = {
  // ── Exams ──
  getExams()    { return JSON.parse(localStorage.getItem('ep_exams') || '[]'); },
  saveExams(d)  { localStorage.setItem('ep_exams', JSON.stringify(d)); },
  addExam(e)    { const d = DB.getExams(); d.push(e); DB.saveExams(d); },
  updateExam(e) { DB.saveExams(DB.getExams().map(x => x.id === e.id ? e : x)); },
  deleteExam(id){ DB.saveExams(DB.getExams().filter(x => x.id !== id)); },
  getExam(id)   { return DB.getExams().find(x => x.id === id); },

  // ── Questions ──
  getQuestions()    { return JSON.parse(localStorage.getItem('ep_questions') || '[]'); },
  saveQuestions(d)  { localStorage.setItem('ep_questions', JSON.stringify(d)); },
  addQuestion(q)    { const d = DB.getQuestions(); d.push(q); DB.saveQuestions(d); },
  updateQuestion(q) { DB.saveQuestions(DB.getQuestions().map(x => x.id === q.id ? q : x)); },
  deleteQuestion(id){ DB.saveQuestions(DB.getQuestions().filter(x => x.id !== id)); },
  getQsByExam(eid)  { return DB.getQuestions().filter(q => q.examId === eid); },

  // ── Students ──
  getStudents()    { return JSON.parse(localStorage.getItem('ep_students') || '[]'); },
  saveStudents(d)  { localStorage.setItem('ep_students', JSON.stringify(d)); },
  addStudent(s)    { const d = DB.getStudents(); d.push(s); DB.saveStudents(d); },
  updateStudent(s) { DB.saveStudents(DB.getStudents().map(x => x.id === s.id ? s : x)); },
  deleteStudent(id){ DB.saveStudents(DB.getStudents().filter(x => x.id !== id)); },
  getStudent(id)   { return DB.getStudents().find(x => x.id === id); },
  findStudentByLogin(u, p) {
    return DB.getStudents().find(s => s.username === u && s.password === p);
  },

  // ── Results ──
  getResults()    { return JSON.parse(localStorage.getItem('ep_results') || '[]'); },
  saveResults(d)  { localStorage.setItem('ep_results', JSON.stringify(d)); },
  addResult(r)    { const d = DB.getResults(); d.push(r); DB.saveResults(d); },
  deleteResult(id){ DB.saveResults(DB.getResults().filter(x => x.id !== id)); },
  hasResult(sid, eid) {
    return DB.getResults().some(r => r.studentId === sid && r.examId === eid);
  },

  // ── Settings ──
  getSettings()   { return JSON.parse(localStorage.getItem('ep_settings') || '{}'); },
  saveSettings(d) { localStorage.setItem('ep_settings', JSON.stringify(d)); },

  // ── Helpers ──
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },

  getGrade(pct) {
    if (pct >= 97) return 'A+';
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C-';
    if (pct >= 67) return 'D+';
    if (pct >= 60) return 'D';
    return 'F';
  },

  statusBadge(status) {
    const map = { active:'badge-active', inactive:'badge-inactive', draft:'badge-draft' };
    return `<span class="badge ${map[status]||'badge-inactive'}">${status}</span>`;
  },
  passBadge(passed) {
    return passed
      ? '<span class="badge badge-pass">Passed</span>'
      : '<span class="badge badge-fail">Failed</span>';
  }
};

// Seed demo data if empty
(function seedDemo() {
  if (DB.getExams().length === 0) {
    const eid = DB.uid();
    DB.addExam({ id: eid, name: 'Sample Quiz', subject: 'General Knowledge', duration: 30, pass: 60, status: 'active', desc: 'A sample quiz to get started.' });
    ['What is 2 + 2?','What color is the sky?','How many days in a week?'].forEach((text, i) => {
      const choices = i === 0
        ? [{t:'3',c:false},{t:'4',c:true},{t:'5',c:false},{t:'6',c:false}]
        : i === 1
        ? [{t:'Red',c:false},{t:'Blue',c:true},{t:'Green',c:false},{t:'Yellow',c:false}]
        : [{t:'5',c:false},{t:'6',c:false},{t:'7',c:true},{t:'8',c:false}];
      DB.addQuestion({ id: DB.uid(), examId: eid, text, type:'mcq', points:1, choices });
    });
    DB.addStudent({ id: DB.uid(), first:'Juan', last:'Dela Cruz', sid:'2024-00001', email:'juan@school.edu', course:'BSIT', section:'3A', username:'student1', password:'student1' });
  }
})();
