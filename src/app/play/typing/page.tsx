'use client';

import { useState, useRef, useMemo, useEffect, useCallback, memo } from 'react';
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
import { getScoreTier, getEndMessage } from '@/data/end-messages';
import { getRandomFunFact, regionToFactCategory } from '@/data/fun-facts';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface TypingConfig {
  mode: 'countries' | 'states';
  region: QuizRegion;
  timeLimit: number | null; // seconds; null = no limit
  theme: MapTheme;
  difficulty: 'normal' | 'expert';
}

const DEFAULT_CONFIG: TypingConfig = {
  mode: 'countries',
  region: 'world',
  timeLimit: null,
  theme: 'classic',
  difficulty: 'normal',
};

const PRESET_TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'No limit', value: null },
  { label: '5 min',    value: 300 },
  { label: '10 min',   value: 600 },
  { label: '15 min',   value: 900 },
];

const TYPING_REGIONS: { id: QuizRegion; name: string; emoji: string; accent: string; description: string }[] = [
  { id: 'africa',        name: 'Africa',        emoji: '🌍', accent: '#FF9500', description: 'Sub-Saharan & North Africa' },
  { id: 'europe',        name: 'Europe',        emoji: '🏛️', accent: '#007AFF', description: 'Western, Eastern & Northern' },
  { id: 'asia',          name: 'Asia',          emoji: '🌏', accent: '#AF52DE', description: 'East, South & Southeast Asia' },
  { id: 'north_america', name: 'North America', emoji: '🌎', accent: '#FF3B30', description: 'Caribbean & Central America' },
  { id: 'south_america', name: 'South America', emoji: '🌎', accent: '#34C759', description: '12 sovereign nations' },
  { id: 'oceania',       name: 'Oceania',       emoji: '🏝️', accent: '#32ADE6', description: 'Pacific Islands & Australasia' },
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
// Region select screen  (matches Pin the Country's RegionSelectScreen style)
// ---------------------------------------------------------------------------

function RegionScreen({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (mode: 'countries' | 'states', region: QuizRegion) => void;
}) {
  const [mode, setMode] = useState<'countries' | 'states'>('countries');
  const worldCount = buildPool('countries', 'world').pool.length;

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
            <p className="text-xs text-board-muted">Choose what to practice</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

          {/* Mode toggle */}
          <div className="flex gap-2">
            {(['countries', 'states'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  mode === m
                    ? 'bg-board-green text-white border-board-green-dark shadow-sm'
                    : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                }`}
              >
                {m === 'countries' ? '🌍 Countries' : '🗺️ US States'}
              </button>
            ))}
          </div>

          {mode === 'countries' ? (
            <>
              {/* World — full-width featured card */}
              <button
                onClick={() => onSelect('countries', 'world')}
                className="w-full bg-board-card border border-board-border rounded-2xl p-4 flex items-center gap-4 hover:bg-board-hover active:scale-[0.99] transition-all text-left shadow-sm"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #58CC02 0%, #46A302 100%)' }}
                >
                  🌍
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-board-text text-base">World</div>
                  <div className="text-xs text-board-muted">All {worldCount} countries</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-board-green bg-green-50 px-2 py-0.5 rounded-full">
                    {worldCount}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58CC02" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Region grid */}
              <div className="grid grid-cols-2 gap-3">
                {TYPING_REGIONS.map((r) => {
                  const count = buildPool('countries', r.id).pool.length;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelect('countries', r.id)}
                      className="bg-board-card border border-board-border rounded-2xl p-3 flex flex-col gap-2 hover:bg-board-hover active:scale-[0.98] transition-all text-left shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${r.accent}20` }}
                        >
                          {r.emoji}
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${r.accent}18`, color: r.accent }}
                        >
                          {count}
                        </span>
                      </div>
                      <div>
                        <div className="font-extrabold text-board-text text-sm">{r.name}</div>
                        <div className="text-[11px] text-board-muted leading-tight">{r.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* US States — single card */
            <button
              onClick={() => onSelect('states', 'world')}
              className="w-full bg-board-card border border-board-border rounded-2xl p-4 flex items-center gap-4 hover:bg-board-hover active:scale-[0.99] transition-all text-left shadow-sm"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)' }}
              >
                🗺️
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-board-text text-base">All 50 States</div>
                <div className="text-xs text-board-muted">Name every US state</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-full">50</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Options screen  (timer + map style — shown after region is chosen)
// ---------------------------------------------------------------------------

function OptionsScreen({
  config,
  onBack,
  onStart,
}: {
  config: TypingConfig;
  onBack: () => void;
  onStart: (c: TypingConfig) => void;
}) {
  const [timeLimit,      setTimeLimit]      = useState<number | null>(config.timeLimit);
  const [customMinutes,  setCustomMinutes]  = useState(7);
  const [isCustomTimer,  setIsCustomTimer]  = useState(false);
  const [theme,          setTheme]          = useState<MapTheme>(config.theme);
  const [difficulty,     setDifficulty]     = useState<'normal' | 'expert'>(config.difficulty);
  const customTimerRef = useRef<HTMLInputElement>(null);
  const blobs = config.mode === 'states' ? US_PREVIEW_BLOBS : WORLD_PREVIEW_BLOBS;

  const regionLabel =
    config.mode === 'states'
      ? 'US States'
      : (TYPING_REGIONS.find((r) => r.id === config.region)?.name ?? 'World');

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
            <h1 className="text-base font-extrabold text-board-text">{regionLabel}</h1>
            <p className="text-xs text-board-muted">Name the Country</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

          {/* Difficulty */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Difficulty
            </label>
            <div className="space-y-2">
              {([
                {
                  id: 'normal' as const,
                  icon: '😊',
                  title: 'Normal',
                  description: config.mode === 'states'
                    ? 'Abbreviations accepted — "NY" counts for New York'
                    : 'Partial names accepted — "Antigua" counts for "Antigua and Barbuda"',
                },
                {
                  id: 'expert' as const,
                  icon: '🎓',
                  title: 'Expert',
                  description: config.mode === 'states'
                    ? 'Full state name required — must type New York'
                    : 'Full official name required — must type "Antigua and Barbuda"',
                },
              ] as const).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                    difficulty === d.id
                      ? 'border-board-green bg-board-green/5 shadow-sm'
                      : 'border-board-border bg-board-card hover:bg-board-hover'
                  }`}
                >
                  <span className="text-2xl w-9 shrink-0 text-center">{d.icon}</span>
                  <div>
                    <p className={`text-sm font-extrabold ${difficulty === d.id ? 'text-board-green' : 'text-board-text'}`}>
                      {d.title}
                    </p>
                    <p className="text-xs text-board-muted">{d.description}</p>
                  </div>
                  {difficulty === d.id && (
                    <div className="ml-auto w-5 h-5 bg-board-green rounded-full flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Timer */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Time Limit
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_TIMER_OPTIONS.map((o) => (
                <button
                  key={String(o.value)}
                  onClick={() => { setTimeLimit(o.value); setIsCustomTimer(false); }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    !isCustomTimer && timeLimit === o.value
                      ? 'bg-board-text text-white border-board-text shadow-sm'
                      : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                  }`}
                >
                  {o.label}
                </button>
              ))}
              <button
                onClick={() => { setIsCustomTimer(true); setTimeLimit(customMinutes * 60); setTimeout(() => customTimerRef.current?.focus(), 50); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  isCustomTimer
                    ? 'bg-board-text text-white border-board-text shadow-sm'
                    : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                }`}
              >
                Custom
              </button>
            </div>
            {isCustomTimer && (
              <div className="mt-3 flex items-center gap-3 bg-board-card border border-board-border rounded-2xl px-4 py-3">
                <span className="text-sm text-board-muted shrink-0">Total time</span>
                <input
                  ref={customTimerRef}
                  type="number"
                  min={1}
                  max={120}
                  value={customMinutes}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(120, Number(e.target.value) || 1));
                    setCustomMinutes(v);
                    setTimeLimit(v * 60);
                  }}
                  className="w-20 text-center text-base font-bold bg-board-bg border border-board-border rounded-xl px-2 py-1.5 text-board-text focus:outline-none focus:border-board-green transition-colors"
                />
                <span className="text-sm font-bold text-board-text shrink-0">min</span>
              </div>
            )}
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
                const selected = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-board-green shadow-md' : 'border-board-border hover:border-board-muted'
                    }`}
                  >
                    <div className="relative h-14 w-full" style={{ background: colors.ocean }}>
                      {blobs.map(({ region, style }) => {
                        const fill = config.mode === 'states'
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
            onClick={() => onStart({ ...config, timeLimit, theme, difficulty })}
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
    () => buildPool(config.mode, config.region, config.difficulty),
    [config.mode, config.region, config.difficulty],
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

  const timerFraction =
    config.timeLimit && remaining !== null ? remaining / config.timeLimit : null;
  const R    = 10;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="h-dvh flex flex-col bg-board-bg overflow-hidden">
      {/* Header — matches QuizHeader layout */}
      <div className="w-full bg-board-card border-b border-board-border shrink-0">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">

          {/* Give Up (✕) */}
          <button
            onClick={giveUp}
            className="text-board-muted hover:text-board-text transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Timer ring — same SVG ring as QuizHeader, or spacer */}
          {config.timeLimit !== null && remaining !== null ? (
            <div className={`flex items-center gap-1.5 ${isTimeLow ? 'text-red-500' : 'text-board-muted'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r={R} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.2} />
                <circle
                  cx="12" cy="12" r={R}
                  fill="none" stroke="currentColor" strokeWidth={2}
                  strokeDasharray={CIRC}
                  strokeDashoffset={timerFraction !== null ? CIRC * (1 - timerFraction) : 0}
                  strokeLinecap="round"
                  transform="rotate(-90 12 12)"
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>
              <span className="text-sm font-bold tabular-nums min-w-[3ch] text-center">
                {formatTime(remaining)}
              </span>
            </div>
          ) : (
            <div className="w-14" />
          )}

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-board-green flex items-center justify-center text-white text-[10px] font-bold">✓</span>
              <span className="text-sm font-bold text-board-green">{found}</span>
            </div>
            <div className="w-px h-4 bg-board-border" />
            <span className="text-sm font-bold text-board-muted">{total - found} left</span>
          </div>
        </div>

        {/* Prompt row */}
        <div className="px-4 pb-3 text-center">
          <p className="text-lg font-extrabold text-board-text">
            Name every{' '}
            <span className="text-board-green">
              {config.mode === 'states' ? 'US state' : 'country'}
            </span>
          </p>
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

      {/* Input row — full width, no Give Up (✕ handles it) */}
      <div className="shrink-0 bg-board-card border-t border-board-border px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <TypeInput
            ref={inputRef}
            onInput={handleInput}
            onEnter={handleEnter}
            disabled={status !== 'playing'}
            placeholder={config.mode === 'states' ? 'Type a US state…' : 'Type a country…'}
          />
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

  const endMessage = useMemo(() => getEndMessage(getScoreTier(found, total)), [found, total]);
  const funFact    = useMemo(() => getRandomFunFact(regionToFactCategory(config.mode, config.region)), [config.mode, config.region]);

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-base font-extrabold text-board-text">{endMessage}</h1>
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

          {/* Fun fact */}
          <div className="bg-board-card border border-board-border rounded-2xl px-4 py-3 flex gap-3 items-start">
            <span className="text-xl shrink-0">🌍</span>
            <div>
              <p className="text-[10px] font-bold text-board-green uppercase tracking-wider mb-0.5">Did you know?</p>
              <p className="text-sm text-board-text leading-snug">{funFact}</p>
            </div>
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

type Phase = 'region' | 'options' | 'playing' | 'results';

export default function TypingPage() {
  const router = useRouter();
  const [phase, setPhase]   = useState<Phase>('region');
  const [config, setConfig] = useState<TypingConfig>(DEFAULT_CONFIG);
  const start = useTypingStore((s) => s.start);
  const reset = useTypingStore((s) => s.reset);

  const handleBack = useCallback(() => { reset(); router.back(); }, [reset, router]);

  const handleRegionSelect = useCallback(
    (mode: 'countries' | 'states', region: QuizRegion) => {
      setConfig((prev) => ({ ...prev, mode, region }));
      setPhase('options');
    },
    [],
  );

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
    setPhase('region');
  }, [reset]);

  if (phase === 'region')  return <RegionScreen onBack={handleBack} onSelect={handleRegionSelect} />;
  if (phase === 'options') return <OptionsScreen config={config} onBack={() => setPhase('region')} onStart={handleStart} />;
  if (phase === 'playing') return <GameScreen config={config} onFinish={handleFinish} />;
  return <ResultsScreen config={config} onPlayAgain={handlePlayAgain} />;
}
