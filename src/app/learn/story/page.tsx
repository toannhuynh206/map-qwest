'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import {
  CONTINENT_META,
  getBatchesForContinent,
  type LearningBatch,
  type LearningContinent,
  LEARNING_BATCHES,
} from '@/data/learning-batches';
import { COUNTRIES } from '@/data/countries';
import { US_STATES } from '@/data/us-states';
import { FlagCard } from '@/components/quiz/flag-card';
import { BatchMap } from '@/components/learn/batch-map';
import { CountryRevealCard } from '@/components/learn/country-reveal-card';
import { USBatchMap } from '@/components/learn/us-batch-map';
import { StateRevealCard } from '@/components/learn/state-reveal-card';
import {
  loadLearningProgress,
  markBatchComplete,
  isBatchComplete,
  type CustomSet,
} from '@/lib/learning-progress';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase =
  | 'continent-select'
  | 'batch-select'
  | 'explore'
  | 'quiz'
  | 'complete';

interface QuizQuestion {
  alpha3: string;
  options: string[];  // 4 country names
  answer: string;     // correct name
}

// ---------------------------------------------------------------------------
// Quiz generators
// ---------------------------------------------------------------------------

function generateBatchQuiz(alpha3s: string[]): QuizQuestion[] {
  const pool = alpha3s.map(a => COUNTRIES[a]).filter(Boolean);
  const questions = pool.slice(0, Math.min(5, pool.length));
  return questions.map(c => {
    const distractors = pool
      .filter(d => d.alpha3 !== c.alpha3)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [c, ...distractors].sort(() => Math.random() - 0.5).map(x => x.name);
    return { alpha3: c.alpha3, options: opts as string[], answer: c.name };
  });
}

function generateUSBatchQuiz(abbrevs: string[]): QuizQuestion[] {
  const pool = abbrevs.map(a => US_STATES[a]).filter(Boolean);
  const questions = pool.slice(0, Math.min(5, pool.length));
  return questions.map(s => {
    const distractors = pool
      .filter(d => d.abbrev !== s.abbrev)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [s, ...distractors].sort(() => Math.random() - 0.5).map(x => x.name);
    return { alpha3: s.abbrev, options: opts as string[], answer: s.name };
  });
}

// ---------------------------------------------------------------------------
// Continent picker
// ---------------------------------------------------------------------------

function ContinentSelect({
  completedIds,
  onPick,
  onBack,
}: {
  completedIds: string[];
  onPick: (c: LearningContinent) => void;
  onBack: () => void;
}) {
  const CONTINENTS = Object.keys(CONTINENT_META) as LearningContinent[];

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-extrabold text-board-text">Story Mode</h1>
          <p className="text-xs text-board-muted">Pick a continent to start</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-2.5">
        {CONTINENTS.map((c, i) => {
          const meta    = CONTINENT_META[c];
          const batches = getBatchesForContinent(c);
          const done    = batches.filter(b => completedIds.includes(b.id)).length;
          const pct     = batches.length > 0 ? done / batches.length : 0;

          return (
            <motion.button
              key={c}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(c)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-board-card border border-board-border hover:bg-board-hover transition-colors text-left"
            >
              <span className="text-3xl shrink-0">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-board-text text-base">{meta.label}</p>
                <p className="text-board-muted text-xs">{meta.description}</p>
                <div className="mt-1.5 h-1.5 bg-board-border rounded-full overflow-hidden">
                  <div className="h-full bg-board-green rounded-full transition-all" style={{ width: `${pct * 100}%` }} />
                </div>
                <p className="text-[10px] text-board-muted mt-0.5 font-bold">{done}/{batches.length} complete</p>
              </div>
              <svg className="w-5 h-5 text-board-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Batch picker
// ---------------------------------------------------------------------------

function BatchSelect({
  continent,
  completedIds,
  onPick,
  onBack,
}: {
  continent: LearningContinent;
  completedIds: string[];
  onPick: (b: LearningBatch) => void;
  onBack: () => void;
}) {
  const meta    = CONTINENT_META[continent];
  const batches = getBatchesForContinent(continent);
  const isUS    = continent === 'us_states';

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-extrabold text-board-text">{meta.emoji} {meta.label}</h1>
          <p className="text-xs text-board-muted">Choose your batch</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-2.5">
        {batches.map((batch, i) => {
          const done = completedIds.includes(batch.id);
          return (
            <motion.button
              key={batch.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPick(batch)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
                done
                  ? 'bg-board-green/5 border-board-green/30 hover:bg-board-green/10'
                  : 'bg-board-card border-board-border hover:bg-board-hover'
              }`}
            >
              <span className="text-3xl shrink-0">{batch.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-board-text text-base leading-tight">{batch.name}</p>
                  {done && <span className="text-board-green text-sm font-black">✓</span>}
                </div>
                <p className="text-board-muted text-xs mt-0.5">{batch.countries.length} {isUS ? 'states' : 'countries'}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {batch.countries.slice(0, 8).map(code => (
                    <span key={code} className="text-[10px] font-bold text-board-muted bg-board-border/30 px-1.5 py-0.5 rounded-full">
                      {isUS ? (US_STATES[code]?.name ?? code) : (COUNTRIES[code]?.name ?? code)}
                    </span>
                  ))}
                  {batch.countries.length > 8 && (
                    <span className="text-[10px] font-bold text-board-muted bg-board-border/30 px-1.5 py-0.5 rounded-full">
                      +{batch.countries.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Explore phase
// ---------------------------------------------------------------------------

function ExplorePhase({
  batch,
  explored,
  onTap,
  onStartQuiz,
  onBack,
}: {
  batch: LearningBatch;
  explored: string[];
  onTap: (code: string) => void;
  onStartQuiz: () => void;
  onBack: () => void;
}) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const total    = batch.countries.length;
  const doneCount = explored.length;
  const allDone   = doneCount === total;
  const isUS      = batch.continent === 'us_states';

  const handleTap = (alpha3: string) => {
    setRevealed(alpha3);
  };

  const handleGotIt = () => {
    if (revealed) onTap(revealed);
    setRevealed(null);
  };

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold text-board-text">{batch.emoji} {batch.name}</h1>
          <p className="text-xs text-board-muted">Tap each orange country to explore it</p>
        </div>
        <span className="text-xs font-black text-board-green shrink-0">{doneCount}/{total}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-4">
        {/* Story */}
        <div className="bg-ocean-500/8 border border-ocean-500/20 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-ocean-500 uppercase tracking-wider mb-1.5">The Story</p>
          <p className="text-board-text text-sm leading-relaxed">{batch.story}</p>
        </div>

        {/* Map */}
        <div className="relative">
          {isUS ? (
            <USBatchMap
              batchStates={batch.countries}
              exploredStates={explored}
              onStateTap={handleTap}
              height={320}
            />
          ) : (
            <BatchMap
              batchCountries={batch.countries}
              exploredCountries={explored}
              onCountryTap={handleTap}
              height={320}
            />
          )}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {batch.countries.map(code => {
            const isDone = explored.includes(code);
            const label  = isUS ? (US_STATES[code]?.name ?? code) : (COUNTRIES[code]?.name ?? code);
            return (
              <button
                key={code}
                onClick={() => handleTap(code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isDone
                    ? 'bg-board-green/10 border-board-green/30 text-board-green'
                    : 'bg-board-card border-board-border text-board-text hover:bg-board-hover'
                }`}
              >
                {isDone && <span>✓</span>}
                {label}
              </button>
            );
          })}
        </div>

        {/* Start quiz button */}
        <AnimatePresence>
          {allDone && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onStartQuiz}
              className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base active:scale-[0.98] transition-transform"
            >
              Start Quiz →
            </motion.button>
          )}
        </AnimatePresence>

        {!allDone && (
          <p className="text-center text-board-muted text-xs font-bold">
            Explore all {total - doneCount} remaining {isUS ? 'states' : 'countries'} to unlock the quiz
          </p>
        )}

        <div className="h-4" />
      </div>

      {/* Reveal card */}
      {isUS ? (
        <StateRevealCard
          abbrev={revealed}
          batchName={batch.name}
          onGotIt={handleGotIt}
        />
      ) : (
        <CountryRevealCard
          alpha3={revealed}
          batchName={batch.name}
          onGotIt={handleGotIt}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quiz phase
// ---------------------------------------------------------------------------

function QuizPhase({
  batch,
  questions,
  onComplete,
}: {
  batch: LearningBatch;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}) {
  const [qIndex,   setQIndex]   = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);

  const question = questions[qIndex];
  const country  = COUNTRIES[question.alpha3];
  const isUS     = batch.continent === 'us_states';

  const handleSelect = (opt: string) => {
    if (revealed) return;
    setSelected(opt);
    setRevealed(true);
    const correct = opt === question.answer;
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        onComplete(correct ? score + 1 : score);
      } else {
        setQIndex(qIndex + 1);
        setSelected(null);
        setRevealed(false);
      }
    }, correct ? 900 : 1600);
  };

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <div className="flex-1">
          <h1 className="text-base font-extrabold text-board-text">{batch.emoji} Quiz — {batch.name}</h1>
          <p className="text-xs text-board-muted">Identify the flag</p>
        </div>
        <span className="text-xs font-black text-board-muted shrink-0">{qIndex + 1}/{questions.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-board-border/40">
        <motion.div
          className="h-full bg-board-green"
          animate={{ width: `${(qIndex / questions.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col gap-4"
          >
            {/* Flag / Abbreviation */}
            {isUS ? (
              <div className="w-full max-w-[220px] mx-auto flex items-center justify-center bg-board-card border-2 border-board-border rounded-2xl py-6 shadow-lg">
                <span className="text-5xl font-black text-board-text tracking-tight">{question.alpha3}</span>
              </div>
            ) : (
              country?.alpha2 && (
                <div className="w-full max-w-[260px] mx-auto">
                  <FlagCard alpha2={country.alpha2} countryName="" className="w-full rounded-2xl shadow-lg" />
                </div>
              )
            )}
            <p className="text-lg font-extrabold text-board-text text-center">
              {isUS ? 'Which state is this?' : 'Which country does this flag belong to?'}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {question.options.map((opt, i) => {
                let cls = 'w-full py-3.5 px-5 rounded-2xl text-left font-bold text-base border-2 transition-all ';
                if (revealed) {
                  if (opt === question.answer)       cls += 'bg-board-green/10 border-board-green text-board-green';
                  else if (opt === selected)         cls += 'bg-red-50 border-red-400 text-red-600';
                  else                               cls += 'bg-board-card border-board-border text-board-muted opacity-40';
                } else if (opt === selected) {
                  cls += 'bg-board-green/10 border-board-green text-board-green-dark';
                } else {
                  cls += 'bg-board-card border-board-border text-board-text hover:bg-board-hover';
                }
                return (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelect(opt)}
                    className={cls}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Complete phase
// ---------------------------------------------------------------------------

function CompletePhase({
  batch,
  score,
  total,
  onNextBatch,
  onRepeat,
  onHome,
}: {
  batch: LearningBatch;
  score: number;
  total: number;
  onNextBatch: (() => void) | null;
  onRepeat: () => void;
  onHome: () => void;
}) {
  const pct = Math.round((score / total) * 100);

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4">
        <h1 className="text-base font-extrabold text-board-text">Batch Complete!</h1>
        <p className="text-xs text-board-muted">{batch.emoji} {batch.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-lg mx-auto w-full space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="bg-board-card border border-board-border rounded-3xl p-6 text-center space-y-3"
        >
          <div className="w-24 h-24 rounded-full border-4 border-board-green bg-board-green/10 flex flex-col items-center justify-center mx-auto">
            <span className="text-3xl font-black text-board-green">{score}</span>
            <span className="text-xs text-board-muted font-bold">/ {total}</span>
          </div>
          <p className="font-extrabold text-board-text text-xl">
            {pct === 100 ? '🎉 Perfect!' : pct >= 80 ? '🌟 Well done!' : pct >= 60 ? '👍 Good effort!' : '💪 Keep going!'}
          </p>
          <p className="text-board-muted text-sm">{pct}% correct on the quiz</p>
          <p className="text-board-muted text-xs">You explored all {batch.countries.length} {batch.continent === 'us_states' ? 'states' : 'countries'} in this batch</p>
        </motion.div>

        <div className="space-y-2.5">
          {onNextBatch && (
            <button
              onClick={onNextBatch}
              className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base"
            >
              Next Batch →
            </button>
          )}
          <button
            onClick={onRepeat}
            className="w-full py-4 rounded-2xl bg-board-card border border-board-border text-board-text font-bold text-base"
          >
            Explore Again
          </button>
          <button
            onClick={onHome}
            className="w-full py-3 text-board-muted font-bold text-sm"
          >
            Back to Learning Hub
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner page (uses search params)
// ---------------------------------------------------------------------------

function StoryPageInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const continentParam = searchParams.get('continent') as LearningContinent | null;
  const customSetId    = searchParams.get('customSet');

  const [phase,      setPhase]      = useState<Phase>(continentParam ? 'batch-select' : 'continent-select');
  const [continent,  setContinent]  = useState<LearningContinent | null>(continentParam);
  const [batch,      setBatch]      = useState<LearningBatch | null>(null);
  const [explored,   setExplored]   = useState<string[]>([]);
  const [questions,  setQuestions]  = useState<QuizQuestion[]>([]);
  const [quizScore,  setQuizScore]  = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [customSet,  setCustomSet]  = useState<CustomSet | null>(null);

  useEffect(() => {
    const prog = loadLearningProgress();
    setCompletedIds(prog.completedBatchIds);

    if (customSetId) {
      const cs = prog.customSets.find(s => s.id === customSetId) ?? null;
      setCustomSet(cs);
      if (cs) {
        // Turn custom set into a synthetic batch
        const synth: LearningBatch = {
          id: cs.id,
          continent: 'europe', // dummy
          batchNumber: 0,
          name: cs.name,
          emoji: '✏️',
          story: `Your custom set of ${cs.countries.length} countries.`,
          countries: cs.countries,
        };
        setBatch(synth);
        setPhase('explore');
      }
    }
  }, [customSetId]);

  const handlePickContinent = (c: LearningContinent) => {
    setContinent(c);
    setPhase('batch-select');
  };

  const handlePickBatch = (b: LearningBatch) => {
    setBatch(b);
    setExplored([]);
    setPhase('explore');
  };

  const handleExplore = (alpha3: string) => {
    setExplored(prev => prev.includes(alpha3) ? prev : [...prev, alpha3]);
  };

  const handleStartQuiz = useCallback(() => {
    if (!batch) return;
    const qs = batch.continent === 'us_states'
      ? generateUSBatchQuiz(batch.countries)
      : generateBatchQuiz(batch.countries);
    setQuestions(qs);
    setPhase('quiz');
  }, [batch]);

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    if (batch) {
      const next = markBatchComplete(batch.id);
      setCompletedIds(next.completedBatchIds);
    }
    setPhase('complete');
  };

  const getNextBatch = (): LearningBatch | null => {
    if (!batch || !continent) return null;
    const batches = getBatchesForContinent(continent);
    const idx = batches.findIndex(b => b.id === batch.id);
    return batches[idx + 1] ?? null;
  };

  const handleNextBatch = () => {
    const next = getNextBatch();
    if (next) {
      setBatch(next);
      setExplored([]);
      setPhase('explore');
    }
  };

  const handleRepeat = () => {
    setExplored([]);
    setPhase('explore');
  };

  if (phase === 'continent-select') {
    return (
      <ContinentSelect
        completedIds={completedIds}
        onPick={handlePickContinent}
        onBack={() => router.push('/learn')}
      />
    );
  }

  if (phase === 'batch-select' && continent) {
    return (
      <BatchSelect
        continent={continent}
        completedIds={completedIds}
        onPick={handlePickBatch}
        onBack={() => setPhase('continent-select')}
      />
    );
  }

  if (phase === 'explore' && batch) {
    return (
      <ExplorePhase
        batch={batch}
        explored={explored}
        onTap={handleExplore}
        onStartQuiz={handleStartQuiz}
        onBack={() => {
          if (customSet) { router.push('/learn'); return; }
          setPhase(continent ? 'batch-select' : 'continent-select');
        }}
      />
    );
  }

  if (phase === 'quiz' && batch && questions.length > 0) {
    return (
      <QuizPhase
        batch={batch}
        questions={questions}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (phase === 'complete' && batch) {
    const nextBatch = getNextBatch();
    return (
      <CompletePhase
        batch={batch}
        score={quizScore}
        total={questions.length}
        onNextBatch={nextBatch ? handleNextBatch : null}
        onRepeat={handleRepeat}
        onHome={() => router.push('/learn')}
      />
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Page (wrapped in Suspense for useSearchParams)
// ---------------------------------------------------------------------------

export default function StoryPage() {
  return (
    <Suspense>
      <StoryPageInner />
    </Suspense>
  );
}
