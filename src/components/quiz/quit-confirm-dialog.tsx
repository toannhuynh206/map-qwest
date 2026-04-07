'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface QuitConfirmDialogProps {
  visible: boolean;
  answeredCount: number;
  totalCount: number;
  onKeepPlaying: () => void;
  onQuit: () => void;
}

export function QuitConfirmDialog({
  visible,
  answeredCount,
  totalCount,
  onKeepPlaying,
  onQuit,
}: QuitConfirmDialogProps) {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onKeepPlaying}
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto bg-board-card border border-board-border rounded-3xl overflow-hidden shadow-xl"
          >
            {/* Icon */}
            <div className="pt-7 pb-2 flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl">
                🚩
              </div>
            </div>

            {/* Text */}
            <div className="px-6 pt-2 pb-5 text-center space-y-1.5">
              <h2 className="text-lg font-extrabold text-board-text">Quit quiz?</h2>
              <p className="text-sm text-board-muted leading-snug">
                You&apos;ve answered{' '}
                <span className="font-bold text-board-text">{answeredCount}</span> of{' '}
                <span className="font-bold text-board-text">{totalCount}</span> questions.
                {answeredCount > 0
                  ? " We'll show your results so far."
                  : ' Are you sure you want to quit?'}
              </p>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-6 flex flex-col gap-2.5">
              <button
                onClick={onQuit}
                className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm transition-colors btn-chunky"
              >
                Quit &amp; See Results
              </button>
              <button
                onClick={onKeepPlaying}
                className="w-full py-3 rounded-2xl bg-board-bg hover:bg-board-hover border border-board-border text-board-text font-extrabold text-sm transition-colors"
              >
                Keep Playing
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
