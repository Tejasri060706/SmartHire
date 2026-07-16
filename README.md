# Skill Sage — AI Resume Screening & Job Matching Portal

Skill Sage is a premium, two-sided recruitment platform that combines AI parsing and matching with a structured testing workflow. Candidates get an automated qualification channel, while recruiters receive highly ranked lists of applicant matches.

---

## Technical Architecture

* **Frontend**: React (Vite), React Router, Axios, Lucide Icons, Vanilla CSS (Premium Glassmorphism Design System)
* **Backend**: Node.js + Express
* **Database / ORM**: SQLite (`dev.db`) + Prisma Client
* **Auth**: JWT (Bearer authorization header, persisted locally)
* **Validation**: Zod (Dual-ended programmatic validations)
* **AI Engine**: Swappable OpenAI-compatible completions endpoint with intelligent mock fallbacks.

---

## Directory Structure

```
/ResumeScreen
├── client/                      # Vite React frontend
│   ├── src/
│   │   ├── api/                 # API connection configurations
│   │   ├── components/          # Shared components (Navbar, ProtectedRoute)
│   │   ├── context/             # AuthContext state provider
│   │   ├── pages/               
│   │   │   ├── auth/            # Register / Login forms
│   │   │   ├── candidate/       # Dashboards, ResumeUpload, JobBrowse, TestRunner, Applications, ChatWidget
│   │   │   └── recruiter/       # Dashboards, JobForm, ApplicantList
│   │   └── App.jsx              # Client routing configuration
└── server/                      # Express backend server
    ├── prisma/
    │   ├── schema.prisma        # SQLite database models
    │   └── seed.js              # Initial database seeder
    ├── src/
    │   ├── controllers/         # Express action controllers
    │   ├── middleware/          # auth, roleCheck, upload middlewares
    │   ├── lib/
    │   │   ├── ai.js            # LLM API parser/chat connector
    │   │   └── scoring.js       # Match scoring calculations
    │   ├── routes/              # Express API routers
    │   └── index.js             # Express app bootstrap
```

---

## Getting Started

### 1. Database Setup & Seeding

Go to the `server` directory, create a `.env` file (copied from `.env.example`), and run the migrations and seed script:

```bash
cd server
cp .env.example .env

# Install backend dependencies
npm install

# Run database migrations (initializes SQLite dev.db file)
npx prisma migrate dev --name init

# Seed database with assessment test structures and recruitments
node prisma/seed.js
```

### 2. Start the Backend Server

```bash
# Start backend on http://localhost:5000
npm run dev
```

### 3. Start the Frontend Client

Go to the `client` directory and bootstrap the React application:

```bash
cd ../client

# Install frontend dependencies
npm install

# Run Vite dev server on http://localhost:5173
npm run dev
```

---

## Business Logic & Rules

### 1. Hybrid Match Scoring Formula
Instead of relying on unstable LLM returns, Skill Sage calculates a deterministic skill overlap and merges it with a single AI narrative evaluation:
* **Skill Overlap Score** = `(matched required skills / total required skills) * 100` (Deterministic keyword checking)
* **LLM Fit Score** = 0-100 rating computed by LLM evaluating candidate context narrative against the job description.
* **Final Match Score** = `round(0.6 * skillOverlapScore + 0.4 * llmFitScore)`

### 2. Category Assessment Gating
* Candidates must have uploaded at least **one resume** to take any assessment.
* Taking and passing a role-specific test (e.g. Frontend Assessment) once unlocks **all jobs** matching that category.
* Job applications for gated positions check passed test credentials and return `403` with redirect metadata if the candidate is not yet qualified.
