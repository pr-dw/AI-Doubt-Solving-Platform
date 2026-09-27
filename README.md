# AI Doubt Solving Platform 🎓

> **A Comprehensive Full-Stack Educational Tool** designed to enhance academic productivity, streamline student learning, and provide instant AI-driven doubt resolution with local LLM integration and personalized study management.

---

## 🏛️ System Architecture

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend:** Django 6 (Python 3.13), Django REST Framework, Django CORS Headers
- **Security & Auth:** Argon2 Password Hashing, JWT (JSON Web Tokens via PyJWT / SimpleJWT)
- **Database:** PostgreSQL 17 (Database: `ai_doubt_platform`, Port: 5432) via Django ORM & Psycopg2
- **AI Engine:** Local Ollama integration (`qwen2.5:latest` & `llama3.2`) with integrated on-device academic fallback reasoning engine

---

## 🚀 Key Modules & Capabilities

1. **AI Doubt Solver (Core)**
   - **6 Specialized Explanation Modes:**
     - 🎓 **Detailed Explanation:** Theoretical foundation, architecture & practical use-cases
     - 🤝 **Assist Mode:** Socratic guidance, progressive hints, and checkpoint questions
     - 🎈 **Explain Like I'm 5 (ELI5):** Everyday analogies, metaphors & simple bullet points
     - 📋 **Step-by-Step Solutions:** Rigorous step breakdown, verification & mathematical clarity
     - 💻 **Code Explanation:** Production-ready code snippets with Big-O complexity analysis
     - 📐 **Formula & Proof:** LaTeX mathematical notation, symbol breakdowns & derivations
   - Subject-specific questioning across curriculum subjects
   - Full thread persistence and doubt bookmarking for exam revision

2. **AI Learning Assistant & Roadmaps**
   - 5-step curriculum progression roadmaps for each semester subject
   - High-yield chapter summaries and AI revision notes generator

3. **Performance Analytics & Marks Tracking**
   - Semester-wise, subject-wise assessment marks tracking
   - Identification of strong (≥ 80%) and weak (< 70%) subjects
   - Contextual AI study recommendations

4. **Study Planner & Streak Tracker**
   - Daily and weekly target checklists with confetti celebration
   - Active study streak counter (with motivational flame badge)
   - Semester exam countdown timer

5. **Quiz & Exam Prep**
   - Topic-wise practice quizzes across Easy, Medium, and Hard difficulties
   - Real-time timer, automatic scoring, and detailed question-by-question explanations

6. **Resource Library**
   - Lecture notes, solved Previous Year Question Papers (PYQs), and answer keys
   - Subject and category filtering with document previews and downloads

7. **System & Administration Telemetry**
   - Real-time counts of enrolled students, resolved doubts, resources, and Ollama configuration

---

## 🔑 Default Evaluation Credentials

For testing and demonstration, use the pre-seeded accounts:

| Role | Email | Password | Details & Access |
| :--- | :--- | :--- | :--- |
| **Student** | `student@gmail.com` | `123456` | BCA Sem 5 student portal (AI Doubt Solver, Roadmaps, Streaks, Quizzes) |
| **Faculty** | `faculty@gmail.com` | `123456` | Course Mentor portal (Resource & Notes Management, Class Analytics, Quiz Bank) |
| **Administrator** | `admin@gmail.com` | `123456` | System & Telemetry Controls, Student Roster, Local Ollama configs |

*(The Landing Page and Sign-In Modal feature 1-click evaluation login buttons for all 3 roles.)*

---

## ⚙️ Running Locally

### 1. Backend Server (Django)
```bash
cd backend
source venv/bin/activate
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Development Server (React 19 / Vite)
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Open **`http://127.0.0.1:5173/`** in your browser.

### 3. Local AI with Ollama (Optional)
If Ollama is installed:
```bash
ollama run qwen2.5:latest
```
The platform automatically detects local Ollama on port `11434` and seamlessly falls back to the integrated academic reasoning engine when Ollama is offline.
