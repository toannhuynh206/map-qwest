# Map Qwest — Project Status

## Current Phase: 0 — Project Scaffolding
**Status:** Not Started
**Goal:** Working dev environment with all tooling configured

---

## Phase Tracker

| # | Phase | Status | Depends On |
|---|-------|--------|------------|
| 0 | Project Scaffolding | NOT STARTED | — |
| 1 | Auth + Core Layout | NOT STARTED | Phase 0 |
| 2 | Interactive Map | NOT STARTED | Phase 1 |
| 3 | Quiz MVP — Pin the Country | NOT STARTED | Phase 2 |
| 4 | Scoring System | NOT STARTED | Phase 3 |
| 5 | Stats Dashboard | NOT STARTED | Phase 4 |
| 6 | Leaderboard | NOT STARTED | Phase 4 |
| 7 | Adaptive Difficulty + Polish | NOT STARTED | Phase 5, 6 |
| 8 | Puzzle Mode | NOT STARTED | Phase 3 |
| 9 | More Game Modes | NOT STARTED | Phase 7 |
| 10 | Learning Mode | NOT STARTED | Phase 7 |

---

## Phase 0 — Project Scaffolding

### Tasks
- [ ] Initialize Next.js 15 with TypeScript + Tailwind + App Router
- [ ] Install core dependencies (tRPC, Drizzle, Supabase, Zustand, TanStack Query, React Simple Maps, Framer Motion)
- [ ] Configure tRPC with Next.js App Router integration
- [ ] Configure Drizzle ORM with Supabase connection string
- [ ] Set up Vitest + Testing Library
- [ ] Set up Playwright for E2E
- [ ] Configure ESLint + Prettier
- [ ] Create .env.example with required variables
- [ ] Set up project folder structure (src/components, server, db, stores, hooks, lib, data, types)
- [ ] Create initial Drizzle schema files (empty table definitions)
- [ ] Verify `pnpm dev` starts cleanly
- [ ] Verify `pnpm test` runs cleanly
- [ ] Push to GitHub
- [ ] Deploy empty app to Vercel (verify pipeline)

### Definition of Done
- `pnpm dev` starts Next.js on localhost
- `pnpm test` runs Vitest with 0 failures
- `pnpm build` produces a production build
- Vercel preview deploys on push
- All folder structure in place
- .env.example documents all required env vars

---

## Phase 1 — Auth + Core Layout

### Tasks
- [ ] Create Supabase project (database + auth)
- [ ] Configure Google OAuth in Supabase dashboard
- [ ] Create users table schema + migration
- [ ] Create Postgres trigger: auto-create profile on first auth
- [ ] Build Supabase client (browser) and server client
- [ ] Build tRPC auth middleware (protectedProcedure)
- [ ] Build auth router (getSession, updatePreferences)
- [ ] Build login page with Google sign-in button
- [ ] Build auth callback route handler
- [ ] Build AuthGuard component (redirect if unauthenticated)
- [ ] Build app shell layout (mobile bottom nav + desktop sidebar)
- [ ] Build dashboard page (placeholder — user name + avatar)
- [ ] Write integration test for auth flow
- [ ] Mobile test: login flow works on phone

### Definition of Done
- User clicks "Sign in with Google" → sees dashboard with their name/avatar
- Unauthenticated users redirected to login
- User record created in Postgres on first login
- Mobile nav works on small screens

---

## Phase 2 — Interactive Map

### Tasks
- [ ] Install react-simple-maps + world-atlas TopoJSON
- [ ] Build InteractiveMap component with ComposableMap + ZoomableGroup
- [ ] Build CountryPath component (memoized, green/red/blue states)
- [ ] Build country data mapping (numeric → alpha-3 → name)
- [ ] Build useMapGestures hook (tap vs pan vs pinch-to-zoom)
- [ ] Build MapControls component (zoom +/-, reset)
- [ ] Build map tooltip (country name on hover/long-press)
- [ ] Test on iOS Safari + Chrome Android
- [ ] Verify <16ms re-render for country highlight
- [ ] Write unit tests for country code mapping

### Definition of Done
- User can zoom, pan, and tap countries on phone and desktop
- Countries highlight on tap with smooth transitions
- No accidental selections when panning
- All 195 countries are tappable and correctly identified

---

## Phase 3 — Quiz MVP (Pin the Country)

### Tasks
- [ ] Create quiz_questions, quiz_sessions, quiz_attempts schemas + migrations
- [ ] Seed 195 "Pin the Country" questions (all UN member states)
- [ ] Build QuestionSelector service (random for MVP)
- [ ] Build QuizService (startSession, submitAnswer, completeSession)
- [ ] Build quiz tRPC router
- [ ] Build Zustand quiz store
- [ ] Build QuizConfigForm (region selector, question count)
- [ ] Build QuizHeader (progress bar, question counter, timer)
- [ ] Build QuestionPrompt ("Where is Brazil?")
- [ ] Integrate InteractiveMap with quiz store (tap = submit answer)
- [ ] Build AnswerFeedback (green/red highlight + correct country name)
- [ ] Build SessionResults page (accuracy, time, attempts list)
- [ ] Add Framer Motion animations for feedback
- [ ] Write E2E test: full quiz flow start → answer → results
- [ ] Write unit tests for QuizService

### Definition of Done
- User selects region + count → plays full quiz → sees results
- Green/red feedback on each answer with 1s pause before next
- Results show accuracy %, time, and list of all attempts
- Works smoothly on mobile (no jank, good touch targets)

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-31 | Next.js 15 + tRPC monorepo | Max velocity for 1-dev team, end-to-end type safety |
| 2026-03-31 | Supabase for DB + Auth | Free tier, managed Postgres, built-in Google OAuth |
| 2026-03-31 | React Simple Maps (SVG) | 195 countries = perfect for SVG, no API key needed |
| 2026-03-31 | Glicko-2 rating system | Fair for new + experienced players, great resume piece |
| 2026-03-31 | Repo name: map-qwest | User's choice |

---

## Blockers & Risks

| Risk | Mitigation |
|------|------------|
| Small countries hard to tap on mobile | Zoom-to-region + generous hit areas + confirmation UI |
| Supabase free tier limits | 500MB DB, 50K MAU — plenty for MVP, upgrade if needed |
| TopoJSON country boundaries not matching ISO codes | Use verified world-atlas package + manual mapping table |
| Google OAuth setup complexity | Follow Supabase docs, test in development mode first |
