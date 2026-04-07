'use client';

import { useRef, useCallback, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useMapTheme } from '@/context/map-theme-context';

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const MINI_W = 180;
const MINI_H = 112;

interface MiniMapProps {
  center: [number, number];
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onPanTo: (center: [number, number]) => void;
}

export function MiniMap({ center, zoom, onZoomIn, onZoomOut, onReset, onPanTo }: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { colors } = useMapTheme();

  // Local drag state — only MiniMap re-renders during drag, not the main map
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number } | null>(null);
  const dragStart = useRef<{ px: number; py: number; cx: number; cy: number } | null>(null);
  const hasDragged = useRef(false);

  // Geographic ↔ pixel helpers
  const cx = ((center[0] + 180) / 360) * MINI_W;
  const cy = ((90 - center[1]) / 180) * MINI_H;

  // Apply drag delta visually during drag
  const activeCx = cx + (dragDelta?.dx ?? 0);
  const activeCy = cy + (dragDelta?.dy ?? 0);

  const rectW = MINI_W / zoom;
  const rectH = MINI_H / zoom;
  const rectX = activeCx - rectW / 2;
  const rectY = activeCy - rectH / 2;

  const isFullyZoomedOut = zoom <= 1.05;
  const isDragging = dragDelta !== null;

  // --- Viewport rect drag handlers (desktop + touch via pointer events) ---
  const handleRectPointerDown = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragStart.current = { px: e.clientX, py: e.clientY, cx, cy };
      hasDragged.current = false;
    },
    [cx, cy],
  );

  const handleRectPointerMove = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasDragged.current = true;
      setDragDelta({ dx, dy });
    }
  }, []);

  const handleRectPointerUp = useCallback(
    (e: React.PointerEvent<SVGRectElement>) => {
      if (!dragStart.current) return;
      if (hasDragged.current) {
        const finalCx = dragStart.current.cx + (e.clientX - dragStart.current.px);
        const finalCy = dragStart.current.cy + (e.clientY - dragStart.current.py);
        const lng = (finalCx / MINI_W) * 360 - 180;
        const lat = 90 - (finalCy / MINI_H) * 180;
        onPanTo([lng, lat]);
      }
      dragStart.current = null;
      setDragDelta(null);
    },
    [onPanTo],
  );

  // --- Click on minimap background → pan to that region ---
  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't pan if we just finished a drag
      if (hasDragged.current) {
        hasDragged.current = false;
        return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lng = (x / MINI_W) * 360 - 180;
      const lat = 90 - (y / MINI_H) * 180;
      onPanTo([lng, lat]);
    },
    [onPanTo],
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-1.5 items-end select-none">
      {/* Zoom controls */}
      <div className="flex gap-1">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 bg-white border border-board-border rounded-xl shadow-md flex items-center justify-center text-board-text font-bold text-xl hover:bg-board-hover active:scale-95 transition-all"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 bg-white border border-board-border rounded-xl shadow-md flex items-center justify-center text-board-text font-bold text-xl hover:bg-board-hover active:scale-95 transition-all"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={onReset}
          className="w-10 h-10 bg-white border border-board-border rounded-xl shadow-md flex items-center justify-center text-board-muted hover:bg-board-hover active:scale-95 transition-all"
          aria-label="Reset view"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      {/* Minimap panel */}
      <div
        className="rounded-xl overflow-hidden shadow-xl"
        style={{ width: MINI_W, border: '2px solid rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="bg-[#2d5a7b] px-2 py-0.5 flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.8}>
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-white text-[9px] font-bold tracking-wide uppercase opacity-80">Overview</span>
          <span className="ml-auto text-white text-[9px] opacity-50">drag or tap</span>
        </div>

        {/* Map canvas */}
        <div
          ref={containerRef}
          onClick={handleMapClick}
          className="relative"
          style={{
            width: MINI_W,
            height: MINI_H,
            cursor: isDragging ? 'grabbing' : 'crosshair',
            background: colors.miniMapOcean,
          }}
        >
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{ scale: 36 }}
            width={MINI_W}
            height={MINI_H}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <Geographies geography={WORLD_TOPO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colors.miniMapLand}
                    stroke={colors.miniMapLandStroke}
                    strokeWidth={0.4}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#a8c8a0' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>

          {/* Viewport indicator */}
          {!isFullyZoomedOut && (
            <svg
              className="absolute inset-0"
              width={MINI_W}
              height={MINI_H}
              style={{ overflow: 'visible', pointerEvents: 'none' }}
            >
              <defs>
                <mask id="mm-mask">
                  <rect width={MINI_W} height={MINI_H} fill="white" />
                  <rect x={rectX} y={rectY} width={Math.max(rectW, 6)} height={Math.max(rectH, 6)} fill="black" rx={2} />
                </mask>
              </defs>
              {/* Dim outside viewport */}
              <rect width={MINI_W} height={MINI_H} fill="rgba(0,0,0,0.38)" mask="url(#mm-mask)" />
              {/* Viewport border — draggable */}
              <rect
                x={rectX}
                y={rectY}
                width={Math.max(rectW, 6)}
                height={Math.max(rectH, 6)}
                fill="rgba(88,204,2,0.1)"
                stroke="#58CC02"
                strokeWidth={2}
                rx={2}
                style={{ cursor: isDragging ? 'grabbing' : 'grab', pointerEvents: 'all' }}
                onPointerDown={handleRectPointerDown}
                onPointerMove={handleRectPointerMove}
                onPointerUp={handleRectPointerUp}
                onPointerCancel={() => { setDragDelta(null); dragStart.current = null; }}
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
