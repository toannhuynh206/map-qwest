'use client';

import { useState, useCallback } from 'react';
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
  none: '#AFAFAF',
  selected: '#89E219',
  correct: '#58CC02',
  incorrect: '#FF4B4B',
  reveal: '#58CC02',
  'correct-locked': '#16a34a',
  'incorrect-locked': '#dc2626',
};

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
    setZoom((z) => Math.min(z * 1.5, 8));
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
      style={{ background: colors.ocean }}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 160 }}
        width={800}
        height={500}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <pattern id="pattern-correct-locked" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#dcfce7" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#16a34a" strokeWidth="3" />
          </pattern>
          <pattern id="pattern-incorrect-locked" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#fee2e2" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#dc2626" strokeWidth="3" />
          </pattern>
        </defs>
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={8}
        >
          {/* Country polygons */}
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
            const pinSize = 2.5 / zoom;
            const outerSize = pinSize + 1.5 / zoom;
            const sw = 0.6 / zoom;

            return (
              <Marker
                key={alpha3}
                coordinates={[coords.lng, coords.lat]}
                onClick={() => {
                  if (!disabled) handleCountrySelect(alpha3);
                }}
              >
                <circle
                  r={outerSize}
                  fill="none"
                  stroke={isAnswered ? fill : '#58CC02'}
                  strokeWidth={sw}
                  strokeDasharray={isAnswered ? 'none' : `${1.2 / zoom} ${1.2 / zoom}`}
                  opacity={0.7}
                  style={{ transition: 'stroke 200ms ease' }}
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
                />
              </Marker>
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
