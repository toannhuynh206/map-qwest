'use client';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="w-11 h-11 bg-white rounded-2xl shadow-md flex items-center justify-center text-earth-700 font-bold text-xl hover:bg-earth-50 active:shadow-sm active:translate-y-0.5 transition-all"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-11 h-11 bg-white rounded-2xl shadow-md flex items-center justify-center text-earth-700 font-bold text-xl hover:bg-earth-50 active:shadow-sm active:translate-y-0.5 transition-all"
        aria-label="Zoom out"
      >
        -
      </button>
      <button
        onClick={onReset}
        className="w-11 h-11 bg-white rounded-2xl shadow-md flex items-center justify-center text-earth-700 hover:bg-earth-50 active:shadow-sm active:translate-y-0.5 transition-all"
        aria-label="Reset view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
  );
}
