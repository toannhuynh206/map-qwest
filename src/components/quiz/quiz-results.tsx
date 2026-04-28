'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getScoreTier, getEndMessage } from '@/data/end-messages';
import { getRandomFunFact, type FactCategory } from '@/data/fun-facts';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  attempts: {
    questionIndex: number;
    selectedCode: string;
    correctCode: string;
    correct: boolean;
    timeMs: number;
  }[];
  countryNames: Record<string, string>;
  onPlayAgain: () => void;
  onGoHome: () => void;
  factCategory?: FactCategory;
}

export function QuizResults({
  score,
  totalQuestions,
  attempts,
  countryNames,
  onPlayAgain,
  onGoHome,
  factCategory = 'world',
}: QuizResultsProps) {
  const accuracy  = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const avgTimeMs = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.timeMs, 0) / attempts.length)
    : 0;

  // Stable per-mount so re-renders don't re-roll
  const endMessage = useMemo(() => getEndMessage(getScoreTier(score, totalQuestions)), [score, totalQuestions]);
  const funFact    = useMemo(() => getRandomFunFact(factCategory), [factCategory]);

  const emoji =
    accuracy === 100 ? '🏆' :
    accuracy >= 80   ? '🌟' :
    accuracy >= 60   ? '🎯' :
    accuracy >= 40   ? '💪' : '📚';

  return (
    <div className="flex flex-col items-center px-5 py-8 h-full overflow-y-auto bg-board-bg">
      {/* Score circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        className="w-32 h-32 rounded-full bg-board-green flex flex-col items-center justify-center mb-4 shadow-lg"
      >
        <span className="text-3xl">{emoji}</span>
        <span className="text-white font-black text-3xl">{accuracy}%</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-black text-board-text mb-1 text-center"
      >
        {endMessage}
      </motion.h2>

      <p className="text-board-muted mb-5 text-center">
        {score} of {totalQuestions} correct &middot; avg {(avgTimeMs / 1000).toFixed(1)}s
      </p>

      {/* Fun fact */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm mb-6 bg-board-card border border-board-border rounded-2xl px-4 py-3 flex gap-3 items-start"
      >
        <span className="text-xl shrink-0">🌍</span>
        <div>
          <p className="text-[10px] font-bold text-board-green uppercase tracking-wider mb-0.5">Did you know?</p>
          <p className="text-sm text-board-text leading-snug">{funFact}</p>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-sm mb-8">
        <button
          onClick={onPlayAgain}
          className="flex-1 py-3 bg-board-green text-white font-bold rounded-xl btn-chunky hover:bg-board-green-dark"
        >
          Play Again
        </button>
        <button
          onClick={onGoHome}
          className="flex-1 py-3 bg-board-card text-board-text font-bold rounded-xl btn-chunky border border-board-border hover:bg-board-hover"
        >
          Home
        </button>
      </div>

      {/* Attempt list */}
      <div className="w-full max-w-sm space-y-2">
        <h3 className="font-bold text-board-muted text-sm uppercase tracking-wider mb-3">Review</h3>
        {attempts.map((attempt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl bg-board-card border border-board-border"
          >
            <div className="flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                attempt.correct ? 'bg-board-green' : 'bg-red-400'
              }`}>
                {attempt.correct ? '✓' : '✗'}
              </span>
              <span className="font-bold text-sm text-board-text">
                {countryNames[attempt.correctCode] || attempt.correctCode}
              </span>
            </div>
            <span className="text-xs text-board-muted font-semibold">
              {(attempt.timeMs / 1000).toFixed(1)}s
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
