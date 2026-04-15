'use client';

import { useState, useCallback, useRef } from 'react';
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

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const MARKER_FILL: Record<CountryFeedback, string> = {
  none:               '#AFAFAF',
  selected:           '#89E219',
  correct:            '#58CC02',
  incorrect:          '#FF4B4B',
  reveal:             '#58CC02',
  'correct-locked':   '#86efac',
  'incorrect-locked': '#fca5a5',
  missed:             '#9CA3AF',
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
  const pinSize = 6 / zoom;
  const outerSize = pinSize + 4 / zoom;
  const sw = 1 / zoom;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStart.current) return;
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
}

export function InteractiveMap({
  onCountrySelect,
  feedbackMap,
  dimmedCountries,
  disabled,
  initialCenter = [0, 10],
  initialZoom = 1,
}: InteractiveMapProps) {
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const { colors } = useMapTheme();

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
    },
    [],
  );

  return (
    <div
      className="relative w-full h-full map-container overflow-hidden"
      style={{ background: colors.ocean, touchAction: 'none' }}
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
          {/* Country polygons — no key reset, stays mounted for smooth transitions */}
          <Geographies geography={WORLD_TOPO_URL}>
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

          {/* Marker pins for small countries not in TopoJSON */}
          {Object.entries(SMALL_COUNTRY_COORDS).map(([alpha3, coords]) => {
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

      <MiniMap
        center={center}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onPanTo={handlePanTo}
      />
    </div>
  );
}
