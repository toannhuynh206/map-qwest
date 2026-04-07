'use client';

import { motion } from 'framer-motion';

interface QuizToolbarProps {
  onSkip: () => void;
  onHint: () => void;
  onFiftyFifty: () => void;
  disabled: boolean;
  hintsUsed: number;
}

export function QuizToolbar({
  onSkip,
  onHint,
  onFiftyFifty,
  disabled,
  hintsUsed,
}: QuizToolbarProps) {
  const maxHints = 3;
  const hintsRemaining = maxHints - hintsUsed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute bottom-4 left-4 flex gap-2 z-10"
    >
      <button
        onClick={onSkip}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-2 bg-board-card border border-board-border rounded-xl text-sm font-bold text-board-muted hover:bg-board-hover disabled:opacity-30 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
        Skip
      </button>

      <button
        onClick={onFiftyFifty}
        disabled={disabled || hintsRemaining <= 0}
        className="flex items-center gap-1.5 px-3 py-2 bg-board-card border border-board-border rounded-xl text-sm font-bold text-board-muted hover:bg-board-hover disabled:opacity-30 transition-colors"
      >
        50/50
        {hintsRemaining > 0 && (
          <span className="text-[10px] bg-board-green text-white px-1.5 py-0.5 rounded-full font-bold">
            {hintsRemaining}
          </span>
        )}
      </button>
    </motion.div>
  );
}
