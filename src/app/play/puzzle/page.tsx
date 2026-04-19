'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FlagCard } from '@/components/quiz/flag-card';
import { ShapePreview } from '@/components/quiz/mixed/shape-preview';
import {
  getTodayPuzzleDayNumber,
  hasPlayedToday,
  loadPuzzleState,
  recordPuzzleCompletion,
  getTodayDateString,
  type PuzzleAttempt,
} from '@/lib/puzzle-state';
import { getPuzzleDay, type PuzzleQuestion, type PuzzleDay } from '@/data/puzzle-days';
import { getScoreTier, getEndMessage } from '@/data/end-messages';
import { getRandomFunFact } from '@/data/fun-facts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REVEAL_DELAY_CORRECT   = 1000;  // ms before advancing after correct
const REVEAL_DELAY_INCORRECT = 1800;  // ms before advancing after incorrect

const TYPE_ICONS: Record<PuzzleQuestion['type'], string> = {
  flag:       '🏳️',
  capital_mc: '🏛️',
  trivia:     '🌐',
  neighbor:   '🗺️',
  shape:      '🗺️',
};

const TYPE_LABELS: Record<PuzzleQuestion['type'], string> = {
  flag:       'Identify the Flag',
  capital_mc: 'Capital Challenge',
  trivia:     'Geography Trivia',
  neighbor:   'Neighbors & Borders',
  shape:      'Identify the Shape',
};

// ---------------------------------------------------------------------------
// Answer record
// ---------------------------------------------------------------------------

interface AnswerRecord {
  question: PuzzleQuestion;
  selected: string;
  correct: boolean;
}

// ---------------------------------------------------------------------------
// Back button
// ---------------------------------------------------------------------------

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Option button
// ---------------------------------------------------------------------------

function OptionButton({
  option,
  index,
  selected,
  correct,
  revealed,
  onSelect,
}: {
  option: string;
  index: number;
  selected: boolean;
  correct: boolean;
  revealed: boolean;
  onSelect: (o: string) => void;
}) {
  let cls = 'w-full py-3.5 px-5 rounded-2xl text-left font-bold text-base border-2 transition-all ';
  if (revealed) {
    if (correct)               cls += 'bg-board-green/10 border-board-green text-board-green';
    else if (selected)         cls += 'bg-red-50 border-red-400 text-red-600';
    else                       cls += 'bg-board-card border-board-border text-board-muted opacity-40';
  } else if (selected) {
    cls += 'bg-board-green/10 border-board-green text-board-green-dark';
  } else {
    cls += 'bg-board-card border-board-border text-board-text hover:bg-board-hover active:scale-[0.98]';
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 320, damping: 28 }}
      onClick={() => { if (!revealed) onSelect(option); }}
      className={cls}
    >
      {option}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Already-played screen
// ---------------------------------------------------------------------------

function AlreadyPlayedScreen({
  attempt,
  streak,
  bestStreak,
  dayNumber,
  puzzleDay,
  onHome,
}: {
  attempt: PuzzleAttempt;
  streak: number;
  bestStreak: number;
  dayNumber: number;
  puzzleDay: PuzzleDay;
  onHome: () => void;
}) {
  const tier = getScoreTier(attempt.score, 6);
  const msg  = useMemo(() => getEndMessage(tier), [tier]);
  const pct  = Math.round((attempt.score / 6) * 100);
  const mins = Math.floor(attempt.durationMs / 60_000);
  const secs = Math.round((attempt.durationMs % 60_000) / 1_000);

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3">
        <BackButton onClick={onHome} />
        <div>
          <h1 className="text-base font-extrabold text-board-text">Daily Puzzle</h1>
          <p className="text-xs text-board-muted">Day {dayNumber} — {puzzleDay.emoji} {puzzleDay.theme}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Already played banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="font-extrabold text-amber-700 text-sm">You already completed today&apos;s puzzle!</p>
            <p className="text-amber-600 text-xs mt-1">Come back tomorrow for a new one</p>
          </div>

          {/* Score circle */}
          <div className="bg-board-card border border-board-border rounded-3xl p-6 text-center space-y-2">
            <div className="w-24 h-24 rounded-full border-4 border-board-green bg-board-green/10 flex flex-col items-center justify-center mx-auto">
              <span className="text-3xl font-black text-board-green">{attempt.score}</span>
              <span className="text-xs text-board-muted font-bold">/ 6</span>
            </div>
            <p className="font-extrabold text-board-text text-lg mt-3">{msg}</p>
            <p className="text-board-muted text-sm">{pct}% correct</p>
            <p className="text-board-muted text-xs">
              {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
            </p>
          </div>

          {/* Streak */}
          <div className="bg-board-card border border-board-border rounded-2xl p-4 grid grid-cols-2 divide-x divide-board-border">
            <div className="text-center pr-4">
              <p className="text-2xl font-black text-board-text">{streak} 🔥</p>
              <p className="text-board-muted text-xs font-bold uppercase tracking-wider mt-0.5">Current Streak</p>
            </div>
            <div className="text-center pl-4">
              <p className="text-2xl font-black text-board-text">{bestStreak}</p>
              <p className="text-board-muted text-xs font-bold uppercase tracking-wider mt-0.5">Best Streak</p>
            </div>
          </div>

          <button
            onClick={onHome}
            className="w-full py-4 rounded-2xl bg-board-card border border-board-border text-board-text font-bold text-base hover:bg-board-hover transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Playing screen
// ---------------------------------------------------------------------------

function PlayingScreen({
  puzzleDay,
  dayNumber,
  onComplete,
  onBack,
}: {
  puzzleDay: PuzzleDay;
  dayNumber: number;
  onComplete: (answers: AnswerRecord[], durationMs: number) => void;
  onBack: () => void;
}) {
  const [qIndex,   setQIndex]   = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers,  setAnswers]  = useState<AnswerRecord[]>([]);
  const startMs = useRef(Date.now());

  const question = puzzleDay.questions[qIndex];
  const total    = puzzleDay.questions.length;
  const progress = qIndex / total;

  const handleSelect = useCallback((option: string) => {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);

    const correct = option === question.answer;
    const record: AnswerRecord = { question, selected: option, correct };

    const delay = correct ? REVEAL_DELAY_CORRECT : REVEAL_DELAY_INCORRECT;
    setTimeout(() => {
      const next = [...answers, record];
      if (qIndex + 1 >= total) {
        onComplete(next, Date.now() - startMs.current);
      } else {
        setAnswers(next);
        setQIndex(qIndex + 1);
        setSelected(null);
        setRevealed(false);
      }
    }, delay);
  }, [revealed, question, answers, qIndex, total, onComplete]);

  const isFlag  = question.type === 'flag';
  const isShape = question.type === 'shape';

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <BackButton onClick={onBack} />
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold text-board-text">
            Daily Puzzle — Day {dayNumber}
          </h1>
          <p className="text-xs text-board-muted">{puzzleDay.emoji} {puzzleDay.theme}</p>
        </div>
        <span className="text-xs font-bold text-board-muted shrink-0">
          {qIndex + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-board-border/40">
        <motion.div
          className="h-full bg-board-green"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col gap-4 w-full"
          >
            {/* Type badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-base">{TYPE_ICONS[question.type]}</span>
              <span className="text-[11px] font-bold text-board-muted uppercase tracking-wider">
                {TYPE_LABELS[question.type]}
              </span>
            </div>

            {/* Flag */}
            {isFlag && question.flagAlpha2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="w-full max-w-[280px] mx-auto"
              >
                <FlagCard
                  alpha2={question.flagAlpha2}
                  countryName=""
                  className="w-full rounded-2xl shadow-lg"
                />
              </motion.div>
            )}

            {/* Shape */}
            {isShape && question.shapeAlpha3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="flex justify-center"
              >
                <div className="bg-board-card border-2 border-board-border rounded-2xl p-4 inline-flex flex-col items-center gap-1">
                  <ShapePreview alpha3={question.shapeAlpha3} width={220} height={160} />
                  {question.hint && (
                    <p className="text-[11px] text-board-muted font-semibold">{question.hint}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Question text */}
            <p className="text-lg font-extrabold text-board-text text-center leading-snug px-1">
              {question.question}
            </p>

            {/* Non-shape hint */}
            {question.hint && !isShape && (
              <p className="text-xs text-board-muted text-center italic">{question.hint}</p>
            )}

            {/* Options */}
            <div className="flex flex-col gap-2.5 w-full mt-1">
              {question.options.map((opt, i) => (
                <OptionButton
                  key={opt}
                  option={opt}
                  index={i}
                  selected={selected === opt}
                  correct={opt === question.answer}
                  revealed={revealed}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {/* Feedback bar */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className={`rounded-2xl p-3 text-center text-sm font-bold ${
                    selected === question.answer
                      ? 'bg-board-green/10 text-board-green border border-board-green/30'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {selected === question.answer
                    ? '✓ Correct!'
                    : `✗ The answer is ${question.answer}`}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------

function ResultsScreen({
  answers,
  dayNumber,
  puzzleDay,
  durationMs,
  streak,
  bestStreak,
  onHome,
}: {
  answers: AnswerRecord[];
  dayNumber: number;
  puzzleDay: PuzzleDay;
  durationMs: number;
  streak: number;
  bestStreak: number;
  onHome: () => void;
}) {
  const correct = answers.filter(a => a.correct).length;
  const total   = answers.length;
  const tier    = getScoreTier(correct, total);
  const msg     = useMemo(() => getEndMessage(tier), [tier]);
  const funFact = useMemo(() => getRandomFunFact('world'), []);
  const pct     = Math.round((correct / total) * 100);
  const mins    = Math.floor(durationMs / 60_000);
  const secs    = Math.round((durationMs % 60_000) / 1_000);

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <div>
          <h1 className="text-base font-extrabold text-board-text">Puzzle Complete!</h1>
          <p className="text-xs text-board-muted">Day {dayNumber} — {puzzleDay.emoji} {puzzleDay.theme}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="bg-board-card border border-board-border rounded-3xl p-6 text-center space-y-3"
        >
          <div className="w-24 h-24 rounded-full border-4 border-board-green bg-board-green/10 flex flex-col items-center justify-center mx-auto">
            <span className="text-3xl font-black text-board-green">{correct}</span>
            <span className="text-xs text-board-muted font-bold">/ {total}</span>
          </div>
          <p className="font-extrabold text-board-text text-xl leading-tight">{msg}</p>
          <div className="flex items-center justify-center gap-4 text-sm text-board-muted">
            <span>{pct}% correct</span>
            <span>·</span>
            <span>{mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}</span>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-board-card border border-board-border rounded-2xl p-4 grid grid-cols-2 divide-x divide-board-border"
        >
          <div className="text-center pr-4">
            <p className="text-2xl font-black text-board-text">{streak} 🔥</p>
            <p className="text-board-muted text-xs font-bold uppercase tracking-wider mt-0.5">Current Streak</p>
          </div>
          <div className="text-center pl-4">
            <p className="text-2xl font-black text-board-text">{bestStreak}</p>
            <p className="text-board-muted text-xs font-bold uppercase tracking-wider mt-0.5">Best Streak</p>
          </div>
        </motion.div>

        {/* Fun fact */}
        {funFact && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-ocean-500/8 border border-ocean-500/20 rounded-2xl p-4"
          >
            <p className="text-[10px] font-bold text-ocean-500 uppercase tracking-wider mb-1.5">
              Did you know?
            </p>
            <p className="text-board-text text-sm font-medium leading-snug">{funFact}</p>
          </motion.div>
        )}

        {/* Review list */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Review</p>
          <div className="space-y-2">
            {answers.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
                  a.correct
                    ? 'bg-board-green/5 border-board-green/20'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <span className={`font-bold shrink-0 mt-0.5 ${a.correct ? 'text-board-green' : 'text-red-500'}`}>
                  {a.correct ? '✓' : '✗'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-board-text leading-snug line-clamp-2">{a.question.question}</p>
                  {!a.correct && (
                    <p className="text-xs text-board-muted mt-0.5">
                      You: <span className="text-red-500 font-bold">{a.selected}</span>
                      {' · '}
                      Correct: <span className="text-board-green font-bold">{a.question.answer}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <button
          onClick={onHome}
          className="w-full py-4 rounded-2xl bg-board-card border border-board-border text-board-text font-bold text-base hover:bg-board-hover transition-colors"
        >
          Back to Home
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Phase = 'checking' | 'already-played' | 'playing' | 'results';

export default function PuzzlePage() {
  const router = useRouter();
  const [phase,     setPhase]     = useState<Phase>('checking');
  const [dayNumber, setDayNumber] = useState(1);
  const [puzzleDay, setPuzzleDay] = useState<PuzzleDay | null>(null);
  const [answers,   setAnswers]   = useState<AnswerRecord[]>([]);
  const [durationMs, setDurationMs] = useState(0);
  const [puzzleState, setPuzzleState] = useState(loadPuzzleState());

  useEffect(() => {
    const day  = getTodayPuzzleDayNumber();
    const pd   = getPuzzleDay(day);
    setDayNumber(day);
    setPuzzleDay(pd);

    if (hasPlayedToday()) {
      setPhase('already-played');
    } else {
      setPhase('playing');
    }
  }, []);

  const handleComplete = useCallback((recs: AnswerRecord[], ms: number) => {
    const score = recs.filter(r => r.correct).length;
    const next  = recordPuzzleCompletion(score, ms);
    setAnswers(recs);
    setDurationMs(ms);
    setPuzzleState(next);
    setPhase('results');
  }, []);

  const goHome = useCallback(() => router.push('/'), [router]);

  if (phase === 'checking' || !puzzleDay) {
    return (
      <div className="min-h-screen bg-board-bg flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="text-4xl"
        >
          🧩
        </motion.div>
      </div>
    );
  }

  if (phase === 'already-played') {
    const todayAttempt = puzzleState.history.find(a => a.date === getTodayDateString());
    if (!todayAttempt) { setPhase('playing'); return null; }
    return (
      <AlreadyPlayedScreen
        attempt={todayAttempt}
        streak={puzzleState.streak}
        bestStreak={puzzleState.bestStreak}
        dayNumber={dayNumber}
        puzzleDay={puzzleDay}
        onHome={goHome}
      />
    );
  }

  if (phase === 'results') {
    return (
      <ResultsScreen
        answers={answers}
        dayNumber={dayNumber}
        puzzleDay={puzzleDay}
        durationMs={durationMs}
        streak={puzzleState.streak}
        bestStreak={puzzleState.bestStreak}
        onHome={goHome}
      />
    );
  }

  return (
    <PlayingScreen
      puzzleDay={puzzleDay}
      dayNumber={dayNumber}
      onComplete={handleComplete}
      onBack={goHome}
    />
  );
}
