'use client';

interface QuizHeaderProps {
  correctCount: number;
  incorrectCount: number;
  remaining: number;
  countryName: string;
  isPlaying: boolean;
  onQuit: () => void;
  /** Countdown seconds remaining — null when timer is off */
  secondsRemaining?: number | null;
  /** Fraction 0–1 remaining — used for progress ring */
  fractionRemaining?: number | null;
}

export function QuizHeader({
  correctCount,
  incorrectCount,
  remaining,
  countryName,
  onQuit,
  secondsRemaining = null,
  fractionRemaining = null,
}: QuizHeaderProps) {
  const timerOn = secondsRemaining !== null;
  const urgent = timerOn && (secondsRemaining ?? 99) < 10;

  // SVG progress ring params
  const R = 10;
  const CIRC = 2 * Math.PI * R;
  const strokeDashoffset =
    fractionRemaining !== null ? CIRC * (1 - fractionRemaining) : 0;

  return (
    <div className="w-full bg-board-card border-b border-board-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        {/* Close */}
        <button onClick={onQuit} className="text-board-muted hover:text-board-text transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Timer — countdown ring when enabled, empty space when off */}
        {timerOn ? (
          <div className={`flex items-center gap-1.5 ${urgent ? 'text-red-500' : 'text-board-muted'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              {/* Background ring */}
              <circle cx="12" cy="12" r={R} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.2} />
              {/* Progress ring */}
              <circle
                cx="12"
                cy="12"
                r={R}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray={CIRC}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 12 12)"
                style={{ transition: 'stroke-dashoffset 0.2s linear' }}
              />
            </svg>
            <span className="text-sm font-bold tabular-nums min-w-[2ch] text-center">
              {secondsRemaining}
            </span>
          </div>
        ) : (
          <div className="w-14" /> /* spacer to keep layout balanced */
        )}

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-board-green flex items-center justify-center text-white text-[10px] font-bold">✓</span>
            <span className="text-sm font-bold text-board-green">{correctCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center text-white text-[10px] font-bold">✗</span>
            <span className="text-sm font-bold text-red-400">{incorrectCount}</span>
          </div>
          <div className="w-px h-4 bg-board-border" />
          <span className="text-sm font-bold text-board-muted">{remaining} left</span>
        </div>
      </div>

      {/* Question prompt */}
      <div className="px-4 pb-3 text-center">
        <p className="text-lg font-extrabold text-board-text">
          Where is <span className="text-board-green">{countryName}</span>?
        </p>
      </div>
    </div>
  );
}
