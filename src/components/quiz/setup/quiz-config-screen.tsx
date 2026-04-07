'use client';

import { useState } from 'react';
import { COUNTRIES } from '@/data/countries';
import { SMALL_COUNTRY_COORDS } from '@/data/country-coordinates';
import { THEME_COLORS, THEME_META } from '@/context/map-theme-context';
import {
  DEFAULT_QUIZ_CONFIG,
  type QuizConfig,
  type QuizRegion,
  type MapTheme,
  type TimerOption,
  type QuestionCount,
} from '@/types/quiz-config';

const REGION_LABELS: Record<QuizRegion, string> = {
  world: 'World',
  africa: 'Africa',
  europe: 'Europe',
  asia: 'Asia',
  north_america: 'North America',
  south_america: 'South America',
  oceania: 'Oceania',
  pin_mini: 'Pin Mini',
};

function getCountryCount(region: QuizRegion): number {
  if (region === 'world') return Object.keys(COUNTRIES).length;
  if (region === 'pin_mini') {
    const smallCodes = new Set(Object.keys(SMALL_COUNTRY_COORDS));
    return Object.values(COUNTRIES).filter((c) => smallCodes.has(c.alpha3)).length;
  }
  return Object.values(COUNTRIES).filter((c) => c.region === region).length;
}

const TIMER_OPTIONS: { value: TimerOption; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: '30s', label: '30s' },
  { value: '1min', label: '1 min' },
  { value: '2min', label: '2 min' },
];

const THEMES: MapTheme[] = ['classic', 'political', 'colorful', 'terrain'];

interface QuizConfigScreenProps {
  region: QuizRegion;
  onBack: () => void;
  onStart: (config: QuizConfig) => void;
}

export function QuizConfigScreen({ region, onBack, onStart }: QuizConfigScreenProps) {
  const totalCount = getCountryCount(region);

  const ALL_QUESTION_OPTIONS: { value: QuestionCount; label: string }[] = [
    { value: 10 as QuestionCount, label: '10' },
    { value: 25 as QuestionCount, label: '25' },
    { value: 50 as QuestionCount, label: '50' },
    { value: 'all' as QuestionCount, label: `All ${totalCount}` },
  ];

  const questionOptions = ALL_QUESTION_OPTIONS.filter(
    (o) => o.value === 'all' || (o.value as number) <= totalCount,
  );

  const [questionCount, setQuestionCount] = useState<QuestionCount>(
    totalCount >= 10 ? 10 : 'all',
  );
  const [timer, setTimer] = useState<TimerOption>(DEFAULT_QUIZ_CONFIG.timer);
  const [theme, setTheme] = useState<MapTheme>(DEFAULT_QUIZ_CONFIG.theme);
  const [persistFeedback, setPersistFeedback] = useState(DEFAULT_QUIZ_CONFIG.persistFeedback);

  function handleStart() {
    onStart({ region, questionCount, timer, theme, persistFeedback });
  }

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
            <h1 className="text-base font-extrabold text-board-text">{REGION_LABELS[region]}</h1>
            <p className="text-xs text-board-muted">Pin the Country</p>
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
                  onClick={() => setTimer(o.value)}
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
          </section>

          {/* Persist Feedback */}
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
                const colors = THEME_COLORS[t];
                const meta = THEME_META[t];
                const selected = theme === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all ${
                      selected ? 'border-board-green shadow-md' : 'border-board-border hover:border-board-muted'
                    }`}
                  >
                    {/* Mini map preview */}
                    <div
                      className="relative h-14 w-full"
                      style={{ background: colors.ocean }}
                    >
                      {/* Simplified land mass blobs */}
                      <div
                        className="absolute"
                        style={{
                          top: '18%', left: '12%',
                          width: '35%', height: '55%',
                          background: colors.getCountryFill('AFR', 'africa'),
                          borderRadius: '30% 40% 50% 30% / 30% 30% 40% 40%',
                          opacity: 0.95,
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          top: '12%', left: '52%',
                          width: '38%', height: '48%',
                          background: colors.getCountryFill('EUR', 'europe'),
                          borderRadius: '40% 30% 30% 40% / 40% 40% 30% 30%',
                          opacity: 0.95,
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          top: '50%', left: '55%',
                          width: '25%', height: '30%',
                          background: colors.getCountryFill('ASI', 'asia'),
                          borderRadius: '30% 50% 40% 30% / 30% 30% 50% 50%',
                          opacity: 0.9,
                        }}
                      />
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-board-green rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="white">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Label */}
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
            onClick={handleStart}
            className="w-full py-3.5 bg-board-green hover:bg-board-green-dark text-white font-extrabold text-base rounded-2xl shadow-md btn-chunky transition-colors active:scale-[0.99]"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    </div>
  );
}
