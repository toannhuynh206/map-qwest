'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  ZoomableGroup,
  Marker,
} from 'react-simple-maps';
import { CountryPath, type CountryFeedback } from './country-path';
import { MiniMap } from './mini-map';
import { numericToAlpha3 } from '@/data/country-code-mapping';
import { SMALL_COUNTRY_COORDS } from '@/data/country-coordinates';
import { COUNTRIES } from '@/data/countries';
import { useMapTheme } from '@/context/map-theme-context';

const WORLD_TOPO_LOW  = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const WORLD_TOPO_HIGH = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

// Zoom level at which dots give way to actual 50m topology shapes.
// All SMALL_COUNTRY_COORDS entries (except VAT) exist in the 50m topology.
const SHAPE_ZOOM_THRESHOLD = 3;
// VAT is absent from every world-atlas topology — always a dot.
const DOTS_ONLY = new Set(['VAT']);

const MARKER_FILL: Record<CountryFeedback, string> = {
  none:               '#AFAFAF',
  selected:           '#89E219',
  correct:            '#58CC02',
  incorrect:          '#FF4B4B',
  reveal:             '#58CC02',
  'correct-locked':   '#86efac',
  'incorrect-locked': '#fca5a5',
  missed:             '#9CA3AF',
  target:             '#FF9500',
};

const TAP_THRESHOLD = 10;

interface MarkerPinProps {
  alpha3: string;
  coords: { lat: number; lng: number };
  fill: string;
  isAnswered: boolean;
  disabled: boolean;
  zoom: number;
  onSelect: (alpha3: string) => void;
}

function MarkerPin({ alpha3, coords, fill, isAnswered, disabled, zoom, onSelect }: MarkerPinProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // Grow the dot slightly as zoom increases (max 2x) so it feels like an
  // island getting closer, before it transitions to the actual shape.
  const growFactor = Math.min(2, 1 + (zoom - 1) / (SHAPE_ZOOM_THRESHOLD - 1));
  const pinSize  = (6 / zoom) * growFactor;
  const outerSize = pinSize + (4 / zoom) * growFactor;
  const sw = 1 / zoom;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStart.current) return;
    if (!e.changedTouches.length) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < TAP_THRESHOLD) {
      e.preventDefault();
      onSelect(alpha3);
    }
    touchStart.current = null;
  };

  return (
    <Marker
      coordinates={[coords.lng, coords.lat]}
      onClick={() => { if (!disabled) onSelect(alpha3); }}
    >
      <circle
        r={outerSize}
        fill="none"
        stroke={isAnswered ? fill : '#58CC02'}
        strokeWidth={sw}
        strokeDasharray={isAnswered ? 'none' : `${1.2 / zoom} ${1.2 / zoom}`}
        opacity={0.7}
        style={{ transition: 'stroke 200ms ease' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
      <circle
        r={pinSize}
        fill={fill}
        stroke="#FFFFFF"
        strokeWidth={sw}
        style={{
          cursor: disabled ? 'default' : 'pointer',
          transition: 'fill 200ms ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    </Marker>
  );
}

interface InteractiveMapProps {
  onCountrySelect: (alpha3: string) => void;
  feedbackMap: Record<string, CountryFeedback>;
  dimmedCountries: Set<string>;
  disabled: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
  showMiniMap?: boolean;
  showZoomControls?: boolean;
}

export function InteractiveMap({
  onCountrySelect,
  feedbackMap,
  dimmedCountries,
  disabled,
  initialCenter = [0, 10],
  initialZoom = 1,
  showMiniMap = true,
  showZoomControls = false,
}: InteractiveMapProps) {
  const [zoom, setZoom]       = useState(initialZoom);
  const [center, setCenter]   = useState<[number, number]>(initialCenter);
  const [topoUrl, setTopoUrl] = useState(WORLD_TOPO_LOW);
  const { colors }            = useMapTheme();
  const containerRef          = useRef<HTMLDivElement>(null);
  const topoTimerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.5, 20));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / 1.5, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setCenter([0, 10]);
  }, []);

  const handlePanTo = useCallback((newCenter: [number, number]) => {
    setCenter(newCenter);
  }, []);

  const handleCountrySelect = useCallback(
    (code: string) => {
      onCountrySelect(code);
    },
    [onCountrySelect],
  );

  const handleMoveEnd = useCallback(
    (position: { coordinates: [number, number]; zoom: number }) => {
      setCenter(position.coordinates);
      setZoom(position.zoom);
      // Switch to high-res topology after a short settle delay.
      if (topoTimerRef.current) clearTimeout(topoTimerRef.current);
      if (position.zoom >= SHAPE_ZOOM_THRESHOLD) {
        topoTimerRef.current = setTimeout(() => setTopoUrl(WORLD_TOPO_HIGH), 250);
      } else {
        setTopoUrl(WORLD_TOPO_LOW);
      }
    },
    [],
  );

  // Drop to low-res as soon as the user starts dragging/pinching so the
  // topology switch doesn't happen mid-gesture.
  const handleInteractionStart = useCallback(() => {
    if (topoTimerRef.current) { clearTimeout(topoTimerRef.current); topoTimerRef.current = null; }
    setTopoUrl(WORLD_TOPO_LOW);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full map-container overflow-hidden"
      style={{ background: colors.ocean, touchAction: 'none' }}
      onPointerDown={handleInteractionStart}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        width={800}
        height={500}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={20}
        >
          <Geographies geography={topoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numericId = geo.id || geo.properties?.iso_n3;
                const alpha3 = numericToAlpha3(String(numericId));
                if (!alpha3) return null;

                const feedback = feedbackMap[alpha3] || 'none';
                const region = COUNTRIES[alpha3]?.region ?? '';
                const baseFill = colors.getCountryFill(alpha3, region);

                return (
                  <CountryPath
                    key={alpha3}
                    geography={geo}
                    countryCode={alpha3}
                    feedback={feedback}
                    disabled={disabled}
                    dimmed={dimmedCountries.has(alpha3)}
                    baseFill={baseFill}
                    onSelect={handleCountrySelect}
                  />
                );
              })
            }
          </Geographies>

          {/* Marker pins for small countries.
              Hidden once the 50m topology is active (shapes render instead).
              VAT is never in any topology so always shown. */}
          {Object.entries(SMALL_COUNTRY_COORDS).map(([alpha3, coords]) => {
            const shapeVisible =
              !DOTS_ONLY.has(alpha3) &&
              topoUrl === WORLD_TOPO_HIGH &&
              zoom >= SHAPE_ZOOM_THRESHOLD;
            if (shapeVisible) return null;

            const feedback = feedbackMap[alpha3] || 'none';
            const fill = MARKER_FILL[feedback];
            const isAnswered = feedback === 'correct' || feedback === 'incorrect' || feedback === 'reveal' || feedback === 'correct-locked' || feedback === 'incorrect-locked';

            return (
              <MarkerPin
                key={alpha3}
                alpha3={alpha3}
                coords={coords}
                fill={fill}
                isAnswered={isAnswered}
                disabled={disabled}
                zoom={zoom}
                onSelect={handleCountrySelect}
              />
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {showMiniMap && (
        <MiniMap
          center={center}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onPanTo={handlePanTo}
        />
      )}

      {showZoomControls && !showMiniMap && (
        <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-full bg-board-card/80 backdrop-blur-sm border border-board-border/60 flex items-center justify-center text-board-text hover:bg-board-card transition-colors shadow-sm text-lg font-bold"
          >+</button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-full bg-board-card/80 backdrop-blur-sm border border-board-border/60 flex items-center justify-center text-board-text hover:bg-board-card transition-colors shadow-sm text-lg font-bold"
          >−</button>
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-full bg-board-card/80 backdrop-blur-sm border border-board-border/60 flex items-center justify-center text-board-muted hover:text-board-text hover:bg-board-card transition-colors shadow-sm"
            title="Reset view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
