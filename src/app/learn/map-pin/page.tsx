'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, REGIONS } from '@/data/countries';
import { CountryRevealCard } from '@/components/learn/country-reveal-card';
import { InteractiveMap } from '@/components/map/interactive-map';
import type { CountryFeedback } from '@/components/map/country-path';


type Phase = 'config' | 'study' | 'complete';
type CountOption = 10 | 20 | 50;

const COUNT_OPTIONS: { value: CountOption; label: string }[] = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function ConfigScreen({
  regionFilter, setRegionFilter,
  count, setCount,
  poolSize, onStart, onBack,
}: {
  regionFilter: string; setRegionFilter: (r: string) => void;
  count: CountOption; setCount: (c: CountOption) => void;
  poolSize: number; onStart: () => void; onBack: () => void;
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
          <h1 className="text-base font-extrabold text-board-text">Find on the Map</h1>
          <p className="text-xs text-board-muted">Name shown — find it, or tap Give Up to see it</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        <div>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Region</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRegionFilter('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${regionFilter === '' ? 'bg-board-green text-white border-board-green' : 'bg-board-card border-board-border text-board-muted'}`}
            >
              🌍 All Regions
            </button>
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setRegionFilter(regionFilter === r.id ? '' : r.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${regionFilter === r.id ? 'bg-board-green text-white border-board-green' : 'bg-board-card border-board-border text-board-muted'}`}
              >
                {r.emoji} {r.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">How many countries?</p>
          <div className="grid grid-cols-3 gap-2">
            {COUNT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCount(opt.value)}
                disabled={opt.value > poolSize}
                className={`py-3 rounded-xl text-sm font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${count === opt.value ? 'bg-board-green text-white border-board-green' : 'bg-board-card border-board-border text-board-muted'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-board-muted mt-2 font-bold">{poolSize} countries available</p>
        </div>

        <div className="bg-ocean-500/8 border border-ocean-500/20 rounded-2xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-ocean-500 uppercase tracking-wider">How it works</p>
          <p className="text-board-text text-sm">A country name appears — tap it on the map.</p>
          <p className="text-board-text text-sm">Stuck? Hit <span className="font-bold">Give Up</span> and the country lights up in orange.</p>
          <p className="text-board-text text-sm">No timer, no pressure — this is practice.</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          disabled={poolSize < count}
          className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base disabled:opacity-40"
        >
          Start Practice →
        </motion.button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Study — the main learning screen
// ---------------------------------------------------------------------------

function StudyScreen({
  deck, cardIndex, revealed, gaveUp, wrongTaps,
  foundCount, gaveUpCount,
  onTap, onGiveUp, onGotIt, onBack,
}: {
  deck: string[]; cardIndex: number;
  revealed: string | null; gaveUp: boolean; wrongTaps: Set<string>;
  foundCount: number; gaveUpCount: number;
  onTap: (alpha3: string) => void; onGiveUp: () => void;
  onGotIt: () => void; onBack: () => void;
}) {
  const alpha3  = deck[cardIndex];
  const country = COUNTRIES[alpha3];
  const pct     = cardIndex / deck.length;

  const feedbackMap = useMemo<Record<string, CountryFeedback>>(() => {
    const map: Record<string, CountryFeedback> = {};
    if (revealed) {
      map[revealed] = gaveUp ? 'target' : 'correct';
    }
    for (const wrongAlpha3 of wrongTaps) {
      if (!map[wrongAlpha3]) map[wrongAlpha3] = 'incorrect';
    }
    return map;
  }, [revealed, gaveUp, wrongTaps]);

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
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider">Find on the Map</p>
        </div>
        <span className="text-xs font-black text-board-muted shrink-0">{cardIndex + 1}/{deck.length}</span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-board-border/40 shrink-0">
        <motion.div
          className="h-full bg-board-green"
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      {/* Target name */}
      <div className="shrink-0 px-4 pt-4 pb-2 text-center max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={alpha3}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-1">Find this country</p>
            <h2 className="text-3xl font-black text-board-text leading-tight">{country?.name ?? alpha3}</h2>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <InteractiveMap
          onCountrySelect={onTap}
          feedbackMap={feedbackMap}
          dimmedCountries={new Set()}
          disabled={revealed !== null}
          showMiniMap={true}
        />

        {/* Give-up hint when stuck */}
        {gaveUp && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm z-10"
          >
            <span className="w-3 h-3 rounded-full shrink-0 bg-[#FF9500]" />
            <span className="text-white text-xs font-bold">{country?.name} is highlighted</span>
          </motion.div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 bg-board-card border-t border-board-border px-4 py-3 flex items-center justify-between max-w-lg mx-auto w-full">
        <div className="flex gap-3 text-[11px] font-bold text-board-muted">
          <span className="text-board-green">✓ {foundCount}</span>
          <span>Give ups: {gaveUpCount}</span>
        </div>
        {!gaveUp && (
          <button
            onClick={onGiveUp}
            className="px-4 py-2 rounded-xl bg-board-border/40 text-board-muted text-xs font-bold hover:bg-board-border/60 transition-colors"
          >
            Give Up — Show Me
          </button>
        )}
      </div>

      {/* Reveal card */}
      <CountryRevealCard
        alpha3={revealed}
        batchName="Find on the Map"
        onGotIt={onGotIt}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Complete
// ---------------------------------------------------------------------------

function CompleteScreen({
  total, foundCount, gaveUpCount, onRepeat, onHome,
}: {
  total: number; foundCount: number; gaveUpCount: number;
  onRepeat: () => void; onHome: () => void;
}) {
  const pct = Math.round((foundCount / total) * 100);
  return (
    <div className="min-h-screen bg-board-bg flex flex-col items-center justify-center px-6 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-sm bg-board-card border border-board-border rounded-3xl p-8 text-center space-y-4"
      >
        <div className="w-24 h-24 rounded-full border-4 border-board-green bg-board-green/10 flex flex-col items-center justify-center mx-auto">
          <span className="text-3xl font-black text-board-green">{foundCount}</span>
          <span className="text-xs text-board-muted font-bold">/ {total}</span>
        </div>
        <div>
          <p className="text-xl font-extrabold text-board-text">
            {pct === 100 ? '🎉 Flawless!' : pct >= 80 ? '🌟 Great recall!' : pct >= 60 ? '👍 Getting there!' : '💪 Keep practicing!'}
          </p>
          <p className="text-board-muted text-sm mt-1">{pct}% found without help</p>
        </div>
        <div className="flex justify-around pt-1">
          <div className="text-center">
            <p className="text-board-green font-black text-xl">{foundCount}</p>
            <p className="text-board-muted text-[11px] font-bold uppercase tracking-wider">Found</p>
          </div>
          <div className="text-center">
            <p className="text-[#FF9500] font-black text-xl">{gaveUpCount}</p>
            <p className="text-board-muted text-[11px] font-bold uppercase tracking-wider">Gave Up</p>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-sm space-y-3">
        <button onClick={onRepeat} className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base">
          Try Again
        </button>
        <button onClick={onHome} className="w-full py-3 text-board-muted font-bold text-sm">
          Back to Learning Hub
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MapPinLearnPage() {
  const router = useRouter();

  const [phase,        setPhase]        = useState<Phase>('config');
  const [regionFilter, setRegionFilter] = useState('');
  const [count,        setCount]        = useState<CountOption>(20);
  const [deck,         setDeck]         = useState<string[]>([]);
  const [cardIndex,    setCardIndex]    = useState(0);
  const [revealed,     setRevealed]     = useState<string | null>(null);
  const [gaveUp,       setGaveUp]       = useState(false);
  const [wrongTaps,    setWrongTaps]    = useState<Set<string>>(new Set());
  const [foundCount,   setFoundCount]   = useState(0);
  const [gaveUpCount,  setGaveUpCount]  = useState(0);

  const pool = useMemo(() => {
    const all = Object.values(COUNTRIES).filter(c => c.alpha2);
    return regionFilter ? all.filter(c => c.region === regionFilter) : all;
  }, [regionFilter]);

  const handleStart = () => {
    const shuffled = shuffle(pool.map(c => c.alpha3)).slice(0, count);
    setDeck(shuffled);
    setCardIndex(0);
    setRevealed(null);
    setGaveUp(false);
    setWrongTaps(new Set());
    setFoundCount(0);
    setGaveUpCount(0);
    setPhase('study');
  };

  const handleTap = useCallback((alpha3: string) => {
    if (revealed || gaveUp) return;
    const target = deck[cardIndex];
    if (alpha3 === target) {
      setFoundCount(n => n + 1);
      setRevealed(alpha3);
    } else {
      setWrongTaps(prev => new Set([...prev, alpha3]));
      setTimeout(() => {
        setWrongTaps(prev => { const next = new Set(prev); next.delete(alpha3); return next; });
      }, 700);
    }
  }, [revealed, gaveUp, deck, cardIndex]);

  const handleGiveUp = () => {
    setGaveUpCount(n => n + 1);
    setGaveUp(true);
    setRevealed(deck[cardIndex]);
  };

  const handleGotIt = () => {
    setRevealed(null);
    setGaveUp(false);
    setWrongTaps(new Set());
    if (cardIndex + 1 >= deck.length) {
      setPhase('complete');
    } else {
      setCardIndex(i => i + 1);
    }
  };

  if (phase === 'config') {
    return (
      <ConfigScreen
        regionFilter={regionFilter} setRegionFilter={setRegionFilter}
        count={count} setCount={setCount}
        poolSize={pool.length}
        onStart={handleStart}
        onBack={() => router.push('/learn')}
      />
    );
  }

  if (phase === 'study') {
    return (
      <StudyScreen
        deck={deck} cardIndex={cardIndex}
        revealed={revealed} gaveUp={gaveUp} wrongTaps={wrongTaps}
        foundCount={foundCount} gaveUpCount={gaveUpCount}
        onTap={handleTap} onGiveUp={handleGiveUp}
        onGotIt={handleGotIt}
        onBack={() => setPhase('config')}
      />
    );
  }

  return (
    <CompleteScreen
      total={deck.length} foundCount={foundCount} gaveUpCount={gaveUpCount}
      onRepeat={handleStart}
      onHome={() => router.push('/learn')}
    />
  );
}
