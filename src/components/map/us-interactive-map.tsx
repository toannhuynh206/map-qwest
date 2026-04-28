'use client';

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { type CountryFeedback } from './country-path';
import { FIPS_TO_ABBREV, US_STATES } from '@/data/us-states';
import { useMapTheme } from '@/context/map-theme-context';

const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const NATURAL_W = 960;
const NATURAL_H = 600;
const NATURAL_SCALE = 1070;

const FILL_COLORS: Record<CountryFeedback, string | null> = {
  none:                null,
  selected:           '#89E219',
  correct:            '#58CC02',
  incorrect:          '#FF4B4B',
  reveal:             '#58CC02',
  'correct-locked':   '#86efac',
  'incorrect-locked': '#fca5a5',
  missed:             '#9CA3AF',
  target:             '#FF9500',
};

const STROKE_COLOR  = '#FFFFFF';
const TAP_THRESHOLD = 10;

// ---------------------------------------------------------------------------
// Individual state path — memoized, touch-tap aware
// ---------------------------------------------------------------------------

interface StatePathProps {
  geography: Parameters<typeof Geography>[0]['geography'];
  abbrev: string;
  feedback: CountryFeedback;
  disabled: boolean;
  dimmed: boolean;
  baseFill: string;
  hoverFill: string;
  onSelect: (abbrev: string) => void;
}

function StatePathComponent({
  geography, abbrev, feedback, disabled, dimmed, baseFill, hoverFill, onSelect,
}: StatePathProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const isClickable = !disabled && feedback === 'none' && !dimmed;
  const fill = FILL_COLORS[feedback] ?? baseFill;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isClickable || !touchStart.current) return;
    if (!e.changedTouches.length) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < TAP_THRESHOLD) {
      e.preventDefault();
      onSelect(abbrev);
    }
    touchStart.current = null;
  };

  return (
    <Geography
      geography={geography}
      fill={fill}
      stroke={STROKE_COLOR}
      strokeWidth={0.5}
      onClick={() => { if (isClickable) onSelect(abbrev); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        default: {
          outline: 'none',
          opacity: dimmed ? 0.3 : 1,
          transition: 'fill 200ms ease, opacity 200ms ease',
        },
        hover: {
          fill: isClickable ? hoverFill : fill,
          outline: 'none',
          cursor: isClickable ? 'pointer' : 'default',
          opacity: dimmed ? 0.3 : 1,
        },
        pressed: {
          fill: isClickable ? '#58CC02' : fill,
          outline: 'none',
        },
      }}
      tabIndex={-1}
    />
  );
}

const StatePath = memo(StatePathComponent);

// ---------------------------------------------------------------------------
// Map
// ---------------------------------------------------------------------------

interface USInteractiveMapProps {
  onStateSelect: (abbrev: string) => void;
  feedbackMap: Record<string, CountryFeedback>;
  dimmedStates: Set<string>;
  disabled: boolean;
}

export function USInteractiveMap({
  onStateSelect,
  feedbackMap,
  dimmedStates,
  disabled,
}: USInteractiveMapProps) {
  const { colors } = useMapTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: NATURAL_W, height: NATURAL_H });
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setDims({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Prevent double-tap zoom (D3 zoom intercepts touch events)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let lastTouch = 0;
    const preventDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (e.touches.length === 1 && now - lastTouch < 350) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      lastTouch = now;
    };
    el.addEventListener('touchstart', preventDoubleTap, { passive: false, capture: true });
    return () => el.removeEventListener('touchstart', preventDoubleTap, { capture: true });
  }, []);

  const scale = Math.min(
    (dims.width  / NATURAL_W) * NATURAL_SCALE,
    (dims.height / NATURAL_H) * NATURAL_SCALE,
  );

  const handleMoveEnd = useCallback(
    (pos: { coordinates: [number, number]; zoom: number }) => {
      setCenter(pos.coordinates);
      setZoom(pos.zoom);
    },
    [],
  );

  const handleZoomIn  = useCallback(() => setZoom((z) => Math.min(z * 1.5, 15)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.5, 1)), []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: colors.ocean, touchAction: 'none' }}
    >
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale }}
        width={dims.width}
        height={dims.height}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={15}
        >
          {/* No key — stays mounted across questions */}
          <Geographies geography={US_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fips   = String(geo.id ?? '').padStart(2, '0');
                const abbrev = FIPS_TO_ABBREV[fips];
                if (!abbrev) return null;
                const region   = US_STATES[abbrev]?.region ?? '';
                const baseFill = colors.getStateFill(abbrev, region);

                return (
                  <StatePath
                    key={abbrev}
                    geography={geo}
                    abbrev={abbrev}
                    feedback={feedbackMap[abbrev] ?? 'none'}
                    disabled={disabled}
                    dimmed={dimmedStates.has(abbrev)}
                    baseFill={baseFill}
                    hoverFill={colors.countryHover}
                    onSelect={onStateSelect}
                  />
                );
              })
            }
          </Geographies>

          {/* Washington DC dot */}
          <Marker coordinates={[-77.04, 38.91]}>
            <circle r={3 / zoom} fill="#64748B" stroke="#FFFFFF" strokeWidth={0.8 / zoom} />
            <text
              textAnchor="start"
              x={4 / zoom}
              y={1 / zoom}
              style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: `${7 / zoom}px`,
                fontWeight: 700,
                fill: '#475569',
                pointerEvents: 'none',
              }}
            >
              DC
            </text>
          </Marker>
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          className="w-9 h-9 bg-board-card border border-board-border rounded-xl flex items-center justify-center text-board-muted hover:bg-board-hover shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          className="w-9 h-9 bg-board-card border border-board-border rounded-xl flex items-center justify-center text-board-muted hover:bg-board-hover shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
