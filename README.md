# ExamPro — Online Examination System

A fully-featured, multi-page online examination system built with pure HTML, CSS, and JavaScript. All data is stored in `localStorage` — no backend or database required.

---

## 🚀 Getting Started

1. Open `index.html` in any web browser.
2. Log in with:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Students take exams at `take-exam.html`.

---

## 📁 File Structure

```
online-exam-system/
├── index.html          ← Admin login
├── dashboard.html      ← Admin dashboard (stats, recent activity)
├── exams.html          ← Manage exams (add/edit/delete)
├── questions.html      ← Manage questions (MCQ, True/False, Identification)
├── students.html       ← Manage students & login credentials
├── results.html        ← View/export exam results
├── settings.html       ← System settings & admin password change
├── take-exam.html      ← Student portal (login + take exam)
│
├── css/
│   ├── style.css       ← Global styles, variables, components
│   ├── login.css       ← Login page styles
│   ├── dashboard.css   ← Admin layout styles
│   └── exam-take.css   ← Student exam-taking styles
│
└── js/
    ├── auth.js         ← Admin login/logout/auth guard
    ├── data.js         ← Data layer (CRUD via localStorage) + seed data
    ├── dashboard.js    ← Dashboard stats & clock
    ├── exams.js        ← Exam management logic
    ├── questions.js    ← Question management logic
    ├── students.js     ← Student management logic
    ├── results.js      ← Results view & CSV export
    ├── settings.js     ← Settings save/load logic
    └── take-exam.js    ← Full student exam-taking flow
```

---

## ✨ Features

### Admin Panel
- **Dashboard** — Live clock, totals (exams, students, questions, results), recent activity tables
- **Exams** — Create/edit/delete exams with name, subject, duration, pass score, start/end dates, status (active/inactive/draft)
- **Questions** — Three types: Multiple Choice (MCQ), True/False, Identification; assign to any exam; set point values
- **Students** — Register students with Student ID, course/section, and login credentials
- **Results** — View all results with score, grade, pass/fail status; detailed answer review per student; CSV export
- **Settings** — School info, admin username/password change, exam defaults (shuffle, pass score, show results), full data export & reset

### Student Portal (`take-exam.html`)
- Student login (separate from admin)
- Lobby showing all active exams with duration, question count, and pass score
- Full exam-taking interface with:
  - Countdown timer (warning at 5 min, danger at 1 min)
  - Progress bar
  - Navigation dots (shows answered/unanswered)
  - Previous/Next navigation
  - Auto-submit on timer expiry
- Instant result with score, grade, and answer review

---

## 🔧 Default Credentials

| Role    | Username  | Password   |
|---------|-----------|------------|
| Admin   | `admin`   | `admin123` |
| Student | `student1`| `student1` |

> Admin credentials can be changed in Settings. Student credentials are set per student in the Students page.

---

## 📝 Notes

- All data is stored in `localStorage` — data persists across browser sessions on the same device/browser.
- No internet connection required after first load (fonts load from Google Fonts).
- The system seeds one sample exam and student on first run.
