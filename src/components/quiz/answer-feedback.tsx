'use client';

import { motion, AnimatePresence } from 'framer-motion';

// Correct answers auto-advance after 900ms, incorrect after 1500ms
export const FEEDBACK_DELAY_CORRECT = 900;
export const FEEDBACK_DELAY_INCORRECT = 1500;

interface AnswerFeedbackProps {
  visible: boolean;
  correct: boolean;
  correctCountryName: string;
}

export function AnswerFeedback({ visible, correct, correctCountryName }: AnswerFeedbackProps) {
  const delay = correct ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_INCORRECT;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`absolute bottom-0 left-0 right-0 border-t-2 overflow-hidden ${
            correct ? 'bg-green-50 border-board-green' : 'bg-red-50 border-red-400'
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-4 max-w-4xl mx-auto">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
              correct ? 'bg-board-green' : 'bg-red-400'
            }`}>
              {correct ? '✓' : '✗'}
            </div>
            <div>
              <p className={`font-extrabold text-base ${correct ? 'text-board-green-dark' : 'text-red-600'}`}>
                {correct ? 'Correct!' : 'Incorrect'}
              </p>
              {!correct && (
                <p className="text-red-500 text-sm">
                  Answer: <span className="font-bold">{correctCountryName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Auto-advance progress bar */}
          <motion.div
            className={`h-1 ${correct ? 'bg-board-green' : 'bg-red-400'}`}
            initial={{ scaleX: 1, originX: 0 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: delay / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
