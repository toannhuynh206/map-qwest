'use client';

import { useRef, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { FIPS_TO_ABBREV } from '@/data/us-states';

const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const COLOR_TARGET   = '#FF9500'; // batch state — tap to explore
const COLOR_EXPLORED = '#58CC02'; // explored
const COLOR_OTHER    = '#D4D7DB'; // not in batch
const COLOR_STROKE   = '#FFFFFF';

const TAP_THRESHOLD = 8;

interface USBatchMapProps {
  /** 2-letter state abbreviations in this batch */
  batchStates: string[];
  /** States already explored */
  exploredStates: string[];
  onStateTap: (abbrev: string) => void;
  height?: number;
}

export function USBatchMap({
  batchStates,
  exploredStates,
  onStateTap,
  height = 320,
}: USBatchMapProps) {
  const batchSet    = new Set(batchStates);
  const exploredSet = new Set(exploredStates);
  const touchStart  = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches.length) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = useCallback(
    (abbrev: string) => (e: React.TouchEvent) => {
      if (!touchStart.current || !e.changedTouches.length) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < TAP_THRESHOLD && batchSet.has(abbrev) && !exploredSet.has(abbrev)) {
        onStateTap(abbrev);
      }
    },
    [batchSet, exploredSet, onStateTap],
  );

  return (
    <div
      className="w-full rounded-2xl overflow-hidden bg-ocean-500/8 border border-board-border relative"
      style={{ height }}
    >
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.9} maxZoom={8}>
          <Geographies geography={US_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips   = String(geo.id).padStart(2, '0');
                const abbrev = FIPS_TO_ABBREV[fips];
                if (!abbrev) return null;

                const isExplored  = exploredSet.has(abbrev);
                const isTarget    = batchSet.has(abbrev) && !isExplored;

                const fill = isExplored ? COLOR_EXPLORED
                           : isTarget   ? COLOR_TARGET
                           :              COLOR_OTHER;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={COLOR_STROKE}
                    strokeWidth={0.6}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd(abbrev)}
                    onClick={() => {
                      if (isTarget) onStateTap(abbrev);
                    }}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        fill: isTarget ? '#FFB340' : isExplored ? '#48C000' : COLOR_OTHER,
                        outline: 'none',
                        cursor: isTarget ? 'pointer' : 'default',
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-bold text-board-muted pointer-events-none">
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
