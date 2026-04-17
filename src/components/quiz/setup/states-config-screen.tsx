'use client';

import { useState, useRef } from 'react';
import { THEME_COLORS, THEME_META } from '@/context/map-theme-context';
import type { TimerOption, QuestionCount, MapTheme } from '@/types/quiz-config';

const TOTAL_STATES = 50;

const TIMER_OPTIONS: { value: TimerOption; label: string }[] = [
  { value: 'off',    label: 'Off'    },
  { value: '30s',    label: '30s'    },
  { value: '1min',   label: '1 min'  },
  { value: '2min',   label: '2 min'  },
  { value: 'custom', label: 'Custom' },
];

const QUESTION_OPTIONS: { value: QuestionCount; label: string }[] = [
  { value: 10,  label: '10'       },
  { value: 25,  label: '25'       },
  { value: 50,  label: `All ${TOTAL_STATES}` },
];

const THEMES: MapTheme[] = ['classic', 'political', 'colorful', 'terrain'];

// Representative US region colors used for the mini-map preview blobs
const US_PREVIEW_REGIONS = ['west', 'midwest', 'southeast', 'northeast', 'southwest'];

export interface StatesQuizConfig {
  questionCount: QuestionCount;
  timer: TimerOption;
  customTimerSeconds?: number;
  theme: MapTheme;
  persistFeedback: boolean;
}

interface StatesConfigScreenProps {
  onBack: () => void;
  onStart: (config: StatesQuizConfig) => void;
}

export function StatesConfigScreen({ onBack, onStart }: StatesConfigScreenProps) {
  const [questionCount,    setQuestionCount]    = useState<QuestionCount>(10);
  const [timer,            setTimer]            = useState<TimerOption>('off');
  const [customTimerSecs,  setCustomTimerSecs]  = useState(45);
  const [theme,            setTheme]            = useState<MapTheme>('classic');
  const [persistFeedback,  setPersistFeedback]  = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

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
            <h1 className="text-base font-extrabold text-board-text">US States</h1>
            <p className="text-xs text-board-muted">Pin the State</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

          {/* Questions */}
          <section>
            <label className="text-xs font-bold text-board-muted uppercase tracking-wider mb-2 block">
              Questions
            </label>
            <div className="flex gap-2 flex-wrap">
              {QUESTION_OPTIONS.map((o) => (
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

          {/* Persist feedback */}
          <section>
            <button
              onClick={() => setPersistFeedback((v) => !v)}
              className="w-full flex items-center justify-between bg-board-card border border-board-border rounded-2xl px-4 py-3.5 hover:bg-board-hover transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-bold text-board-text">Lock answers on map</p>
                <p className="text-xs text-board-muted mt-0.5">
                  Correct stays green, wrong stays red as you progress
                </p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${persistFeedback ? 'bg-board-green' : 'bg-board-border'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${persistFeedback ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </section>

          {/* Map Style */}
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
                    {/* Mini US map preview — blobs for each region */}
                    <div className="relative h-14 w-full" style={{ background: colors.ocean }}>
                      {US_PREVIEW_REGIONS.map((region, i) => {
                        const previewFill = colors.getStateFill('', region);
                        // Approximate region positions across the US shape
                        const positions = [
                          { top: '20%', left: '4%',  width: '22%', height: '60%' }, // west
                          { top: '15%', left: '30%', width: '22%', height: '55%' }, // midwest
                          { top: '30%', left: '55%', width: '22%', height: '55%' }, // southeast
                          { top: '10%', left: '72%', width: '20%', height: '40%' }, // northeast
                          { top: '55%', left: '30%', width: '20%', height: '35%' }, // southwest
                        ];
                        const pos = positions[i];
                        return (
                          <div
                            key={region}
                            className="absolute"
                            style={{
                              ...pos,
                              background: previewFill,
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
            onClick={() => onStart({ questionCount, timer, customTimerSeconds: timer === 'custom' ? customTimerSecs : undefined, theme, persistFeedback })}
            className="w-full py-3.5 bg-board-green hover:bg-board-green-dark text-white font-extrabold text-base rounded-2xl shadow-md btn-chunky transition-colors active:scale-[0.99]"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}
