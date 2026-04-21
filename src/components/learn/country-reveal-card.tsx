'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlagCard } from '@/components/quiz/flag-card';
import { COUNTRIES } from '@/data/countries';

/** Speak the country name using browser TTS. */
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

interface CountryRevealCardProps {
  /** alpha-3 code of the country to reveal, or null when hidden */
  alpha3: string | null;
  batchName: string;
  onGotIt: () => void;
}

export function CountryRevealCard({ alpha3, batchName, onGotIt }: CountryRevealCardProps) {
  const country = alpha3 ? COUNTRIES[alpha3] : null;

  // Speak the name whenever a new country is revealed
  useEffect(() => {
    if (country) speak(country.name);
  }, [country?.name]);

  return (
    <AnimatePresence>
      {country && (
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
              {/* Header bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-board-border">
                <span className="text-[11px] font-bold text-board-muted uppercase tracking-wider">
                  {batchName}
                </span>
                <button
                  onClick={() => speak(country.name)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-board-border/40 text-board-muted hover:text-board-text transition-colors"
                  aria-label="Replay pronunciation"
                >
                  🔊
                </button>
              </div>

              <div className="p-5 flex flex-col items-center gap-4">
                {/* Flag */}
                {country.alpha2 && (
                  <div className="w-full max-w-[200px]">
                    <FlagCard
                      alpha2={country.alpha2}
                      countryName={country.name}
                      className="w-full rounded-xl shadow-md"
                    />
                  </div>
                )}

                {/* Name */}
                <div className="text-center">
                  <h2 className="text-2xl font-black text-board-text leading-tight">
                    {country.name}
                  </h2>
                  <p className="text-board-muted text-sm mt-0.5">{regionLabel(country.region)}</p>
                </div>

                {/* Got it button */}
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

const REGION_LABELS: Record<string, string> = {
  africa:        'Africa',
  asia:          'Asia',
  europe:        'Europe',
  north_america: 'North America',
  south_america: 'South America',
  oceania:       'Oceania',
};

function regionLabel(region: string): string {
  return REGION_LABELS[region] ?? region;
}
