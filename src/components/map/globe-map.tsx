'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
} from 'react-simple-maps';
import { NUMERIC_TO_ALPHA3 } from '@/data/country-code-mapping';
import { COUNTRY_CENTROIDS } from '@/data/country-centroids';
import type { CountryFeedback } from './country-path';

// 110m = fast, used while dragging. 50m = detailed shapes, used when stationary.
const WORLD_TOPO_LOW  = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const WORLD_TOPO_HIGH = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
const SCALE_DEFAULT = 300;
const SCALE_MIN     = 150;
const SCALE_MAX     = 5000;
const SCALE_STEP    = 1.35;
const TAP_THRESHOLD = 12;

export const GLOBE_OCEAN_COLOR  = '#1A6BAA';
export const GLOBE_LAND_COLOR   = '#4A7C59';
export const GLOBE_LAND_HOVER   = '#5C9E70';
export const GLOBE_BORDER_COLOR = '#FFFFFF';

// Feedback colours on the dark globe surface
const FEEDBACK_FILL: Partial<Record<CountryFeedback, string>> = {
  selected:           '#FFD700',
  correct:            '#58CC02',
  incorrect:          '#FF4B4B',
  reveal:             '#58CC02',
  'correct-locked':   '#86efac',
  'incorrect-locked': '#fca5a5',
  target:             '#FF9500',
  missed:             '#9CA3AF',
};

// Scale threshold above which dots are hidden and the 50m Geography shapes take over.
// (All entries below except VAT exist in the 50m topology.)
const MICRO_SHOW_AS_SHAPE_THRESHOLD = 700;
// VAT is not in any world-atlas topology — always renders as a dot.
const MICRO_DOTS_ONLY = new Set(['VAT']);

// Small sovereign states absent from the 110m TopoJSON.
// At low zoom / while dragging (110m active) → rendered as pin dots.
// At high zoom + stationary (50m active) → Geography renders actual shapes; dots hidden.
const MICRO_NATIONS: Record<string, [number, number]> = {
  // European microstates
  VAT: [12.4534,  41.9029],
  MCO: [7.4128,   43.7384],
  SMR: [12.4578,  43.9424],
  LIE: [9.5215,   47.1410],
  AND: [1.5218,   42.5063],
  // Asia / Indian Ocean
  SGP: [103.820,  1.3521],
  BHR: [50.5577,  26.0667],
  MDV: [73.2207,  3.2028],
  MLT: [14.3754,  35.9375],
  MUS: [57.5522,  -20.348],
  // Caribbean
  ATG: [-61.80,   17.06],
  BRB: [-59.54,   13.19],
  DMA: [-61.37,   15.41],
  GRD: [-61.68,   12.12],
  KNA: [-62.78,   17.36],
  LCA: [-60.98,   13.91],
  VCT: [-61.29,   12.98],
  TTO: [-61.22,   10.65],
  // Pacific
  KIR: [-157.36,  1.87],
  MHL: [171.18,   7.13],
  FSM: [150.55,   7.42],
  NRU: [166.93,  -0.52],
  PLW: [134.58,   7.51],
  WSM: [-172.10, -13.76],
  TON: [-175.20, -21.18],
  TUV: [177.65,  -7.11],
  // Africa / Indian Ocean islands
  COM: [43.87,   -11.87],
  SYC: [55.49,   -4.68],
  STP: [6.61,     0.19],
};

function shortAngle(from: number, to: number): number {
  return from + (((to - from + 540) % 360) - 180);
}

function isOnVisibleHemisphere(
  lon: number, lat: number, rotation: [number, number, number],
): boolean {
  const toRad = (d: number) => (d * Math.PI) / 180;
  return (
    Math.cos(toRad(-rotation[1])) * Math.cos(toRad(lat)) * Math.cos(toRad(lon) - toRad(-rotation[0])) +
    Math.sin(toRad(-rotation[1])) * Math.sin(toRad(lat))
  ) > 0.05;
}

function getPointerDist(pts: Map<number, { x: number; y: number }>): number {
  const [a, b] = Array.from(pts.values());
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ---------------------------------------------------------------------------
// Zoom controls (internal)
// ---------------------------------------------------------------------------

function ZoomControls({ onZoomIn, onZoomOut }: { onZoomIn: () => void; onZoomOut: () => void }) {
  return (
    <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors text-lg font-bold"
      >+</button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors text-lg font-bold"
      >−</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GlobeMapHandle {
  flyTo: (alpha3: string) => void;
}

export interface GlobeMapProps {
  /** Per-country quiz feedback colours */
  feedbackMap?: Record<string, CountryFeedback>;
  /** Single highlighted country — gold (learn mode) */
  selectedAlpha3?: string | null;
  /** Countries to render at reduced opacity (hint dimming) */
  dimmedCountries?: Set<string>;
  /** Called when the user taps a country (no drag) */
  onCountryTap?: (alpha3: string) => void;
  /** Prevent tap processing (feedback / between questions) */
  disabled?: boolean;
  /** Show +/– zoom buttons */
  showZoomControls?: boolean;
}

// ---------------------------------------------------------------------------
// GlobeMap
// ---------------------------------------------------------------------------

export const GlobeMap = forwardRef<GlobeMapHandle, GlobeMapProps>(function GlobeMap(
  {
    feedbackMap     = {},
    selectedAlpha3  = null,
    dimmedCountries = new Set<string>(),
    onCountryTap,
    disabled        = false,
    showZoomControls = true,
  },
  ref,
) {
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0]);
  const [scale,    setScale]    = useState(SCALE_DEFAULT);
  const [hovered,  setHovered]  = useState<string | null>(null);

  // rotationRef stays in sync with state so flyTo can read the latest value.
  const rotationRef = useRef(rotation);
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);

  const [topoUrl, setTopoUrl] = useState(WORLD_TOPO_HIGH);

  const dragState   = useRef<{ sx: number; sy: number; sr: [number, number, number] } | null>(null);
  const pinchRef    = useRef<{ dist: number; scale: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const wasDrag     = useRef(false);
  const topoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Separate rAF queues so zoom events never trigger a rotation recalculation.
  const rafRotRef   = useRef<number | null>(null);
  const rafScaRef   = useRef<number | null>(null);
  const pendingRot  = useRef<[number, number, number]>(rotation);
  const pendingSca  = useRef(scale);

  // ── Drag ──────────────────────────────────────────────────────────────────

  const onDragStart = useCallback((x: number, y: number) => {
    pendingRot.current = [...rotationRef.current] as [number, number, number];
    dragState.current  = { sx: x, sy: y, sr: [...rotationRef.current] as [number, number, number] };
    // Don't switch topology yet — wait until we're sure it's a real drag, not a tap.
  }, []);

  // Rotation-only rAF — never touches scale state.
  const scheduleRotFrame = useCallback(() => {
    if (rafRotRef.current !== null) return;
    rafRotRef.current = requestAnimationFrame(() => {
      setRotation([...pendingRot.current] as [number, number, number]);
      rafRotRef.current = null;
    });
  }, []);

  // Scale-only rAF — never triggers a path recalculation for rotation.
  const scheduleScaFrame = useCallback(() => {
    if (rafScaRef.current !== null) return;
    rafScaRef.current = requestAnimationFrame(() => {
      setScale(pendingSca.current);
      rafScaRef.current = null;
    });
  }, []);

  const onDragMove = useCallback((x: number, y: number) => {
    if (!dragState.current) return;
    const dx = x - dragState.current.sx;
    const dy = y - dragState.current.sy;
    if (Math.sqrt(dx * dx + dy * dy) > TAP_THRESHOLD) {
      if (!wasDrag.current) {
        // First frame we're sure this is a drag — switch to low-res for performance.
        wasDrag.current = true;
        if (topoTimerRef.current) { clearTimeout(topoTimerRef.current); topoTimerRef.current = null; }
        setTopoUrl(WORLD_TOPO_LOW);
      }
    }
    pendingRot.current = [
      dragState.current.sr[0] + dx * 0.5,
      Math.max(-80, Math.min(80, dragState.current.sr[1] - dy * 0.5)),
      0,
    ];
    scheduleRotFrame();
  }, [scheduleRotFrame]);

  const onDragEnd = useCallback(() => {
    dragState.current = null;
    pinchRef.current  = null;
    if (rafRotRef.current !== null) { cancelAnimationFrame(rafRotRef.current); rafRotRef.current = null; }
    if (rafScaRef.current !== null) { cancelAnimationFrame(rafScaRef.current); rafScaRef.current = null; }
    setRotation([...pendingRot.current] as [number, number, number]);
    setScale(pendingSca.current);
    setTimeout(() => { wasDrag.current = false; }, 0);
    // Switch back to high-res topology after 400 ms of inactivity
    topoTimerRef.current = setTimeout(() => setTopoUrl(WORLD_TOPO_HIGH), 400);
  }, []);

  // ── Pointer events ────────────────────────────────────────────────────────
  // NOTE: No setPointerCapture. Pointer events bubble naturally from child SVG
  // elements to this div, and omitting capture lets the browser fire click/tap
  // events on the correct Geography child element rather than on this div.

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const pts = pointersRef.current;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) {
      dragState.current = null;
      pinchRef.current  = { dist: getPointerDist(pts), scale: pendingSca.current };
      wasDrag.current   = true;
    } else if (pts.size === 1) {
      onDragStart(e.clientX, e.clientY);
    }
  }, [onDragStart]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const pts = pointersRef.current;
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && pinchRef.current) {
      const ratio = getPointerDist(pts) / pinchRef.current.dist;
      pendingSca.current = Math.max(SCALE_MIN, Math.min(SCALE_MAX, pinchRef.current.scale * ratio));
      wasDrag.current = true;
      scheduleScaFrame();
      return;
    }
    if (pts.size === 1) onDragMove(e.clientX, e.clientY);
  }, [onDragMove, scheduleScaFrame]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const pts = pointersRef.current;
    pts.delete(e.pointerId);
    if (pts.size === 0) {
      onDragEnd();
    } else if (pts.size === 1 && pinchRef.current) {
      pinchRef.current = null;
      const [remaining] = Array.from(pts.values());
      onDragStart(remaining.x, remaining.y);
    }
  }, [onDragStart, onDragEnd]);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size === 0) onDragEnd();
  }, [onDragEnd]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    pendingSca.current = Math.max(SCALE_MIN, Math.min(SCALE_MAX, pendingSca.current * (1 - e.deltaY * 0.001)));
    scheduleScaFrame();
  }, [scheduleScaFrame]);

  // ── Zoom buttons ──────────────────────────────────────────────────────────

  const zoomIn = useCallback(() => {
    const next = Math.min(SCALE_MAX, pendingSca.current * SCALE_STEP);
    pendingSca.current = next;
    setScale(next);
  }, []);

  const zoomOut = useCallback(() => {
    const next = Math.max(SCALE_MIN, pendingSca.current / SCALE_STEP);
    pendingSca.current = next;
    setScale(next);
  }, []);

  // ── Fly-to (exposed via ref) ───────────────────────────────────────────────

  const flyTo = useCallback((alpha3: string) => {
    const coords = COUNTRY_CENTROIDS[alpha3];
    if (!coords) return;
    const target: [number, number, number] = [-coords[0], -coords[1], 0];
    const startRot = [...rotationRef.current] as [number, number, number];
    const isMicro  = alpha3 in MICRO_NATIONS;
    const startSca = pendingSca.current;
    const targetSca = isMicro ? 1200 : startSca;
    const t0 = performance.now();

    const animate = (now: number) => {
      const t    = Math.min(1, (now - t0) / 700);
      const ease = 1 - Math.pow(1 - t, 3);
      const next: [number, number, number] = [
        startRot[0] + (shortAngle(startRot[0], target[0]) - startRot[0]) * ease,
        startRot[1] + (shortAngle(startRot[1], target[1]) - startRot[1]) * ease,
        0,
      ];
      setRotation(next);
      rotationRef.current = next;
      pendingRot.current  = next;
      if (isMicro) {
        const nextSca = startSca + (targetSca - startSca) * ease;
        setScale(nextSca);
        pendingSca.current = nextSca;
      }
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  useImperativeHandle(ref, () => ({ flyTo }), [flyTo]);

  // ── Country tap ───────────────────────────────────────────────────────────

  const handleTap = useCallback((alpha3: string) => {
    if (wasDrag.current || disabled) return;
    onCountryTap?.(alpha3);
  }, [disabled, onCountryTap]);

  // ── Fill resolution ────────────────────────────────────────────────────────

  const getFill = (alpha3: string): string => {
    const fb = feedbackMap[alpha3];
    if (fb && FEEDBACK_FILL[fb]) return FEEDBACK_FILL[fb]!;
    if (alpha3 === selectedAlpha3) return '#FFD700';
    if (dimmedCountries.has(alpha3)) return '#2A4535';   // dark muted = dimmed
    if (alpha3 === hovered) return GLOBE_LAND_HOVER;
    return GLOBE_LAND_COLOR;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onWheel={onWheel}
    >
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ rotate: rotation, scale }}
        width={800}
        height={800}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        <Sphere id="ocean" fill={GLOBE_OCEAN_COLOR} stroke="transparent" strokeWidth={0} />
        <Graticule stroke={GLOBE_BORDER_COLOR} strokeWidth={0.3} strokeOpacity={0.12} />

        <Geographies geography={topoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const alpha3 = NUMERIC_TO_ALPHA3[String(geo.id)];
              if (!alpha3) return null;
              const fill      = getFill(alpha3);
              const fb        = feedbackMap[alpha3];
              const isSpecial = !!fb || alpha3 === selectedAlpha3;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={GLOBE_BORDER_COLOR}
                  strokeWidth={isSpecial ? 1.5 : 0.5}
                  onMouseEnter={() => { if (!disabled) setHovered(alpha3); }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleTap(alpha3)}
                  style={{
                    default: { outline: 'none', opacity: dimmedCountries.has(alpha3) && !fb ? 0.35 : 1, transition: 'fill 0.15s ease, opacity 0.15s ease' },
                    hover:   { outline: 'none', cursor: !disabled && !fb ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Overlay sphere drawn on top of all paths — its opaque edge masks the
            jagged clipping artifacts that appear at the orthographic horizon. */}
        <Sphere id="globe-edge" fill="none" stroke={GLOBE_OCEAN_COLOR} strokeWidth={6} />

        {/* Dot fallback — only for the 6 countries absent from the 50m topology.
            Must be direct children of ComposableMap, NOT nested inside Geographies. */}
        {Object.entries(MICRO_NATIONS).map(([alpha3, coords]) => {
          if (!isOnVisibleHemisphere(coords[0], coords[1], rotation)) return null;

          // Hide dot when the 50m Geography is already rendering this country.
          // Exception: VAT is never in any topology so always show its dot.
          const shapeVisible =
            !MICRO_DOTS_ONLY.has(alpha3) &&
            topoUrl === WORLD_TOPO_HIGH &&
            scale >= MICRO_SHOW_AS_SHAPE_THRESHOLD;
          if (shapeVisible) return null;

          const fb   = feedbackMap[alpha3];
          const fill = fb && FEEDBACK_FILL[fb]
            ? FEEDBACK_FILL[fb]!
            : alpha3 === selectedAlpha3
            ? '#FFD700'
            : '#A8C8A0';
          const isActive = !!fb || alpha3 === selectedAlpha3;
          // Scale dot radius with zoom so it grows as you zoom in before disappearing.
          const baseR = Math.max(2, Math.min(5, scale / 120));
          const r = isActive ? 6 : baseR;

          return (
            <Marker
              key={alpha3}
              coordinates={coords}
              onClick={(e) => { e.stopPropagation(); handleTap(alpha3); }}
            >
              <circle
                r={r}
                fill={fill}
                stroke={GLOBE_BORDER_COLOR}
                strokeWidth={isActive ? 1.5 : 0.8}
                style={{
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'r 0.15s, fill 0.12s',
                  opacity: dimmedCountries.has(alpha3) && !fb ? 0.3 : isActive ? 1 : 0.7,
                }}
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {showZoomControls && <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />}
    </div>
  );
});
