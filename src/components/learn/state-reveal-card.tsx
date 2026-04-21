'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { US_STATES } from '@/data/us-states';
import { US_STATE_FACTS } from '@/data/us-state-facts';

function speak(text: string) {
  if (typeof window === 'undefined') return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate  = 0.82;
  utterance.pitch = 1.0;
  synth.speak(utterance);
}

interface StateRevealCardProps {
  /** 2-letter abbreviation, or null when hidden */
  abbrev: string | null;
  batchName: string;
  onGotIt: () => void;
}

export function StateRevealCard({ abbrev, batchName, onGotIt }: StateRevealCardProps) {
  const state = abbrev ? US_STATES[abbrev] : null;
  const facts = abbrev ? US_STATE_FACTS[abbrev] : null;

  useEffect(() => {
    if (state) speak(state.name);
  }, [state?.name]);

  return (
    <AnimatePresence>
      {state && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40"
            onClick={onGotIt}
          />

          {/* Card */}
          <motion.div
            key="card"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-4 pb-6"
          >
            <div className="bg-board-card rounded-3xl border border-board-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-board-border">
                <span className="text-[11px] font-bold text-board-muted uppercase tracking-wider">
                  {batchName}
                </span>
                <button
                  onClick={() => speak(state.name)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-board-border/40 text-board-muted hover:text-board-text transition-colors"
                  aria-label="Replay pronunciation"
                >
                  🔊
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* State name + abbreviation */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="text-4xl font-black text-board-text leading-none">
                      {state.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-board-border/30 text-board-muted text-xs font-black">
                      {state.abbrev}
                    </span>
                  </div>
                  {facts && (
                    <p className="text-board-muted text-sm">
                      Capital: <span className="font-bold text-board-text">{facts.capital}</span>
                    </p>
                  )}
                </div>

                {/* Fact */}
                {facts && (
                  <div className="bg-ocean-500/8 border border-ocean-500/20 rounded-2xl p-3">
                    <p className="text-[10px] font-bold text-ocean-500 uppercase tracking-wider mb-1">
                      Did you know?
                    </p>
                    <p className="text-board-text text-sm leading-snug">{facts.fact}</p>
                  </div>
                )}

                {/* Got it */}
                <button
                  onClick={onGotIt}
                  className="w-full py-3.5 bg-board-green text-white font-extrabold text-base rounded-2xl active:scale-[0.98] transition-transform"
                >
                  Got it! ✓
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
