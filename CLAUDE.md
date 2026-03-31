# Map Qwest

A mobile-first geography quiz and learning web app. Pin countries on a map, guess flags, learn US states — with chess.com-style ratings and streaks.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **State:** Zustand (client quiz state) + TanStack Query (server state via tRPC)
- **API:** tRPC v11 — end-to-end type safe, runs inside Next.js API routes
- **Database:** PostgreSQL via Supabase (managed, free tier)
- **ORM:** Drizzle ORM — SQL-like, thin, great TypeScript inference
- **Auth:** Supabase Auth with Google OAuth (PKCE flow)
- **Map:** React Simple Maps + D3-geo + TopoJSON (SVG, no API key)
- **Testing:** Vitest (unit) + Testing Library (components) + Playwright (E2E)
- **Hosting:** Digital Ocean droplet (1GB, shared with other projects) + Supabase (DB + Auth + Storage)
- **Deployment:** Docker + nginx reverse proxy + Let's Encrypt SSL
- **Package Manager:** npm (not npm run)

## Architecture

Full architecture doc: `docs/ARCHITECTURE.md`

### Layered Backend
```
tRPC Routers → Services (business logic) → Repositories (Drizzle queries) → Supabase Postgres
```

### Key Patterns
- **Immutability:** All state updates return new objects, never mutate
- **Repository pattern:** Data access behind consistent interfaces
- **Optimistic UI:** Quiz answers highlight immediately, server validates async
- **Memoized map:** Each of 195 CountryPath components uses React.memo with Zustand selectors

## Project Structure

```
src/
├── app/          — Next.js App Router pages
├── components/   — Organized by feature: map/, quiz/, stats/, dashboard/, auth/, ui/
├── server/       — tRPC routers, services, repositories, middleware
├── db/           — Drizzle schema, migrations, seed scripts
├── stores/       — Zustand stores
├── hooks/        — Custom React hooks
├── lib/          — Supabase clients, tRPC setup, utils
├── data/         — Country codes, regions, difficulty mappings
└── types/        — TypeScript interfaces
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # ESLint
npm run db:push      # Push schema changes to Supabase
npm run db:migrate   # Run Drizzle migrations
npm run db:seed      # Seed questions and puzzle data
npm run db:studio    # Open Drizzle Studio (DB browser)
```

## Environment Variables

Required in `.env.local` (see `.env.example`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

## Game Modes

1. **Quiz Mode** (building first)
   - Pin the Country — shown country name, tap correct country on map
   - Name the Country — highlighted country, pick from multiple choice (future)
   - Guess the Flag — shown flag, tap correct country (future)
   - Silhouette — shown outline, identify the country (future)

2. **Puzzle Mode** — curated 3-question sets, managed via seed data

3. **Learning Mode** — flashcards + spaced repetition for countries, flags, US states (future)

## Scoring

- **Glicko-2 rating** starting at 1200, per game mode + region
- **Difficulty tiers:** 1 (France, USA) to 5 (Eswatini, Comoros)
- **Time bonus:** <5s = +15%, >20s = -15% on correct answers
- **Rating tiers:** Beginner → Explorer → Traveler → Navigator → Cartographer → Geographer → Atlas → Globe Master
- **Daily streaks** with freeze mechanic (earned through play)

## Development Guidelines

- Mobile-first — test on phone-sized viewport, 44px minimum tap targets
- Files under 800 lines, functions under 50 lines
- Organize by feature domain (map/, quiz/, stats/) not by type
- All server data through tRPC, all quiz state through Zustand
- Country codes use ISO 3166-1 alpha-3 (BRA, USA, FRA)
- Validate at boundaries only (tRPC input schemas via Zod)
- No mocking the database in integration tests — use Supabase test project

## Current Phase

Phase 0 — Project scaffolding. See `docs/ARCHITECTURE.md` § Phase Plan for full roadmap.

## Repo

https://github.com/toannhuynh206/map-qwest
