# Scienti-Hub Connect — ICSIT 2026

A full-stack web portal for the **International Conference on Sustainable Innovation & Technology (ICSIT 2026)**. Built with the MERN stack, it handles speaker profiles, paper submissions, the conference agenda, and participant management.

---

## Features

### Core
- **Landing Hub** — countdown timer, event location, and a grid of scientific themes
- **Speaker Directory** — browsable and searchable profiles filtered by theme or country
- **Conference Program** — day-by-day agenda that highlights the live session in real time based on system clock
- **Committee Directory** — organizing and scientific committee with roles and affiliations
- **Paper Submission Portal** — authenticated form with real-time field validation (title, abstract ≥ 50 chars, email format, track selection)
- **Sticky Registration Bar** — persistent call-to-action visible on every page

### Participant Dashboard
- **Paper Tracking** — authors see their submission statuses: `Pending → Under Review → Accepted / Rejected → Published`
- **Automated Certificate Preview** — participants with accepted/published papers can preview their attendance certificate
- **Speaker Onboarding** — authors with at least one published paper can submit a speaker profile request

### Admin Dashboard
- Manage all submitted papers and update their status
- Approve or reject speaker profile requests
- Add/edit agenda sessions and link them to speakers
- User management with role assignment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | shadcn/ui, Tailwind CSS, Radix UI |
| State / Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT |

---

## Project Structure

```
scienti-hub-connect/
├── src/                        # React frontend
│   ├── components/             # Shared UI components
│   │   ├── CountdownTimer.tsx
│   │   ├── StickyRegistrationBar.tsx
│   │   └── ui/                 # shadcn/ui primitives
│   ├── pages/                  # Route-level pages
│   │   ├── Home.tsx            # Landing hub
│   │   ├── Speakers.tsx        # Speaker directory
│   │   ├── Program.tsx         # Dynamic agenda
│   │   ├── Committee.tsx       # Committee directory
│   │   ├── SubmitPaper.tsx     # Submission form
│   │   ├── Dashboard.tsx       # Author & admin dashboard
│   │   ├── Certificate.tsx     # Certificate preview
│   │   └── SpeakerOnboarding.tsx
│   ├── contexts/AuthContext.tsx
│   └── data/mockData.ts        # Static conference constants & seed types
│
└── server/                     # Express backend
    ├── models/
    │   ├── Speaker.js          # name, title, affiliation, topic, theme, photoURL, biography
    │   ├── Submission.js       # paperTitle, abstract, authorsList, trackTheme, status
    │   ├── Agenda.js           # timeSlot, sessionTitle, speakerId, day, room
    │   ├── User.js
    │   └── SpeakerRequest.js
    ├── routes/
    │   ├── auth.js             # POST /api/auth/register, /api/auth/login
    │   ├── speakers.js         # GET /api/speakers (filter by country, theme, q)
    │   ├── submissions.js      # POST /api/submissions, GET /api/submissions/me
    │   ├── agenda.js           # GET /api/agenda (filter by theme)
    │   └── admin.js            # Admin-only paper/speaker management
    ├── middleware/auth.js       # JWT verification
    └── index.js                # Express app entry point
```

---

## Data Models

### Speaker
```js
{ fullName, academicTitle, affiliation, topic, country, theme, photoURL, biography }
```

### Submission
```js
{ authorId, paperTitle, abstract, authorsList, trackTheme,
  status: "Pending" | "Under Review" | "Accepted" | "Rejected" | "Published" }
```

### Agenda
```js
{ timeSlot, sessionTitle, speakerId, roomLocation, theme, day }
```

---

## API Routes

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a participant |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/speakers` | Public | List speakers; filter by `country`, `theme`, `q` |
| GET | `/api/speakers/filters` | Public | Distinct countries and themes for dropdowns |
| POST | `/api/submissions` | Private | Submit a paper |
| GET | `/api/submissions/me` | Private | Author's own submissions with status |
| GET | `/api/submissions/me/accepted` | Private | Accepted/published papers (certificate eligibility) |
| GET | `/api/agenda` | Public | Full agenda; filter by `theme` |
| PUT | `/api/admin/submissions/:id/status` | Admin | Update paper status |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1 — Backend

```sh
cd server
cp .env.template .env
# Fill in MONGO_URI and JWT_SECRET in .env

npm install
node index.js
# API available at http://localhost:5000
```

Optionally seed the database:
```sh
node seed.js
```

### 2 — Frontend

```sh
# From the project root
npm install
npm run dev
# App available at http://localhost:5173
```

Vite proxies `/api/*` requests to `http://localhost:5000` via `vite.config.ts`.

### 3 — Tests

```sh
npm test
```

---

## Known Gaps vs. Specification

1. **Province filter for speakers** — the spec requires filtering by `country` and province, but the `Speaker` model and `/api/speakers` only support country-level filtering. A `province` field needs to be added to the schema and exposed as a query parameter.

2. **Status label inconsistency** — `mockData.ts` uses `"Reviewed"` but the `Submission` model enum uses `"Under Review"`. Both should be aligned to `"Under Review"`.

3. **`/api/register` route alias** — the spec lists `/api/register` as the registration endpoint; the implementation uses `/api/auth/register`. Add an alias or update any external references.

4. **Country filter precision** — `GET /api/speakers` matches `country` with an exact string. Switch to a case-insensitive regex for better UX.
