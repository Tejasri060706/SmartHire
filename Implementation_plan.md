# AI Resume Screening & Job Matching Portal — Build Spec (v Final)

> **How to use this doc:** Paste this entire file as the seed context/task spec when you start the Antigravity workspace. It's written to be unambiguous enough for an agent to build from directly — exact schema, exact API contracts, exact business rules. Sections marked **[DECISION MADE]** are calls I made on your behalf to keep the spec buildable; override them before running if you disagree. Sections marked **[CONFIRM]** are things worth a sanity check before the agent starts.

---

## 0. Project Summary

A two-sided recruitment platform. Candidates upload a resume, get it AI-analyzed, take a general skills test, then must pass a role-specific test before applying to any job in that role category. Recruiters post jobs, see ranked applicants by match score, shortlist, and schedule interviews. Candidates also get an AI chatbot scoped to their own resume/application data.



## 1. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite), React Router, Axios, Tailwind CSS |
| Frontend state | React Context for auth; component-local state elsewhere (no Redux/Zustand needed at this scope) |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | SQLite (file-based, `dev.db`) |
| Auth | JWT (Bearer token, stored in localStorage on client) |
| Password hashing | bcrypt |
| Validation | zod (both client and server schemas, server is source of truth) |
| File upload | multer (disk storage, `/server/uploads`) |
| AI | Any OpenAI-compatible chat completions API (Groq, OpenAI, or Gemini via compatible endpoint), abstracted behind one module so the provider is swappable via env var — do not hardcode to one vendor's SDK |

**[DECISION MADE]** JWT in Bearer header rather than httpOnly cookie — simpler for a demo, no CSRF handling needed. Tradeoff: token sits in localStorage (XSS-exposed). Acceptable for this project; flag as a known tradeoff if asked in an interview, don't present it as best practice.

---

## 2. Repo Structure

```
/ai-resume-portal
├── client/                      # React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register (role toggle)
│   │   │   ├── candidate/       # Dashboard, ResumeUpload, JobBrowse, TestRunner, ChatWidget
│   │   │   └── recruiter/       # Dashboard, JobForm, ApplicantList, InterviewScheduler
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── api/                 # one file per resource: auth.js, jobs.js, tests.js, etc.
│   │   └── App.jsx
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── routes/               # one file per resource
│   │   ├── controllers/
│   │   ├── middleware/           # auth.js (JWT verify), roleCheck.js
│   │   ├── lib/
│   │   │   ├── ai.js              # parseResume, matchJobToResume, chat — only place LLM is called
│   │   │   └── scoring.js         # deterministic skill-overlap calc
│   │   ├── uploads/                # multer destination, gitignored
│   │   └── index.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 3. Environment Variables (`server/.env.example`)

```
PORT=5000
JWT_SECRET=replace_me
DATABASE_URL="file:./dev.db"
AI_API_KEY=replace_me
AI_API_BASE_URL=https://api.groq.com/openai/v1   # swap provider here
AI_MODEL=llama-3.3-70b-versatile                   # swap model here
```

---

## 4. Database Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CANDIDATE
  RECRUITER
}

enum JobStatus {
  OPEN
  CLOSED
}

enum TestType {
  GENERAL
  ROLE_SPECIFIC
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum ApplicationStatus {
  APPLIED
  SHORTLISTED
  INTERVIEW_SCHEDULED
  REJECTED
  HIRED
}

enum InterviewMode {
  ONLINE
  OFFLINE
}

enum InterviewStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum ChatSender {
  CANDIDATE
  AI
}

model User {
  id           String     @id @default(cuid())
  name         String
  email        String     @unique
  passwordHash String
  role         Role
  createdAt    DateTime   @default(now())
  candidate    Candidate?
  recruiter    Recruiter?
}

model Candidate {
  id           String        @id @default(cuid())
  userId       String        @unique
  user         User          @relation(fields: [userId], references: [id])
  phone        String?
  headline     String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  resumes      Resume[]
  applications Application[]
  testAttempts TestAttempt[]
  chatMessages ChatMessage[]
}

model Recruiter {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  companyName String
  createdAt   DateTime @default(now())
  jobs        Job[]
}

model Resume {
  id               String        @id @default(cuid())
  candidateId      String
  candidate        Candidate     @relation(fields: [candidateId], references: [id])
  fileUrl          String
  rawText          String
  parsedSkills     String        // JSON string array
  parsedExperience String?
  parsedEducation  String?
  isLatest         Boolean       @default(true)
  uploadedAt       DateTime      @default(now())
  applications     Application[]
}

model Job {
  id              String        @id @default(cuid())
  recruiterId     String
  recruiter       Recruiter     @relation(fields: [recruiterId], references: [id])
  title           String
  description     String
  requiredSkills  String        // JSON string array
  roleCategory    String        // 'frontend' | 'backend' | 'ai-ml' — matches Test.roleCategory
  status          JobStatus     @default(OPEN)
  createdAt       DateTime      @default(now())
  applications    Application[]
}

model Test {
  id           String        @id @default(cuid())
  type         TestType
  roleCategory String?       // null for GENERAL, set for ROLE_SPECIFIC
  title        String
  passScore    Int           @default(60) // percentage required to pass
  createdAt    DateTime      @default(now())
  questions    Question[]
  attempts     TestAttempt[]
}

model Question {
  id           String     @id @default(cuid())
  testId       String
  test         Test       @relation(fields: [testId], references: [id])
  questionText String
  options      String     // JSON string array, e.g. ["A","B","C","D"]
  correctIndex Int
  topicTag     String     // e.g. 'logical-reasoning', 'sql', 'react-hooks'
  difficulty   Difficulty
  answers      TestAnswer[]
}

model TestAttempt {
  id             String       @id @default(cuid())
  candidateId    String
  candidate      Candidate    @relation(fields: [candidateId], references: [id])
  testId         String
  test           Test         @relation(fields: [testId], references: [id])
  score          Int          // percentage
  totalQuestions Int
  passed         Boolean
  startedAt      DateTime     @default(now())
  completedAt    DateTime?
  answers        TestAnswer[]
  applications   Application[] // applications gated by this attempt
}

model TestAnswer {
  id            String      @id @default(cuid())
  attemptId     String
  attempt       TestAttempt @relation(fields: [attemptId], references: [id])
  questionId    String
  question      Question    @relation(fields: [questionId], references: [id])
  selectedIndex Int
  isCorrect     Boolean
  topicTag      String
}

model Application {
  id                 String            @id @default(cuid())
  candidateId        String
  candidate          Candidate         @relation(fields: [candidateId], references: [id])
  jobId              String
  job                Job               @relation(fields: [jobId], references: [id])
  resumeId           String
  resume             Resume            @relation(fields: [resumeId], references: [id])
  matchScore         Int               // 0-100
  matchedSkills      String            // JSON string array
  missingSkills      String            // JSON string array
  gateTestAttemptId  String
  gateTestAttempt    TestAttempt       @relation(fields: [gateTestAttemptId], references: [id])
  status             ApplicationStatus @default(APPLIED)
  appliedAt          DateTime          @default(now())
  interview          Interview?

  @@unique([candidateId, jobId]) // one application per candidate per job
}

model Interview {
  id            String          @id @default(cuid())
  applicationId String          @unique
  application   Application     @relation(fields: [applicationId], references: [id])
  scheduledTime DateTime
  mode          InterviewMode
  status        InterviewStatus @default(SCHEDULED)
  notes         String?
}

model ChatMessage {
  id          String     @id @default(cuid())
  candidateId String
  candidate   Candidate  @relation(fields: [candidateId], references: [id])
  sender      ChatSender
  message     String
  createdAt   DateTime   @default(now())
}
```

---

## 5. Business Rules (write these as explicit checks in controllers, not implicit behavior)

### 5.1 Match Score Formula **[DECISION MADE]**
Pure LLM-returned scores are inconsistent run-to-run. Use a hybrid:
```
skillOverlapScore = (matched required skills / total required skills) * 100   // computed in scoring.js, deterministic
llmFitScore = LLM-judged 0-100 score considering experience/education narrative fit
finalScore = round(0.6 * skillOverlapScore + 0.4 * llmFitScore)
```
This is also a better interview talking point than "I asked the LLM for a number."

### 5.2 Test Gating Flow
1. Candidate must have ≥1 resume before taking any test.
2. General test: takeable anytime after resume upload, any number of attempts, **highest score counts** for the analysis dashboard.
3. Role-specific test: tied to `Job.roleCategory`. **[DECISION MADE — was open question]**: passing a role-specific test once unlocks **all** jobs in that category, not just the job that triggered it. Test attempts are reusable.
4. `POST /jobs/:id/apply` must check: does the candidate have a `TestAttempt` where `test.type=ROLE_SPECIFIC`, `test.roleCategory=job.roleCategory`, `passed=true`? If not, return `403` with a payload telling the frontend which test to redirect to. If yes, create the `Application` referencing that attempt's id as `gateTestAttemptId`.
5. A candidate cannot apply to the same job twice (`@@unique([candidateId, jobId])` enforces this at the DB level — also check at the controller level for a clean error message).

### 5.3 Application Status Transitions
`APPLIED → SHORTLISTED → INTERVIEW_SCHEDULED → HIRED`, or `→ REJECTED` from any state. Enforce valid transitions server-side; don't let the frontend set status directly to arbitrary values.

---

## 6. LLM Integration Contracts (`server/src/lib/ai.js`)

All three functions return **strict JSON only** — system prompt must instruct "respond with raw JSON only, no markdown fences, no preamble." Parse the response and throw a controlled error if it doesn't validate against the expected shape (use zod here too).

### `parseResume(resumeText: string)`
```json
{
  "skills": ["Python", "React", "SQL"],
  "experience": "2 years as a backend developer at X",
  "education": "B.Tech in Computer Science, NIT Silchar, 2022"
}
```

### `getFitScore(parsedResume, jobDescription, requiredSkills)`
```json
{
  "llmFitScore": 78,
  "reasoning": "1-2 sentence justification, shown to recruiter, not candidate"
}
```
(Combined with deterministic `skillOverlapScore` per §5.1 — overlap calc happens in `scoring.js`, not via LLM.)

### `chat(candidateContext, conversationHistory, newMessage)`
`candidateContext` = candidate's parsed resume summary + their application statuses + eligible roles, assembled server-side and injected into the system prompt so the bot can only answer from real data. Returns:
```json
{ "reply": "string" }
```
**[CONFIRM]** This is AI-only, as agreed — it answers from the candidate's own data, it does not page or message an actual human recruiter. If a query is outside scope (e.g. "what's my salary going to be"), the bot should say it can't answer that, not hallucinate.

---

## 7. REST API Contract

### Auth
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/auth/register` | none | `{name, email, password, role}` | `{token, user}` |
| POST | `/api/auth/login` | none | `{email, password}` | `{token, user}` |
| GET | `/api/auth/me` | required | — | `{user}` |

### Candidate
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/resumes` | candidate | multipart file | `{resume}` (parses + stores) |
| GET | `/api/resumes/latest` | candidate | — | `{resume}` |
| GET | `/api/candidate/analysis` | candidate | — | weak topics, strong topics, recommended roles |
| GET | `/api/jobs` | candidate | query: `roleCategory?` | jobs with `matchScore` + `eligible: boolean` per job |
| POST | `/api/jobs/:id/apply` | candidate | — | `{application}` or `403 {requiredTest: {testId, roleCategory}}` |
| GET | `/api/candidate/applications` | candidate | — | list with status |
| GET | `/api/tests/:testId` | candidate | — | test + questions (no `correctIndex` field sent) |
| POST | `/api/tests/:testId/attempts` | candidate | — | `{attemptId}` (starts attempt) |
| POST | `/api/tests/attempts/:attemptId/submit` | candidate | `{answers: [{questionId, selectedIndex}]}` | `{score, passed, breakdown}` |
| POST | `/api/chat` | candidate | `{message}` | `{reply}` |

### Recruiter
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/api/jobs` | recruiter | `{title, description, requiredSkills, roleCategory}` | `{job}` |
| GET | `/api/jobs/:id/applicants` | recruiter (own job only) | query: `sort=matchScore` | ranked applicant list |
| POST | `/api/applications/:id/shortlist` | recruiter | — | `{application}` |
| POST | `/api/applications/:id/reject` | recruiter | — | `{application}` |
| POST | `/api/applications/:id/interview` | recruiter | `{scheduledTime, mode}` | `{interview}` |
| GET | `/api/recruiter/dashboard` | recruiter | — | `{openJobs, totalApplicants, shortlisted, topScorers: [...]}` |

All routes except register/login go through `middleware/auth.js` (verifies JWT) and `middleware/roleCheck.js` (enforces candidate-only / recruiter-only / ownership checks — a recruiter must only see applicants for their own jobs).

---

## 8. Frontend Routes

```
/login, /register
/candidate/dashboard        → resume status, match summary, eligible roles, weak areas
/candidate/resume           → upload/replace resume
/candidate/jobs             → browse jobs, match score badge, "locked" badge if test not passed
/candidate/jobs/:id         → job detail, apply button (or "take test to unlock")
/candidate/tests/:testId    → test runner UI
/candidate/applications     → status tracker
/candidate/chat             → chatbot widget (can also be a persistent floating widget instead of a page)

/recruiter/dashboard        → analytics cards + top scorers
/recruiter/jobs/new         → post a job
/recruiter/jobs/:id         → applicant list, sortable by match score, shortlist/reject/schedule actions
```

Route protection: a single `ProtectedRoute` wrapper component checking `AuthContext`, redirecting by role if a candidate hits a `/recruiter/*` path or vice versa.

---

## 9. Seed Data Requirements (`prisma/seed.js`)

For the demo to be usable out of the box, seed script must create:
- 1 `GENERAL` test, ~15 questions spanning topics: `logical-reasoning`, `aptitude`, `communication`
- 3 `ROLE_SPECIFIC` tests, ~10 questions each: `frontend`, `backend`, `ai-ml`
- 2 recruiter accounts with 2-3 jobs each across the three role categories
- 1-2 demo candidate accounts (optional, for quick login during demos)

Actual question content is not specified here — write real questions when building the seed script, tagged correctly by `topicTag` so the weak-area analytics has something to compute against.

---

## 10. Build Order (dependency-ordered milestones — not calendar weeks)

1. **M0** — Repo scaffold, Prisma schema + migration, seed script runs cleanly
2. **M1** — Auth: register/login both roles, JWT middleware, protected routes on both ends
3. **M2** — Job CRUD (recruiter) + job browse (candidate), no matching/scoring yet
4. **M3** — Resume upload + `parseResume` integration, stored on `Resume`
5. **M4** — Matching: `scoring.js` overlap calc + `getFitScore`, surfaced on job browse page
6. **M5** — Test engine: question bank rendering, attempt/submit, gating check wired into apply flow
7. **M6** — Recruiter applicant view (ranked), shortlist/reject/schedule actions, recruiter dashboard analytics
8. **M7** — Candidate analysis dashboard (weak areas from `TestAnswer.topicTag` aggregation)
9. **M8** — Chatbot (context assembly + `/api/chat`)
10. **M9** — Polish: empty states, loading states, error handling, README with setup instructions

Each milestone should be independently runnable/demoable — don't let M5 block on M8 being done, etc.

---

## 11. Decisions Log (everything I called for you — revisit if it doesn't match your intent)

- Role-specific tests are reusable across all jobs in a category, not per-job — §5.2
- Match score is a hybrid deterministic-overlap + LLM-judgment formula, not a raw LLM number — §5.1
- JWT via Bearer header + localStorage, not httpOnly cookie — §1
- Chatbot is AI-only against the candidate's own data, never escalates to a human — §6
- No real email/SMS sending in v1 — notifications can just be DB rows / console logs
- Question bank is hand-authored via seed script, not generated per-attempt