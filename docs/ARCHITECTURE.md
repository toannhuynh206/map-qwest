# Map Quest — Full System Architecture Design

## Table of Contents

1. Tech Stack
2. System Architecture
3. Data Model Design
4. API Design
5. Frontend Architecture
6. Interactive Map Strategy
7. Scoring System Design
8. Project Structure
9. Phase Plan

---

## 1. Tech Stack

```
Frontend:     Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion
State:        Zustand (client quiz state) + TanStack Query (server state via tRPC)
API Layer:    tRPC v11 (type-safe RPC) + Next.js Route Handlers
ORM:          Drizzle ORM
Database:     PostgreSQL (Supabase)
Auth:         Supabase Auth (Google OAuth + PKCE)
Map:          React Simple Maps + D3-geo + TopoJSON
Testing:      Vitest (unit) + Testing Library (components) + Playwright (E2E)
Hosting:      Vercel (app) + Supabase (DB + Auth + Storage)
CI/CD:        GitHub Actions
Monitoring:   Sentry + PostHog
```

### Justifications

| Choice | Why | Alternatives Considered |
|--------|-----|------------------------|
| Next.js 15 | SSR, App Router, Vercel zero-config deploy, resume-worthy | SvelteKit, Remix, React+Vite |
| tRPC | End-to-end type safety, no separate backend | Express+REST, GraphQL, FastAPI |
| Supabase (Postgres) | Free tier, managed, RLS, built-in auth | PlanetScale, MongoDB, Turso |
| Drizzle ORM | Thin, SQL-like, great TS inference | Prisma, Kysely, raw SQL |
| Supabase Auth | Native Google OAuth, JWT+PKCE, free 50K MAU | NextAuth, Clerk, custom JWT |
| React Simple Maps | SVG = per-country click, no API key, ~50KB | Leaflet, Mapbox, D3 raw |
| Zustand | 1KB, selector-based re-renders, no boilerplate | Redux, Context |
| Vercel | Zero-config Next.js deploy, preview per PR | Railway, Fly.io |

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                         │
│  Next.js App (App Router) + Zustand + React Simple Maps       │
│  tRPC Client ←→ TanStack Query Cache                          │
└───────────────────────┬────────────────────────────────────────┘
                        │ HTTPS (JSON-RPC)
┌───────────────────────┼────────────────────────────────────────┐
│                 VERCEL SERVERLESS                               │
│  tRPC Router → Service Layer → Repository Layer (Drizzle)      │
│  (QuizService, ScoringService, UserService, StatsService)      │
└───────────────────────┬────────────────────────────────────────┘
                        │ TCP (connection pooling)
┌───────────────────────┼────────────────────────────────────────┐
│                  SUPABASE PLATFORM                              │
│  PostgreSQL (users, quiz_sessions, quiz_attempts, ratings...)  │
│  Supabase Auth (Google OAuth) + Storage (flags) + RLS          │
└────────────────────────────────────────────────────────────────┘
```

### Auth Flow
1. User clicks "Sign in with Google"
2. Supabase Auth SDK redirects to Google OAuth consent
3. Google validates → redirects back with authorization code
4. Supabase exchanges code for JWT (PKCE flow)
5. On first login: Postgres trigger creates user profile row

### Quiz Answer Flow
1. User taps country on map
2. Zustand store updates immediately (optimistic)
3. tRPC mutation: `quiz.submitAnswer({ questionId, selectedCountryCode, timeMs })`
4. Middleware validates JWT
5. QuizService validates answer, calculates score, persists attempt
6. Client shows green/red highlight, loads next question

---

## 3. Data Model

### Tables

- **users** — id, supabaseAuthId, email, displayName, avatarUrl, preferences (JSONB)
- **user_ratings** — userId, gameMode, region, rating (ELO 1200 start), ratingDeviation, peakRating, totalGames, totalCorrect
- **user_streaks** — userId, currentStreak, longestStreak, lastActivityDate, streakFreezeCount
- **user_daily_stats** — userId, date, gamesPlayed, questionsAnswered, correctAnswers, totalTimeMs, ratingChange
- **quiz_sessions** — userId, gameMode, region, status, totalQuestions, correctAnswers, ratingBefore/After
- **quiz_attempts** — sessionId, userId, questionId, selectedAnswer, correctAnswer, isCorrect, timeMs, attemptOrder
- **quiz_questions** — gameMode, questionText, correctAnswer (ISO alpha-3), region, difficulty (1-5), metadata (JSONB)
- **puzzle_sets** — title, description, questionIds (JSONB array), difficulty, region
- **leaderboard_snapshots** — gameMode, region, period, userId, rank, rating, snapshotDate

### Key Indexes
- quiz_attempts(user_id), quiz_attempts(session_id)
- quiz_sessions(user_id, started_at DESC)
- user_ratings(game_mode, region, rating DESC)
- user_daily_stats(user_id, date DESC)
- quiz_questions(game_mode, region, difficulty)

### Row Level Security
- Users can only read/write their own data
- Leaderboard is publicly readable
- Quiz attempts are write-once, read-own

---

## 4. API Design (tRPC Routers)

### auth
- `getSession` — get current user profile (creates on first login)
- `updatePreferences` — update theme, sound, haptic, map projection

### quiz
- `startSession` — create session, select questions via adaptive difficulty, return questions (no answers)
- `submitAnswer` — validate answer, persist attempt, return correct/incorrect + correct answer
- `completeSession` — calculate final rating, update streaks/stats, return session summary

### stats
- `getOverview` — total games, accuracy, streak, ratings per mode, recent sessions
- `getRatingHistory` — rating over time for a mode+region (chart data)
- `getActivityHeatmap` — GitHub-style calendar data for a year
- `getCountryAccuracy` — per-country accuracy (for mastery map coloring)

### leaderboard
- `getLeaderboard` — ranked users filtered by mode, region, period + current user's rank

### puzzle
- `listPuzzles` — browse puzzle sets by region/difficulty
- `startPuzzle` — start a puzzle session

---

## 5. Frontend Architecture

### Routing (App Router)
```
app/
├── (auth)/login, callback
├── (app)/
│   ├── page.tsx              — Dashboard
│   ├── play/
│   │   ├── quiz/[sessionId]  — Active quiz gameplay + results
│   │   └── puzzle/[puzzleId] — Active puzzle
│   ├── stats/                — Stats dashboard + history
│   ├── leaderboard/          — Global leaderboard
│   └── settings/             — User preferences
```

### Key Components
- **InteractiveMap** — React Simple Maps + D3-geo, SVG countries, zoom/pan
- **CountryPath** — memoized per-country SVG path with green/red feedback states
- **QuizHeader** — progress bar, timer, score
- **QuestionPrompt** — "Where is Brazil?"
- **AnswerFeedback** — green/red overlay + country name
- **SessionResults** — accuracy, rating change, streak, missed countries map

### State: Zustand (quiz) + TanStack Query (server)
- Zustand for synchronous quiz state (selected country, feedback, progress)
- TanStack Query via tRPC for all server data (stats, leaderboard, user)

---

## 6. Map Strategy

**React Simple Maps + D3-geo + TopoJSON**
- SVG-based: each country is a `<path>` — pixel-perfect click/tap
- TopoJSON world-110m (~50KB gzipped) for world view
- Mobile touch: custom gesture hook to distinguish tap vs pan vs pinch-to-zoom
- Performance: `React.memo` on CountryPath, only re-render changed countries
- No API key needed

---

## 7. Scoring System

### Glicko-2 Rating (simplified)
- Start at 1200, rating deviation (RD) 350
- Each question = match vs virtual opponent (difficulty 1=800, 5=1600)
- High RD (new player) = rating changes fast; Low RD (veteran) = stable
- Time bonus: <5s correct = +15%, >20s correct = -15%
- Session bonuses: 100% accuracy = +50, 90%+ = +25

### Rating Tiers
| Tier | Rating |
|------|--------|
| Beginner | 0-799 |
| Explorer | 800-999 |
| Traveler | 1000-1199 |
| Navigator | 1200-1399 |
| Cartographer | 1400-1599 |
| Geographer | 1600-1799 |
| Atlas | 1800-1999 |
| Globe Master | 2000+ |

### Streaks
- Play daily to maintain streak
- Miss 1 day with freeze = streak preserved (auto-consumed)
- Earn freezes: 7-day streak = +1, 30-day = +2 (max 3 stockpiled)

### Adaptive Difficulty
- 70% questions at player's level, 15% below, 15% above
- Deprioritize recently seen questions
- Prioritize previously missed (spaced repetition)

---

## 8. Project Structure

```
map-quest/
├── src/
│   ├── app/               — Next.js App Router pages
│   ├── components/
│   │   ├── map/           — InteractiveMap, CountryPath, MapControls
│   │   ├── quiz/          — QuizHeader, QuestionPrompt, AnswerFeedback
│   │   ├── stats/         — RatingChart, ActivityHeatmap, CountryMasteryMap
│   │   ├── dashboard/     — StreakBanner, QuickPlayCard, RatingSummaryCards
│   │   ├── leaderboard/   — LeaderboardTable, Filters, UserRankBadge
│   │   ├── auth/          — GoogleSignInButton, AuthGuard
│   │   └── ui/            — Shared primitives (shadcn/ui)
│   ├── server/
│   │   ├── routers/       — tRPC routers (auth, quiz, stats, leaderboard, puzzle)
│   │   ├── services/      — Business logic (QuizService, ScoringService, etc.)
│   │   ├── repositories/  — Data access (Drizzle queries)
│   │   └── middleware/     — Auth, rate limiting
│   ├── db/
│   │   ├── schema/        — Drizzle table definitions
│   │   ├── migrations/    — SQL migrations
│   │   └── seed/          — Question & puzzle seeding
│   ├── stores/            — Zustand (quiz-store)
│   ├── hooks/             — useMapGestures, useQuiz, useCountdownTimer
│   ├── lib/               — Supabase clients, tRPC setup, utils
│   ├── data/              — Country codes, regions, difficulty mappings
│   └── types/             — TypeScript interfaces
├── tests/
│   ├── unit/              — Scoring, quiz logic
│   ├── integration/       — tRPC router tests
│   └── e2e/               — Playwright flows
├── public/
│   ├── flags/             — Country flag SVGs
│   └── topojson/          — World atlas data
└── config files           — next.config, tailwind, drizzle, vitest, playwright
```

---

## 9. Phase Plan

| Phase | What | Key Deliverable |
|-------|------|-----------------|
| 0 | Project scaffolding | `pnpm dev` + `pnpm test` + Vercel preview deploys |
| 1 | Auth + core layout | Google login → dashboard with user name/avatar |
| 2 | Interactive map | Zoomable, tappable world map on mobile + desktop |
| 3 | Quiz MVP — Pin the Country | Full quiz loop: start → answer → green/red → results |
| 4 | Scoring system | Glicko-2 ratings, streaks, session results with rating delta |
| 5 | Stats dashboard | Rating chart, activity heatmap, country mastery map |
| 6 | Leaderboard | Global rankings by mode/region/period |
| 7 | Adaptive difficulty + polish | Smart question selection, sounds, haptics, performance |
| 8 | Puzzle mode | Curated 3-question sets |
| 9 | More game modes | Name the Country, Guess the Flag, Silhouette |
| 10 | Learning mode | Flashcards + spaced repetition (future) |

---

## Architecture Decision Records

### ADR-001: Monorepo (Next.js full-stack) vs Separate Frontend + Backend
**Decision:** Monorepo. For 1-2 devs, single deploy + shared types maximizes velocity. tRPC makes future extraction trivial.

### ADR-002: SVG Map vs WebGL/Canvas Map
**Decision:** SVG (React Simple Maps). 195 interactive polygons is perfect for SVG. WebGL is overkill with unnecessary complexity.

### ADR-003: Glicko-2 vs Simple ELO vs Points
**Decision:** Simplified Glicko-2. Rating deviation gives new players fast convergence while keeping veteran ratings stable. Great resume talking point.
