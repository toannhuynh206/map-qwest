'use client';

import { useState, useRef } from 'react';
import { THEME_COLORS, THEME_META } from '@/context/map-theme-context';
import {
  DEFAULT_QUIZ_CONFIG,
  type QuizRegion,
  type MapTheme,
  type TimerOption,
  type QuestionCount,
} from '@/types/quiz-config';
import { COUNTRIES } from '@/data/countries';
import { SMALL_COUNTRY_COORDS } from '@/data/country-coordinates';
import { getCountriesByRegion, type Region } from '@/data/countries';

export type FlagsMode = 'multiple-choice' | 'pin-it' | 'type-it';

export interface FlagsConfig {
  region: QuizRegion;
  flagsMode: FlagsMode;
  questionCount: QuestionCount;
  timer: TimerOption;
  customTimerSeconds?: number;
  theme: MapTheme;
}

const MODES: { id: FlagsMode; icon: string; title: string; description: string }[] = [
  { id: 'multiple-choice', icon: '🔤', title: 'Multiple Choice', description: 'Pick the country name from 4 options' },
  { id: 'pin-it',          icon: '📍', title: 'Pin It',           description: 'Tap where the country is on the map' },
  { id: 'type-it',         icon: '⌨️', title: 'Type It',          description: 'Type the country name from memory' },
];

const TIMER_OPTIONS: { value: TimerOption; label: string }[] = [
  { value: 'off',    label: 'Off'    },
  { value: '30s',    label: '30s'    },
  { value: '1min',   label: '1 min'  },
  { value: '2min',   label: '2 min'  },
  { value: 'custom', label: 'Custom' },
];

const WORLD_PREVIEW_BLOBS = [
  { region: 'africa',        style: { top: '50%', left: '45%', width: '20%', height: '40%' } },
  { region: 'europe',        style: { top: '15%', left: '45%', width: '22%', height: '35%' } },
  { region: 'asia',          style: { top: '15%', left: '65%', width: '25%', height: '50%' } },
  { region: 'north_america', style: { top: '15%', left: '5%',  width: '22%', height: '45%' } },
  { region: 'south_america', style: { top: '55%', left: '15%', width: '15%', height: '35%' } },
  { region: 'oceania',       style: { top: '45%', left: '78%', width: '18%', height: '30%' } },
];

const THEMES: MapTheme[] = ['classic', 'political', 'colorful', 'terrain'];

function getCount(region: QuizRegion): number {
  if (region === 'world') return Object.keys(COUNTRIES).length;
  if (region === 'pin_mini') {
    const s = new Set(Object.keys(SMALL_COUNTRY_COORDS));
    return Object.values(COUNTRIES).filter((c) => s.has(c.alpha3)).length;
  }
  return getCountriesByRegion(region as Region).length;
}

interface FlagsConfigScreenProps {
  region: QuizRegion;
  onBack: () => void;
  onStart: (cfg: FlagsConfig) => void;
}

export function FlagsConfigScreen({ region, onBack, onStart }: FlagsConfigScreenProps) {
  const total = getCount(region);

  const ALL_Q_OPTIONS: { value: QuestionCount; label: string }[] = [
    { value: 10,    label: '10'         },
    { value: 25,    label: '25'         },
    { value: 50,    label: '50'         },
    { value: 'all', label: `All ${total}` },
  ];
  const questionOptions = ALL_Q_OPTIONS.filter(
    (o) => o.value === 'all' || (o.value as number) <= total,
  );

  const [flagsMode,       setFlagsMode]       = useState<FlagsMode>('multiple-choice');
  const [questionCount,   setQuestionCount]   = useState<QuestionCount>(total >= 10 ? 10 : 'all');
  const [timer,           setTimer]           = useState<TimerOption>(DEFAULT_QUIZ_CONFIG.timer);
  const [customTimerSecs, setCustomTimerSecs] = useState(45);
  const [theme,           setTheme]           = useState<MapTheme>(DEFAULT_QUIZ_CONFIG.theme);
  const customInputRef = useRef<HTMLInputElement>(null);

  const showMap = flagsMode === 'pin-it' || flagsMode === 'type-it';

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
            <h1 className="text-base font-extrabold text-board-text">Guess the Flag</h1>
            <p className="text-xs text-board-muted">Choose how to play</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

          {/* Mode */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3 block">
              Game Mode
            </label>
            <div className="space-y-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFlagsMode(m.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                    flagsMode === m.id
                      ? 'border-board-green bg-board-green/5 shadow-sm'
                      : 'border-board-border bg-board-card hover:bg-board-hover'
                  }`}
                >
                  <span className="text-2xl w-9 shrink-0 text-center">{m.icon}</span>
                  <div>
                    <p className={`text-sm font-extrabold ${flagsMode === m.id ? 'text-board-green' : 'text-board-text'}`}>
                      {m.title}
                    </p>
                    <p className="text-xs text-board-muted">{m.description}</p>
                  </div>
                  {flagsMode === m.id && (
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

          {/* Questions */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Questions
            </label>
            <div className="flex gap-2 flex-wrap">
              {questionOptions.map((o) => (
                <button
                  key={String(o.value)}
                  onClick={() => setQuestionCount(o.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    questionCount === o.value
                      ? 'bg-board-green text-white border-board-green-dark shadow-sm'
                      : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* Timer */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Timer per Question
            </label>
            <div className="flex gap-2 flex-wrap">
              {TIMER_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setTimer(o.value); if (o.value === 'custom') setTimeout(() => customInputRef.current?.focus(), 50); }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    timer === o.value
                      ? 'bg-board-text text-white border-board-text shadow-sm'
                      : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {timer === 'custom' && (
              <div className="mt-3 flex items-center gap-3 bg-board-card border border-board-border rounded-2xl px-4 py-3">
                <span className="text-sm text-board-muted shrink-0">Seconds per question</span>
                <input
                  ref={customInputRef}
                  type="number"
                  min={5}
                  max={300}
                  value={customTimerSecs}
                  onChange={(e) => setCustomTimerSecs(Math.max(5, Math.min(300, Number(e.target.value) || 5)))}
                  className="w-20 text-center text-base font-bold bg-board-bg border border-board-border rounded-xl px-2 py-1.5 text-board-text focus:outline-none focus:border-board-green transition-colors"
                />
                <span className="text-sm font-bold text-board-text shrink-0">sec</span>
              </div>
            )}
          </section>

          {/* Map style — only relevant for map modes */}
          {showMap && (
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
                        {WORLD_PREVIEW_BLOBS.map(({ region: r, style }) => (
                          <div
                            key={r}
                            className="absolute"
                            style={{
                              ...style,
                              background: colors.getCountryFill('', r),
                              borderRadius: '30% 40% 40% 30% / 35% 35% 40% 40%',
                              opacity: 0.95,
                            }}
                          />
                        ))}
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
          )}

        </div>
      </div>

      {/* Start */}
      <div className="bg-board-card border-t border-board-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => onStart({ region, flagsMode, questionCount, timer, customTimerSeconds: timer === 'custom' ? customTimerSecs : undefined, theme })}
            className="w-full py-3.5 bg-board-green hover:bg-board-green-dark text-white font-extrabold text-base rounded-2xl shadow-md btn-chunky transition-colors active:scale-[0.99]"
          >
            Start →
          </button>
        </div>
      </div>
    </div>
  );
}
