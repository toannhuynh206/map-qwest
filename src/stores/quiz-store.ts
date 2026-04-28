import { create } from 'zustand';
import type { CountryFeedback } from '@/components/map/country-path';
import type { QuizConfig } from '@/types/quiz-config';

export interface QuizQuestion {
  countryCode: string;
  countryName: string;
  difficulty: number;
  region: string;
}

export interface QuizAttempt {
  questionIndex: number;
  selectedCode: string;
  correctCode: string;
  correct: boolean;
  timeMs: number;
}

type QuizStatus = 'idle' | 'playing' | 'feedback' | 'results';

interface QuizState {
  status: QuizStatus;
  questions: QuizQuestion[];
  currentIndex: number;
  attempts: QuizAttempt[];
  feedbackMap: Record<string, CountryFeedback>;
  dimmedCountries: Set<string>;
  questionStartTime: number;
  score: number;
  currentStreak: number;
  bestStreak: number;
  bestTimeMs: number;
  hintsUsed: number;
  skippedIndices: number[];
  mapKey: number;
  quizConfig: QuizConfig | null;

  startQuiz: (questions: QuizQuestion[], config: QuizConfig) => void;
  timeoutQuestion: () => void;
  submitAnswer: (selectedCode: string) => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  useHint: (allCountryCodes: string[], getRegion: (code: string) => string | undefined) => void;
  useFiftyFifty: (allCountryCodes: string[]) => void;
  quitQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  status: 'idle',
  questions: [],
  currentIndex: 0,
  attempts: [],
  feedbackMap: {},
  dimmedCountries: new Set(),
  questionStartTime: 0,
  score: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestTimeMs: Infinity,
  hintsUsed: 0,
  skippedIndices: [],
  mapKey: 0,
  quizConfig: null,

  startQuiz: (questions, config) =>
    set((state) => ({
      status: 'playing',
      questions,
      currentIndex: 0,
      attempts: [],
      feedbackMap: {},
      dimmedCountries: new Set(),
      questionStartTime: Date.now(),
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestTimeMs: Infinity,
      hintsUsed: 0,
      skippedIndices: [],
      mapKey: state.mapKey + 1,
      quizConfig: config,
    })),

  timeoutQuestion: () => {
    const state = get();
    if (state.status !== 'playing') return;
    const currentQuestion = state.questions[state.currentIndex];
    const newFeedbackMap = {
      ...state.feedbackMap,
      [currentQuestion.countryCode]: 'reveal' as CountryFeedback,
    };
    const attempt: QuizAttempt = {
      questionIndex: state.currentIndex,
      selectedCode: '',
      correctCode: currentQuestion.countryCode,
      correct: false,
      timeMs: state.quizConfig ? (state.quizConfig.timer !== 'off' ? Date.now() - state.questionStartTime : 0) : 0,
    };
    set({
      status: 'feedback',
      attempts: [...state.attempts, attempt],
      feedbackMap: newFeedbackMap,
      dimmedCountries: new Set(),
      currentStreak: 0,
    });
  },

  submitAnswer: (selectedCode) => {
    const state = get();
    if (state.status !== 'playing') return;

    const currentQuestion = state.questions[state.currentIndex];
    const correct = selectedCode === currentQuestion.countryCode;
    const timeMs = Date.now() - state.questionStartTime;

    const attempt: QuizAttempt = {
      questionIndex: state.currentIndex,
      selectedCode,
      correctCode: currentQuestion.countryCode,
      correct,
      timeMs,
    };

    const newFeedbackMap = { ...state.feedbackMap };
    if (correct) {
      newFeedbackMap[selectedCode] = 'correct';
    } else {
      newFeedbackMap[selectedCode] = 'incorrect';
      newFeedbackMap[currentQuestion.countryCode] = 'reveal';
    }

    const newStreak = correct ? state.currentStreak + 1 : 0;
    const newBestTime = correct && timeMs < state.bestTimeMs ? timeMs : state.bestTimeMs;

    set({
      status: 'feedback',
      attempts: [...state.attempts, attempt],
      feedbackMap: newFeedbackMap,
      dimmedCountries: new Set(),
      score: correct ? state.score + 1 : state.score,
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, state.bestStreak),
      bestTimeMs: newBestTime,
    });
  },

  nextQuestion: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.questions.length) {
      set({ status: 'results' });
      return;
    }

    const keepFeedback = state.quizConfig?.persistFeedback ?? false;

    let nextFeedbackMap: Record<string, CountryFeedback> = {};
    if (keepFeedback) {
      for (const attempt of state.attempts) {
        nextFeedbackMap[attempt.correctCode] = attempt.correct ? 'correct-locked' : 'incorrect-locked';
      }
    }

    set({
      status: 'playing',
      currentIndex: nextIndex,
      feedbackMap: nextFeedbackMap,
      dimmedCountries: new Set(),
      questionStartTime: Date.now(),
    });
  },

  skipQuestion: () => {
    const state = get();
    if (state.status !== 'playing') return;

    const currentQuestion = state.questions[state.currentIndex];

    // Move current question to the end
    const newQuestions = [
      ...state.questions.slice(0, state.currentIndex),
      ...state.questions.slice(state.currentIndex + 1),
      currentQuestion,
    ];

    set({
      questions: newQuestions,
      feedbackMap: {},
      dimmedCountries: new Set(),
      questionStartTime: Date.now(),
      skippedIndices: [...state.skippedIndices, state.currentIndex],
    });
  },

  useHint: (allCountryCodes, getRegion) => {
    const state = get();
    if (state.status !== 'playing') return;

    const currentQuestion = state.questions[state.currentIndex];
    const correctRegion   = currentQuestion.region;

    // Dim all countries that are NOT in the same region as the correct answer.
    // The correct country itself is never dimmed.
    const dimmed = new Set(
      allCountryCodes.filter((code) => {
        if (code === currentQuestion.countryCode) return false;
        return getRegion(code) !== correctRegion;
      }),
    );

    set({
      dimmedCountries: dimmed,
      hintsUsed: state.hintsUsed + 1,
    });
  },

  useFiftyFifty: (allCountryCodes) => {
    const state = get();
    if (state.status !== 'playing') return;

    const currentQuestion = state.questions[state.currentIndex];
    const correctCode = currentQuestion.countryCode;

    // Keep the correct country and randomly keep ~half, dim the rest
    const otherCodes = allCountryCodes.filter((c) => c !== correctCode);
    const shuffled = [...otherCodes].sort(() => Math.random() - 0.5);
    const toDim = shuffled.slice(0, Math.floor(shuffled.length / 2));

    set({
      dimmedCountries: new Set(toDim),
      hintsUsed: state.hintsUsed + 1,
    });
  },

  quitQuiz: () => set({ status: 'results' }),

  resetQuiz: () =>
    set({
      status: 'idle',
      questions: [],
      currentIndex: 0,
      attempts: [],
      feedbackMap: {},
      dimmedCountries: new Set(),
      questionStartTime: 0,
      score: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestTimeMs: Infinity,
      hintsUsed: 0,
      skippedIndices: [],
      mapKey: 0,
      quizConfig: null,
    }),
}));
