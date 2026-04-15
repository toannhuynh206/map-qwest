'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapThemeContext, THEME_COLORS, THEME_META } from '@/context/map-theme-context';
import { InteractiveMap } from '@/components/map/interactive-map';
import { USInteractiveMap } from '@/components/map/us-interactive-map';
import { TypeInput, type TypeInputHandle } from '@/components/typing/type-input';
import { GuessedList, type GuessedChip } from '@/components/typing/guessed-list';
import { useTypingStore } from '@/stores/typing-store';
import { buildPool, matchInput } from '@/lib/typing-match';
import { US_STATES } from '@/data/us-states';
import { COUNTRIES } from '@/data/countries';
import type { MapTheme, QuizRegion } from '@/types/quiz-config';
import type { CountryFeedback } from '@/components/map/country-path';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface TypingConfig {
  mode: 'countries' | 'states';
  region: QuizRegion;
  timeLimit: number | null; // seconds; null = no limit
  theme: MapTheme;
}

const DEFAULT_CONFIG: TypingConfig = {
  mode: 'countries',
  region: 'world',
  timeLimit: null,
  theme: 'classic',
};

const TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'No limit', value: null },
  { label: '5 min',    value: 300 },
  { label: '10 min',   value: 600 },
  { label: '15 min',   value: 900 },
];

const REGION_OPTIONS: { label: string; value: QuizRegion; emoji: string }[] = [
  { label: 'World',      value: 'world',        emoji: '🌍' },
  { label: 'Africa',     value: 'africa',        emoji: '🌍' },
  { label: 'Europe',     value: 'europe',        emoji: '🇪🇺' },
  { label: 'Asia',       value: 'asia',          emoji: '🌏' },
  { label: 'N. America', value: 'north_america', emoji: '🌎' },
  { label: 'S. America', value: 'south_america', emoji: '🌎' },
  { label: 'Oceania',    value: 'oceania',       emoji: '🌏' },
];

const THEMES: MapTheme[] = ['classic', 'political', 'colorful', 'terrain'];

// Approximate blob positions for map style previews
const US_PREVIEW_BLOBS = [
  { region: 'west',      style: { top: '20%', left: '4%',  width: '22%', height: '60%' } },
  { region: 'midwest',   style: { top: '15%', left: '30%', width: '22%', height: '55%' } },
  { region: 'southeast', style: { top: '30%', left: '55%', width: '22%', height: '55%' } },
  { region: 'northeast', style: { top: '10%', left: '72%', width: '20%', height: '40%' } },
  { region: 'southwest', style: { top: '55%', left: '30%', width: '20%', height: '35%' } },
];

const WORLD_PREVIEW_BLOBS = [
  { region: 'africa',        style: { top: '50%', left: '45%', width: '20%', height: '40%' } },
  { region: 'europe',        style: { top: '15%', left: '45%', width: '22%', height: '35%' } },
  { region: 'asia',          style: { top: '15%', left: '65%', width: '25%', height: '50%' } },
  { region: 'north_america', style: { top: '15%', left: '5%',  width: '22%', height: '45%' } },
  { region: 'south_america', style: { top: '55%', left: '15%', width: '15%', height: '35%' } },
  { region: 'oceania',       style: { top: '45%', left: '78%', width: '18%', height: '30%' } },
];

const EMPTY_SET = new Set<string>();
const NOOP = () => {};

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getEntryName(code: string, mode: 'countries' | 'states'): string {
  return mode === 'states'
    ? (US_STATES[code]?.name ?? code)
    : (COUNTRIES[code]?.name ?? code);
}

// ---------------------------------------------------------------------------
// Config screen
// ---------------------------------------------------------------------------

function ConfigScreen({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: (c: TypingConfig) => void;
}) {
  const [cfg, setCfg] = useState<TypingConfig>(DEFAULT_CONFIG);

  const set = <K extends keyof TypingConfig>(key: K, val: TypingConfig[K]) =>
    setCfg((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-board-border flex items-center justify-center text-board-muted hover:bg-board-hover transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-board-text">Name the Country</h1>
            <p className="text-xs text-board-muted">Type every country or state you can name</p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

          {/* Mode */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Mode
            </label>
            <div className="flex gap-2">
              {(['countries', 'states'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => set('mode', m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    cfg.mode === m
                      ? 'bg-board-green text-white border-board-green-dark shadow-sm'
                      : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                  }`}
                >
                  {m === 'countries' ? '🌍 Countries' : '🗺️ US States'}
                </button>
              ))}
            </div>
          </section>

          {/* Region (countries only) */}
          {cfg.mode === 'countries' && (
            <section>
              <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
                Region
              </label>
              <div className="flex gap-2 flex-wrap">
                {REGION_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => set('region', o.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                      cfg.region === o.value
                        ? 'bg-board-green text-white border-board-green-dark shadow-sm'
                        : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                    }`}
                  >
                    {o.emoji} {o.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Timer */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Time Limit
            </label>
            <div className="flex gap-2 flex-wrap">
              {TIMER_OPTIONS.map((o) => (
                <button
                  key={String(o.value)}
                  onClick={() => set('timeLimit', o.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    cfg.timeLimit === o.value
                      ? 'bg-board-text text-white border-board-text shadow-sm'
                      : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* Map style */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Map Style
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {THEMES.map((t) => {
                const colors   = THEME_COLORS[t];
                const meta     = THEME_META[t];
                const selected = cfg.theme === t;
                const blobs    = cfg.mode === 'states' ? US_PREVIEW_BLOBS : WORLD_PREVIEW_BLOBS;
                return (
                  <button
                    key={t}
                    onClick={() => set('theme', t)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-board-green shadow-md' : 'border-board-border hover:border-board-muted'
                    }`}
                  >
                    <div className="relative h-14 w-full" style={{ background: colors.ocean }}>
                      {blobs.map(({ region, style }) => {
                        const fill = cfg.mode === 'states'
                          ? colors.getStateFill('', region)
                          : colors.getCountryFill('', region);
                        return (
                          <div
                            key={region}
                            className="absolute"
                            style={{
                              ...style,
                              background: fill,
                              borderRadius: '30% 40% 40% 30% / 35% 35% 40% 40%',
                              opacity: 0.95,
                            }}
                          />
                        );
                      })}
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-board-green rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="white">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1.5 text-center ${selected ? 'bg-green-50' : 'bg-board-card'}`}>
                      <div className="text-xs font-extrabold text-board-text">{meta.name}</div>
                      <div className="text-[10px] text-board-muted">{meta.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      {/* Start button */}
      <div className="bg-board-card border-t border-board-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => onStart(cfg)}
            className="w-full py-3.5 bg-board-green hover:bg-board-green-dark text-white font-extrabold text-base rounded-2xl shadow-md btn-chunky transition-colors active:scale-[0.99]"
          >
            Start →
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game screen
// ---------------------------------------------------------------------------

function GameScreen({
  config,
  onFinish,
}: {
  config: TypingConfig;
  onFinish: () => void;
}) {
  const guessed    = useTypingStore((s) => s.guessed);
  const revealed   = useTypingStore((s) => s.revealed);
  const status     = useTypingStore((s) => s.status);
  const startedAt  = useTypingStore((s) => s.startedAt);
  const pool       = useTypingStore((s) => s.pool);
  const addGuess   = useTypingStore((s) => s.addGuess);
  const giveUp     = useTypingStore((s) => s.giveUp);

  const inputRef = useRef<TypeInputHandle>(null);
  const [currentValue, setCurrentValue] = useState('');
  const [remaining, setRemaining] = useState<number | null>(config.timeLimit);

  const { lookup } = useMemo(
    () => buildPool(config.mode, config.region),
    [config.mode, config.region],
  );

  const guessedSet = useMemo(() => new Set(guessed), [guessed]);

  const feedbackMap = useMemo((): Record<string, CountryFeedback> => {
    const map: Record<string, CountryFeedback> = {};
    for (const code of guessed)  map[code] = 'correct';
    for (const code of revealed) map[code] = 'missed';
    return map;
  }, [guessed, revealed]);

  const guessedChips = useMemo(
    (): GuessedChip[] =>
      guessed.map((code) => ({ code, name: getEntryName(code, config.mode) })),
    [guessed, config.mode],
  );

  // Countdown timer
  useEffect(() => {
    if (!config.timeLimit || status !== 'playing') return;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, config.timeLimit! - elapsed);
      setRemaining(left);
      if (left === 0) giveUp();
    }, 500);
    return () => clearInterval(id);
  }, [config.timeLimit, startedAt, status, giveUp]);

  // Transition to results when done
  useEffect(() => {
    if (status === 'finished') onFinish();
  }, [status, onFinish]);

  const handleInput = useCallback(
    (value: string) => {
      setCurrentValue(value);
      const code = matchInput(value, lookup, guessedSet);
      if (code) {
        addGuess(code);
        inputRef.current?.clear();
        setCurrentValue('');
      }
    },
    [lookup, guessedSet, addGuess],
  );

  const handleEnter = useCallback(() => {
    if (!currentValue.trim()) return;
    const code = matchInput(currentValue, lookup, guessedSet);
    if (code) {
      addGuess(code);
      inputRef.current?.clear();
      setCurrentValue('');
    } else {
      inputRef.current?.shake();
    }
  }, [currentValue, lookup, guessedSet, addGuess]);

  const total     = pool.length;
  const found     = guessed.length;
  const isTimeLow = config.timeLimit !== null && remaining !== null && remaining < 60;

  return (
    <div className="h-dvh flex flex-col bg-board-bg overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-board-card border-b border-board-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-board-muted">
              {config.mode === 'states' ? '🗺️' : '🌍'}
            </span>
            <span className="text-sm font-bold text-board-text">
              {found}
              <span className="text-board-muted">/{total}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {config.timeLimit !== null && remaining !== null && (
              <span
                className="text-sm font-black tabular-nums"
                style={{ color: isTimeLow ? '#FF4B4B' : undefined }}
              >
                {formatTime(remaining)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0">
        <MapThemeContext.Provider value={config.theme}>
          {config.mode === 'states' ? (
            <USInteractiveMap
              onStateSelect={NOOP}
              feedbackMap={feedbackMap}
              dimmedStates={EMPTY_SET}
              disabled={true}
            />
          ) : (
            <InteractiveMap
              onCountrySelect={NOOP}
              feedbackMap={feedbackMap}
              dimmedCountries={EMPTY_SET}
              disabled={true}
            />
          )}
        </MapThemeContext.Provider>
      </div>

      {/* Guessed chips */}
      <div className="shrink-0 border-t border-board-border py-2 bg-board-bg">
        <GuessedList guessed={guessedChips} />
      </div>

      {/* Input row */}
      <div className="shrink-0 bg-board-card border-t border-board-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <TypeInput
            ref={inputRef}
            onInput={handleInput}
            onEnter={handleEnter}
            disabled={status !== 'playing'}
            placeholder={config.mode === 'states' ? 'Type a US state…' : 'Type a country…'}
          />
          <button
            onClick={giveUp}
            className="shrink-0 px-4 py-2.5 rounded-2xl border border-board-border text-board-muted text-sm font-bold hover:bg-board-hover hover:text-board-text transition-colors"
          >
            Give Up
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------

function ResultsScreen({
  config,
  onPlayAgain,
}: {
  config: TypingConfig;
  onPlayAgain: () => void;
}) {
  const guessed    = useTypingStore((s) => s.guessed);
  const revealed   = useTypingStore((s) => s.revealed);
  const pool       = useTypingStore((s) => s.pool);
  const startedAt  = useTypingStore((s) => s.startedAt);
  const finishedAt = useTypingStore((s) => s.finishedAt);

  const total   = pool.length;
  const found   = guessed.length;
  const missed  = revealed.length;
  const pct     = total > 0 ? Math.round((found / total) * 100) : 0;
  const elapsed = finishedAt && startedAt ? Math.floor((finishedAt - startedAt) / 1000) : 0;

  const headline =
    pct === 100 ? '🎉 Perfect score!' :
    pct >= 80   ? '🌟 Great job!'     :
    pct >= 50   ? '👏 Good effort!'   :
                  '📚 Keep learning!';

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-base font-extrabold text-board-text">{headline}</h1>
          <p className="text-xs text-board-muted">
            {config.mode === 'states' ? 'US States' : 'Countries'} · {formatTime(elapsed)}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

          {/* Score card */}
          <div className="bg-board-card border border-board-border rounded-2xl p-5">
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-5xl font-black text-board-green">{found}</span>
              <span className="text-2xl font-black text-board-muted">/{total}</span>
            </div>
            <div className="w-full bg-board-border rounded-full h-2.5">
              <div
                className="bg-board-green h-2.5 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-board-muted mt-2">
              {pct}% found · {missed} missed
            </p>
          </div>

          {/* Missed list */}
          {revealed.length > 0 && (
            <section>
              <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">
                Missed ({missed})
              </p>
              <div className="flex flex-wrap gap-2">
                {revealed.map((code) => (
                  <span
                    key={code}
                    className="px-2.5 py-1 rounded-full bg-board-border/40 text-board-muted text-xs font-semibold"
                  >
                    {getEntryName(code, config.mode)}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Guessed list */}
          {guessed.length > 0 && (
            <section>
              <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">
                You got ({found})
              </p>
              <div className="flex flex-wrap gap-2">
                {guessed.map((code) => (
                  <span
                    key={code}
                    className="px-2.5 py-1 rounded-full bg-board-green/15 text-board-green text-xs font-bold border border-board-green/30"
                  >
                    {getEntryName(code, config.mode)}
                  </span>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Play again */}
      <div className="bg-board-card border-t border-board-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-board-green hover:bg-board-green-dark text-white font-extrabold text-base rounded-2xl shadow-md btn-chunky transition-colors active:scale-[0.99]"
          >
            Play Again →
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — manages phase transitions
// ---------------------------------------------------------------------------

type Phase = 'config' | 'playing' | 'results';

export default function TypingPage() {
  const router = useRouter();
  const [phase, setPhase]   = useState<Phase>('config');
  const [config, setConfig] = useState<TypingConfig>(DEFAULT_CONFIG);
  const start = useTypingStore((s) => s.start);
  const reset = useTypingStore((s) => s.reset);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleStart = useCallback(
    (cfg: TypingConfig) => {
      const { pool } = buildPool(cfg.mode, cfg.region);
      setConfig(cfg);
      start({ mode: cfg.mode, pool, theme: cfg.theme, timeLimit: cfg.timeLimit });
      setPhase('playing');
    },
    [start],
  );

  const handleFinish = useCallback(() => setPhase('results'), []);

  const handlePlayAgain = useCallback(() => {
    reset();
    setPhase('config');
  }, [reset]);

  if (phase === 'config')  return <ConfigScreen onBack={handleBack} onStart={handleStart} />;
  if (phase === 'playing') return <GameScreen config={config} onFinish={handleFinish} />;
  return <ResultsScreen config={config} onPlayAgain={handlePlayAgain} />;
}
