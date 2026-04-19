/**
 * Daily puzzle state management — localStorage for guests.
 * One attempt per day, UTC midnight rollover, streak tracking.
 *
 * Future: sync to Supabase `user_puzzle_attempts` + `user_puzzle_streaks`
 * when auth is implemented.
 */

const STORAGE_KEY = 'mapqwest_puzzle_state';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PuzzleAttempt {
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  /** Day number (1-30) played on that date */
  dayNumber: number;
  /** Number of correct answers out of 6 */
  score: number;
  /** ms taken to complete */
  durationMs: number;
}

export interface PuzzleState {
  /** Current streak in days (consecutive days played) */
  streak: number;
  /** Best streak ever */
  bestStreak: number;
  /** Total puzzles completed */
  totalPlayed: number;
  /** History of all attempts (most recent last) */
  history: PuzzleAttempt[];
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Returns today's date as "YYYY-MM-DD" in UTC. */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the 1-based puzzle day number (1–30) for today.
 *
 * Uses NEXT_PUBLIC_PUZZLE_LAUNCH_DATE env var (YYYY-MM-DD).
 * Falls back to a fixed base date so local dev always works.
 *
 * Set ?day=N in the URL to override (dev/testing only).
 */
export function getTodayPuzzleDayNumber(): number {
  // URL override for dev/testing
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const override = params.get('day');
    if (override) {
      const n = parseInt(override, 10);
      if (!isNaN(n) && n >= 1 && n <= 30) return n;
    }
  }

  const launchStr =
    process.env.NEXT_PUBLIC_PUZZLE_LAUNCH_DATE ?? '2024-01-01';
  const launchDate = new Date(`${launchStr}T00:00:00Z`);
  const todayDate = new Date(`${getTodayDateString()}T00:00:00Z`);
  const daysSinceLaunch = Math.floor(
    (todayDate.getTime() - launchDate.getTime()) / 86_400_000,
  );
  return (((daysSinceLaunch % 30) + 30) % 30) + 1;
}

// ---------------------------------------------------------------------------
// State I/O
// ---------------------------------------------------------------------------

function emptyState(): PuzzleState {
  return { streak: 0, bestStreak: 0, totalPlayed: 0, history: [] };
}

export function loadPuzzleState(): PuzzleState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return JSON.parse(raw) as PuzzleState;
  } catch {
    return emptyState();
  }
}

function savePuzzleState(state: PuzzleState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export function hasPlayedToday(): boolean {
  const state = loadPuzzleState();
  const today = getTodayDateString();
  return state.history.some((a) => a.date === today);
}

export function getTodayAttempt(): PuzzleAttempt | null {
  const state = loadPuzzleState();
  const today = getTodayDateString();
  return state.history.find((a) => a.date === today) ?? null;
}

// ---------------------------------------------------------------------------
// Record a completed puzzle
// ---------------------------------------------------------------------------

export function recordPuzzleCompletion(
  score: number,
  durationMs: number,
): PuzzleState {
  const prev = loadPuzzleState();
  const today = getTodayDateString();

  // Prevent duplicate entries
  if (prev.history.some((a) => a.date === today)) return prev;

  const attempt: PuzzleAttempt = {
    date: today,
    dayNumber: getTodayPuzzleDayNumber(),
    score,
    durationMs,
  };

  // Streak calculation
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const lastAttempt = prev.history.at(-1);
  let newStreak: number;
  if (!lastAttempt) {
    newStreak = 1;
  } else if (lastAttempt.date === yesterdayStr) {
    newStreak = prev.streak + 1;
  } else {
    newStreak = 1;
  }

  const next: PuzzleState = {
    streak: newStreak,
    bestStreak: Math.max(prev.bestStreak, newStreak),
    totalPlayed: prev.totalPlayed + 1,
    history: [...prev.history, attempt],
  };

  savePuzzleState(next);
  return next;
}
