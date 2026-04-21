'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { NUMERIC_TO_ALPHA3 } from '@/data/country-code-mapping';
import { COUNTRIES } from '@/data/countries';

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Colours for three states
const COLOR_TARGET   = '#FF9500'; // orange — in batch, not yet explored
const COLOR_EXPLORED = '#58CC02'; // green  — tapped and learned
const COLOR_OTHER    = '#D4D7DB'; // muted gray
const COLOR_STROKE   = '#FFFFFF';

const TAP_THRESHOLD = 8; // px

interface BatchMapProps {
  /** alpha-3 codes of countries in this batch */
  batchCountries: string[];
  /** alpha-3 codes the user has already explored */
  exploredCountries: string[];
  /** Called when user taps a batch country */
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
  const batchSet    = new Set(batchCountries);
  const exploredSet = new Set(exploredCountries);

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches.length) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = useCallback(
    (alpha3: string) => (e: React.TouchEvent) => {
      if (!touchStart.current || !e.changedTouches.length) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < TAP_THRESHOLD && batchSet.has(alpha3)) {
        onCountryTap(alpha3);
      }
    },
    [batchSet, onCountryTap],
  );

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-ocean-500/8 border border-board-border" style={{ height }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 110, center: [20, 10] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8}>
          <Geographies geography={WORLD_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = String(geo.id);
                const alpha3    = NUMERIC_TO_ALPHA3[numericId];
                if (!alpha3) return null;

                const isExplored = exploredSet.has(alpha3);
                const isTarget   = batchSet.has(alpha3) && !isExplored;
                const isClickable = isTarget;

                const fill = isExplored ? COLOR_EXPLORED
                           : isTarget   ? COLOR_TARGET
                           :              COLOR_OTHER;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill, stroke: COLOR_STROKE, strokeWidth: 0.4, outline: 'none' },
                      hover:   {
                        fill: isTarget ? '#FFB340' : isExplored ? '#48C000' : COLOR_OTHER,
                        stroke: COLOR_STROKE,
                        strokeWidth: isClickable ? 0.8 : 0.4,
                        outline: 'none',
                        cursor: isClickable ? 'pointer' : 'default',
                      },
                      pressed: { fill, stroke: COLOR_STROKE, strokeWidth: 0.4, outline: 'none' },
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd(alpha3)}
                    onClick={() => { if (isTarget) onCountryTap(alpha3); }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-bold text-board-muted">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLOR_TARGET }} />
          Tap to explore
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLOR_EXPLORED }} />
          Explored
        </span>
      </div>
    </div>
  );
}
