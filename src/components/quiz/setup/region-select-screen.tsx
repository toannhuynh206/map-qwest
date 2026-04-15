'use client';

import Link from 'next/link';
import { COUNTRIES } from '@/data/countries';
import type { QuizRegion } from '@/types/quiz-config';

interface RegionInfo {
  id: QuizRegion;
  name: string;
  emoji: string;
  count: number;
  accent: string;
  description: string;
}

function buildRegionList(): RegionInfo[] {
  const counts: Record<string, number> = {};
  Object.values(COUNTRIES).forEach((c) => {
    counts[c.region] = (counts[c.region] ?? 0) + 1;
  });

  return [
    { id: 'africa', name: 'Africa', emoji: '🌍', count: counts.africa ?? 54, accent: '#FF9500', description: 'Sub-Saharan & North Africa' },
    { id: 'europe', name: 'Europe', emoji: '🏛️', count: counts.europe ?? 44, accent: '#007AFF', description: 'Western, Eastern & Northern' },
    { id: 'asia', name: 'Asia', emoji: '🌏', count: counts.asia ?? 48, accent: '#AF52DE', description: 'East, South & Southeast Asia' },
    { id: 'north_america', name: 'North America', emoji: '🌎', count: counts.north_america ?? 23, accent: '#FF3B30', description: 'Caribbean & Central America' },
    { id: 'south_america', name: 'South America', emoji: '🌎', count: counts.south_america ?? 12, accent: '#34C759', description: '12 sovereign nations' },
    { id: 'oceania', name: 'Oceania', emoji: '🏝️', count: counts.oceania ?? 14, accent: '#32ADE6', description: 'Pacific Islands & Australasia' },
  ];
}

const WORLD_COUNT = Object.keys(COUNTRIES).length;
const REGIONS = buildRegionList();

interface RegionSelectScreenProps {
  onSelect: (region: QuizRegion) => void;
  title?: string;
}

export function RegionSelectScreen({ onSelect, title = 'Pin the Country' }: RegionSelectScreenProps) {
  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl border border-board-border flex items-center justify-center text-board-muted hover:bg-board-hover transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-board-text">{title}</h1>
            <p className="text-xs text-board-muted">Choose a region to practice</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
          {/* World — full-width featured card */}
          <button
            onClick={() => onSelect('world')}
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
              <div className="text-xs text-board-muted">All {WORLD_COUNT} countries</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-board-green bg-green-50 px-2 py-0.5 rounded-full">
                {WORLD_COUNT}
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58CC02" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Region grid */}
          <div className="grid grid-cols-2 gap-3">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => onSelect(r.id)}
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
                    {r.count}
                  </span>
                </div>
                <div>
                  <div className="font-extrabold text-board-text text-sm">{r.name}</div>
                  <div className="text-[11px] text-board-muted leading-tight">{r.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Pin Mini — special section */}
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="h-px flex-1 bg-board-border" />
              <span className="text-[10px] font-bold text-board-muted uppercase tracking-wider">Short game</span>
              <div className="h-px flex-1 bg-board-border" />
            </div>
            <button
              onClick={() => onSelect('pin_mini')}
              className="w-full bg-board-card border border-board-border rounded-2xl p-4 flex items-center gap-4 hover:bg-board-hover active:scale-[0.99] transition-all text-left shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-amber-50">
                ⚡
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-board-text text-base">Pin Mini</div>
                <div className="text-xs text-board-muted">Tiny nations &amp; island states</div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
