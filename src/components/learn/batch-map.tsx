'use client';

import { useMemo } from 'react';
import { InteractiveMap } from '@/components/map/interactive-map';
import type { CountryFeedback } from '@/components/map/country-path';

interface BatchMapProps {
  /** alpha-3 codes of countries in this batch */
  batchCountries: string[];
  /** alpha-3 codes the user has already explored */
  exploredCountries: string[];
  /** Called when user taps a batch country that hasn't been explored yet */
  onCountryTap: (alpha3: string) => void;
  /** Height of the map container */
  height?: number;
}

export function BatchMap({
  batchCountries,
  exploredCountries,
  onCountryTap,
  height = 340,
}: BatchMapProps) {
  const batchSet    = useMemo(() => new Set(batchCountries), [batchCountries]);
  const exploredSet = useMemo(() => new Set(exploredCountries), [exploredCountries]);

  const feedbackMap = useMemo<Record<string, CountryFeedback>>(() => {
    const map: Record<string, CountryFeedback> = {};
    for (const alpha3 of batchCountries) {
      map[alpha3] = exploredSet.has(alpha3) ? 'correct' : 'target';
    }
    return map;
  }, [batchCountries, exploredSet]);

  const dimmedCountries = useMemo(() => new Set<string>(), []);

  const handleSelect = (alpha3: string) => {
    if (batchSet.has(alpha3) && !exploredSet.has(alpha3)) {
      onCountryTap(alpha3);
    }
  };

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-board-border relative"
      style={{ height }}
    >
      <InteractiveMap
        onCountrySelect={handleSelect}
        feedbackMap={feedbackMap}
        dimmedCountries={dimmedCountries}
        disabled={false}
        showMiniMap={false}
      />

      {/* Legend */}
      <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-bold text-board-muted pointer-events-none z-10">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block bg-[#FF9500]" />
          Tap to explore
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block bg-[#58CC02]" />
          Explored
        </span>
      </div>
    </div>
  );
}
