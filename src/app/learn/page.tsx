'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CONTINENT_META,
  getBatchesForContinent,
  type LearningContinent,
} from '@/data/learning-batches';
import {
  loadLearningProgress,
  type CustomSet,
} from '@/lib/learning-progress';

const CONTINENTS = (Object.keys(CONTINENT_META) as LearningContinent[]).filter(c => c !== 'us_states');

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 26, delay: i * 0.06 },
  }),
};

export default function LearnPage() {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [customSets,   setCustomSets]   = useState<CustomSet[]>([]);

  useEffect(() => {
    const prog = loadLearningProgress();
    setCompletedIds(prog.completedBatchIds);
    setCustomSets(prog.customSets);
  }, []);

  return (
    <div className="min-h-screen bg-board-bg">
      {/* Header */}
      <header className="bg-board-card border-b border-board-border sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-board-text">Learning Mode</h1>
            <p className="text-xs text-board-muted">Study the world one story at a time</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* ── US STATES ───────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3 px-1">
            US States
          </p>
          <motion.div custom={-1} variants={fadeUp} initial="hidden" animate="show">
            <Link href="/learn/story?continent=us_states">
              <motion.div
                whileHover={{ backgroundColor: 'var(--color-board-hover)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-board-card border border-board-border cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-board-border/20">
                  🦅
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-board-text font-bold text-base">US States</h3>
                  <p className="text-board-muted text-sm">Learn all 50 states — 5 batches</p>
                  <div className="mt-2 h-1.5 bg-board-border rounded-full overflow-hidden w-full">
                    <div
                      className="h-full bg-board-green rounded-full transition-all"
                      style={{ width: `${(getBatchesForContinent('us_states').filter(b => completedIds.includes(b.id)).length / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-board-muted mt-1 font-bold">
                    {getBatchesForContinent('us_states').filter(b => completedIds.includes(b.id)).length}/5 batches complete
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#007AFF]">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </section>

        {/* ── STORY MODE ──────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3 px-1">
            Story Mode
          </p>
          <div className="space-y-2.5">
            {CONTINENTS.map((continent, i) => {
              const meta    = CONTINENT_META[continent];
              const batches = getBatchesForContinent(continent);
              const done    = batches.filter(b => completedIds.includes(b.id)).length;
              const pct     = batches.length > 0 ? done / batches.length : 0;

              return (
                <motion.div
                  key={continent}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  <Link href={`/learn/story?continent=${continent}`}>
                    <motion.div
                      whileHover={{ backgroundColor: 'var(--color-board-hover)' }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-board-card border border-board-border cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-board-border/20">
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-board-text font-bold text-base">{meta.label}</h3>
                        <p className="text-board-muted text-sm">{meta.description}</p>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-board-border rounded-full overflow-hidden w-full">
                          <div
                            className="h-full bg-board-green rounded-full transition-all"
                            style={{ width: `${pct * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-board-muted mt-1 font-bold">
                          {done}/{batches.length} batches complete
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-board-green">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── CUSTOM SETS ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-xs font-bold text-board-muted uppercase tracking-wider">
              Custom Sets
            </p>
            <Link
              href="/learn/custom"
              className="text-xs font-bold text-board-green hover:underline"
            >
              + Build New Set
            </Link>
          </div>

          {customSets.length === 0 ? (
            <motion.div
              custom={CONTINENTS.length}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <Link href="/learn/custom">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-board-card border border-dashed border-board-border cursor-pointer hover:bg-board-hover transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-board-border/20">
                    ✏️
                  </div>
                  <div>
                    <p className="text-board-text font-bold text-base">Build your first set</p>
                    <p className="text-board-muted text-sm">Pick any countries and study them your way</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              {customSets.map((set, i) => (
                <motion.div
                  key={set.id}
                  custom={CONTINENTS.length + i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  <Link href={`/learn/story?customSet=${set.id}`}>
                    <motion.div
                      whileHover={{ backgroundColor: 'var(--color-board-hover)' }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-board-card border border-board-border cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-board-border/20">
                        ✏️
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-board-text font-bold text-base truncate">{set.name}</h3>
                        <p className="text-board-muted text-sm">{set.countries.length} countries</p>
                      </div>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-ocean-500/80">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/learn/custom"
                className="block text-center py-3 text-board-green text-sm font-bold hover:underline"
              >
                + Build another set
              </Link>
            </div>
          )}
        </section>

        {/* ── COMING SOON ─────────────────────────────────────────────────── */}
        <section>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3 px-1">
            Coming Soon
          </p>
          <div className="space-y-2.5 opacity-40">
            {[
              { icon: '🃏', title: 'Flashcards', desc: 'Spaced repetition — see hard ones more often' },
              { icon: '🗺️', title: 'Map Explorer', desc: 'Tap any country to learn about it' },
            ].map(item => (
              <div
                key={item.title}
                className="flex items-center gap-4 p-4 rounded-2xl bg-board-card border border-board-border cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-board-border/20">
                  {item.icon}
                </div>
                <div>
                  <p className="text-board-text font-bold text-base">{item.title}</p>
                  <p className="text-board-muted text-sm">{item.desc}</p>
                </div>
                <div className="ml-auto">
                  <svg className="w-4 h-4 text-board-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-4" />
      </main>
    </div>
  );
}
