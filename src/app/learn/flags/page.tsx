'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, REGIONS } from '@/data/countries';
import { CountryRevealCard } from '@/components/learn/country-reveal-card';

type Phase = 'config' | 'study' | 'complete';
type CountOption = 10 | 20 | 50 | 'all';

const COUNT_OPTIONS: { value: CountOption; label: string }[] = [
  { value: 10,    label: '10'  },
  { value: 20,    label: '20'  },
  { value: 50,    label: '50'  },
  { value: 'all', label: 'All' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ---------------------------------------------------------------------------
// Config screen
// ---------------------------------------------------------------------------

function ConfigScreen({
  regionFilter,
  setRegionFilter,
  count,
  setCount,
  poolSize,
  onStart,
  onBack,
}: {
  regionFilter: string;
  setRegionFilter: (r: string) => void;
  count: CountOption;
  setCount: (c: CountOption) => void;
  poolSize: number;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-extrabold text-board-text">Flag Flashcards</h1>
          <p className="text-xs text-board-muted">See the flag — recall the country</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-6">

        {/* Region filter */}
        <div>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Region</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRegionFilter('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                regionFilter === '' ? 'bg-board-green text-white border-board-green' : 'bg-board-card border-board-border text-board-muted'
              }`}
            >
              🌍 All Regions
            </button>
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setRegionFilter(regionFilter === r.id ? '' : r.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  regionFilter === r.id ? 'bg-board-green text-white border-board-green' : 'bg-board-card border-board-border text-board-muted'
                }`}
              >
                {r.emoji} {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">How many flags?</p>
          <div className="grid grid-cols-4 gap-2">
            {COUNT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCount(opt.value)}
                disabled={opt.value !== 'all' && opt.value > poolSize}
                className={`py-3 rounded-xl text-sm font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  count === opt.value
                    ? 'bg-board-green text-white border-board-green'
                    : 'bg-board-card border-board-border text-board-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-board-muted mt-2 font-bold">
            {poolSize} flags available{regionFilter ? ' in this region' : ''}
          </p>
        </div>

        {/* Start */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          disabled={poolSize === 0}
          className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base disabled:opacity-40"
        >
          Start Flashcards →
        </motion.button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Study screen
// ---------------------------------------------------------------------------

function StudyScreen({
  deck,
  cardIndex,
  revealed,
  onReveal,
  onGotIt,
  onBack,
}: {
  deck: string[];
  cardIndex: number;
  revealed: string | null;
  onReveal: () => void;
  onGotIt: () => void;
  onBack: () => void;
}) {
  const alpha3  = deck[cardIndex];
  const country = COUNTRIES[alpha3];
  const pct     = cardIndex / deck.length;

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-board-text">Flag Flashcards</p>
        </div>
        <span className="text-xs font-black text-board-muted shrink-0">{cardIndex + 1} / {deck.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-board-border/40 shrink-0">
        <motion.div
          className="h-full bg-board-green"
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      {/* Flag card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <AnimatePresence mode="wait">
          <motion.button
            key={alpha3}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={onReveal}
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-board-border active:scale-[0.98] transition-transform"
          >
            {country?.alpha2 && (
              <img
                src={`https://flagcdn.com/w640/${country.alpha2.toLowerCase()}.png`}
                alt="Flag"
                className="w-full object-cover"
                draggable={false}
              />
            )}
          </motion.button>
        </AnimatePresence>

        <motion.button
          key={`btn-${cardIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={onReveal}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-board-card border border-board-border text-board-text font-bold text-sm hover:bg-board-hover transition-colors"
        >
          Tap to reveal →
        </motion.button>
      </div>

      {/* Reveal card */}
      <CountryRevealCard
        alpha3={revealed}
        batchName="Flag Flashcards"
        onGotIt={onGotIt}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Complete screen
// ---------------------------------------------------------------------------

function CompleteScreen({
  total,
  onRepeat,
  onHome,
}: {
  total: number;
  onRepeat: () => void;
  onHome: () => void;
}) {
  return (
    <div className="min-h-screen bg-board-bg flex flex-col items-center justify-center px-6 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-sm bg-board-card border border-board-border rounded-3xl p-8 text-center space-y-3"
      >
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-black text-board-text">All done!</h2>
        <p className="text-board-muted text-sm">You reviewed {total} flags.</p>
      </motion.div>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={onRepeat}
          className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base"
        >
          Shuffle & Repeat
        </button>
        <button
          onClick={onHome}
          className="w-full py-3 text-board-muted font-bold text-sm"
        >
          Back to Learning Hub
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FlagsLearnPage() {
  const router = useRouter();

  const [phase,        setPhase]        = useState<Phase>('config');
  const [regionFilter, setRegionFilter] = useState('');
  const [count,        setCount]        = useState<CountOption>(20);
  const [deck,         setDeck]         = useState<string[]>([]);
  const [cardIndex,    setCardIndex]    = useState(0);
  const [revealed,     setRevealed]     = useState<string | null>(null);

  const pool = useMemo(() => {
    const all = Object.values(COUNTRIES).filter(c => c.alpha2);
    if (!regionFilter) return all;
    return all.filter(c => c.region === regionFilter);
  }, [regionFilter]);

  const handleStart = () => {
    const shuffled = shuffle(pool.map(c => c.alpha3));
    const n = count === 'all' ? shuffled.length : Math.min(count, shuffled.length);
    setDeck(shuffled.slice(0, n));
    setCardIndex(0);
    setRevealed(null);
    setPhase('study');
  };

  const handleReveal = () => setRevealed(deck[cardIndex]);

  const handleGotIt = () => {
    setRevealed(null);
    if (cardIndex + 1 >= deck.length) {
      setPhase('complete');
    } else {
      setCardIndex(i => i + 1);
    }
  };

  const handleRepeat = () => {
    const reshuffled = shuffle(deck);
    setDeck(reshuffled);
    setCardIndex(0);
    setRevealed(null);
    setPhase('study');
  };

  if (phase === 'config') {
    return (
      <ConfigScreen
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
        count={count}
        setCount={setCount}
        poolSize={pool.length}
        onStart={handleStart}
        onBack={() => router.push('/learn')}
      />
    );
  }

  if (phase === 'study') {
    return (
      <StudyScreen
        deck={deck}
        cardIndex={cardIndex}
        revealed={revealed}
        onReveal={handleReveal}
        onGotIt={handleGotIt}
        onBack={() => setPhase('config')}
      />
    );
  }

  return (
    <CompleteScreen
      total={deck.length}
      onRepeat={handleRepeat}
      onHome={() => router.push('/learn')}
    />
  );
}
