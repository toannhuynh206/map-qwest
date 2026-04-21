'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES, REGIONS } from '@/data/countries';
import { FlagCard } from '@/components/quiz/flag-card';
import {
  loadLearningProgress,
  saveCustomSet,
  deleteCustomSet,
  type CustomSet,
} from '@/lib/learning-progress';

const ALL_COUNTRIES = Object.values(COUNTRIES).sort((a, b) =>
  a.name.localeCompare(b.name),
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Phase = 'list' | 'builder';

export default function CustomPage() {
  const router = useRouter();

  const [phase,       setPhase]       = useState<Phase>('list');
  const [customSets,  setCustomSets]  = useState<CustomSet[]>([]);
  const [selected,    setSelected]    = useState<string[]>([]);  // alpha3 codes
  const [setName,     setSetName]     = useState('');
  const [search,      setSearch]      = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  useEffect(() => {
    const prog = loadLearningProgress();
    setCustomSets(prog.customSets);
  }, []);

  const filtered = useMemo(() => {
    return ALL_COUNTRIES.filter(c => {
      if (regionFilter && c.region !== regionFilter) return false;
      if (search) return c.name.toLowerCase().includes(search.toLowerCase());
      return true;
    });
  }, [search, regionFilter]);

  const toggle = (alpha3: string) => {
    setSelected(prev =>
      prev.includes(alpha3) ? prev.filter(a => a !== alpha3) : [...prev, alpha3],
    );
  };

  const handleSave = () => {
    const name = setName.trim() || `My Set (${selected.length} countries)`;
    const prog = saveCustomSet(name, selected);
    setCustomSets(loadLearningProgress().customSets);
    setPhase('list');
    setSelected([]);
    setSetName('');
  };

  const handleDelete = (id: string) => {
    const next = deleteCustomSet(id);
    setCustomSets(next.customSets);
  };

  // ── List view ──────────────────────────────────────────────────────────────

  if (phase === 'list') {
    return (
      <div className="min-h-screen bg-board-bg flex flex-col">
        <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
          <button onClick={() => router.push('/learn')} className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-extrabold text-board-text">Custom Sets</h1>
            <p className="text-xs text-board-muted">Build your own study list</p>
          </div>
          <button
            onClick={() => setPhase('builder')}
            className="px-3 py-1.5 rounded-xl bg-board-green text-white text-xs font-bold"
          >
            + New Set
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-3">
          {customSets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <span className="text-5xl">✏️</span>
              <p className="font-bold text-board-text text-lg">No custom sets yet</p>
              <p className="text-board-muted text-sm">Build a set of any countries you want to study</p>
              <button
                onClick={() => setPhase('builder')}
                className="px-6 py-3 rounded-2xl bg-board-green text-white font-bold text-base"
              >
                Build your first set
              </button>
            </motion.div>
          ) : (
            customSets.map((set, i) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-board-card border border-board-border rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-board-border/20 flex items-center justify-center text-xl shrink-0">
                  ✏️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-board-text truncate">{set.name}</p>
                  <p className="text-board-muted text-xs">{set.countries.length} countries</p>
                  {/* Preview flags */}
                  <div className="flex gap-1 mt-1.5 overflow-hidden">
                    {set.countries.slice(0, 6).map(a3 => {
                      const c = COUNTRIES[a3];
                      return c?.alpha2 ? (
                        <img
                          key={a3}
                          src={`https://flagcdn.com/w40/${c.alpha2.toLowerCase()}.png`}
                          alt={c.name}
                          className="h-4 w-6 object-cover rounded-sm border border-board-border/40"
                        />
                      ) : null;
                    })}
                    {set.countries.length > 6 && (
                      <span className="text-[10px] text-board-muted font-bold self-center pl-1">
                        +{set.countries.length - 6}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => router.push(`/learn/story?customSet=${set.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-board-green text-white text-xs font-bold"
                  >
                    Study
                  </button>
                  <button
                    onClick={() => handleDelete(set.id)}
                    className="px-3 py-1.5 rounded-xl bg-board-border/40 text-board-muted text-xs font-bold"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Builder view ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <button onClick={() => setPhase('list')} className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-base font-extrabold text-board-text">Build a Set</h1>
          <p className="text-xs text-board-muted">{selected.length} countries selected</p>
        </div>
        {selected.length >= 2 && (
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl bg-board-green text-white text-xs font-bold"
          >
            Save
          </button>
        )}
      </div>

      <div className="shrink-0 px-4 py-3 max-w-lg mx-auto w-full space-y-2 border-b border-board-border bg-board-card">
        {/* Set name */}
        <input
          type="text"
          value={setName}
          onChange={e => setSetName(e.target.value)}
          placeholder="Set name (e.g. The Balkans)"
          className="w-full px-3 py-2 rounded-xl bg-board-bg border border-board-border text-board-text text-sm font-semibold placeholder:text-board-muted/60 focus:outline-none focus:border-board-green"
        />

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search countries..."
          className="w-full px-3 py-2 rounded-xl bg-board-bg border border-board-border text-board-text text-sm font-semibold placeholder:text-board-muted/60 focus:outline-none focus:border-board-green"
        />

        {/* Region filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setRegionFilter('')}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              regionFilter === ''
                ? 'bg-board-green text-white border-board-green'
                : 'bg-board-bg border-board-border text-board-muted'
            }`}
          >
            All
          </button>
          {REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => setRegionFilter(regionFilter === r.id ? '' : r.id)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                regionFilter === r.id
                  ? 'bg-board-green text-white border-board-green'
                  : 'bg-board-bg border-board-border text-board-muted'
              }`}
            >
              {r.emoji} {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected preview strip */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 bg-board-green/5 border-b border-board-green/20 px-4 py-2 overflow-x-auto"
          >
            <div className="flex gap-1.5 max-w-lg mx-auto">
              {selected.map(a3 => (
                <button
                  key={a3}
                  onClick={() => toggle(a3)}
                  className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-board-green/15 border border-board-green/30 text-board-green text-[10px] font-bold"
                >
                  {COUNTRIES[a3]?.name ?? a3}
                  <span className="opacity-60">×</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Country list */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
        <div className="divide-y divide-board-border/50">
          {filtered.map(c => {
            const isSelected = selected.includes(c.alpha3);
            return (
              <button
                key={c.alpha3}
                onClick={() => toggle(c.alpha3)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected ? 'bg-board-green/5' : 'hover:bg-board-hover'
                }`}
              >
                <div className="w-10 h-7 shrink-0 rounded overflow-hidden border border-board-border/40">
                  {c.alpha2 && (
                    <img
                      src={`https://flagcdn.com/w40/${c.alpha2.toLowerCase()}.png`}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className={`flex-1 text-sm font-semibold ${isSelected ? 'text-board-green' : 'text-board-text'}`}>
                  {c.name}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'bg-board-green border-board-green' : 'border-board-border'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save footer */}
      <AnimatePresence>
        {selected.length >= 2 && (
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            className="shrink-0 bg-board-card border-t border-board-border px-4 py-4 max-w-lg mx-auto w-full"
          >
            <button
              onClick={handleSave}
              className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base"
            >
              Save Set — {selected.length} countries
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
