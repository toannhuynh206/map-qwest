import { create } from 'zustand';
import type { TypingEntry } from '@/lib/typing-match';
import type { MapTheme } from '@/types/quiz-config';

export type TypingStatus = 'idle' | 'playing' | 'finished';

interface TypingState {
  status: TypingStatus;
  mode: 'countries' | 'states';
  pool: TypingEntry[];
  guessed: string[];     // codes in order guessed (most recent last)
  revealed: string[];    // codes shown in gray after give-up / timeout
  theme: MapTheme;
  timeLimit: number | null;  // seconds; null = no limit
  startedAt: number;
  finishedAt: number | null;

  start: (opts: {
    mode: 'countries' | 'states';
    pool: TypingEntry[];
    theme: MapTheme;
    timeLimit: number | null;
  }) => void;
  addGuess: (code: string) => void;
  giveUp: () => void;
  reset: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  status: 'idle',
  mode: 'countries',
  pool: [],
  guessed: [],
  revealed: [],
  theme: 'classic',
  timeLimit: null,
  startedAt: 0,
  finishedAt: null,

  start: ({ mode, pool, theme, timeLimit }) =>
    set({
      status: 'playing',
      mode,
      pool,
      guessed: [],
      revealed: [],
      theme,
      timeLimit,
      startedAt: Date.now(),
      finishedAt: null,
    }),

  addGuess: (code) => {
    const state = get();
    if (state.status !== 'playing') return;
    const newGuessed = [...state.guessed, code];
    const finished = newGuessed.length === state.pool.length;
    set({
      guessed: newGuessed,
      ...(finished ? { status: 'finished', finishedAt: Date.now() } : {}),
    });
  },

  giveUp: () => {
    const state = get();
    if (state.status !== 'playing') return;
    const guessedSet = new Set(state.guessed);
    const revealed = state.pool
      .map((e) => e.code)
      .filter((c) => !guessedSet.has(c));
    set({ status: 'finished', finishedAt: Date.now(), revealed });
  },

  reset: () =>
    set({
      status: 'idle',
      pool: [],
      guessed: [],
      revealed: [],
      theme: 'classic',
      timeLimit: null,
      startedAt: 0,
      finishedAt: null,
    }),
}));
