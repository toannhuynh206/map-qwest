'use client';

import { memo, useMemo, useRef } from 'react';
import { Geography } from 'react-simple-maps';
import { useMapTheme } from '@/context/map-theme-context';

export type CountryFeedback =
  | 'none'
  | 'selected'
  | 'correct'
  | 'incorrect'
  | 'reveal'
  | 'correct-locked'
  | 'incorrect-locked'
  | 'missed';           // typing mode: not guessed, revealed after give-up

interface CountryPathProps {
  geography: Parameters<typeof Geography>[0]['geography'];
  countryCode: string;
  feedback: CountryFeedback;
  disabled: boolean;
  dimmed: boolean;
  baseFill: string;
  onSelect: (code: string) => void;
}

const FEEDBACK_COLORS: Partial<Record<CountryFeedback, string>> = {
  selected:           '#89E219',
  correct:            '#58CC02',
  incorrect:          '#FF4B4B',
  reveal:             '#58CC02',
  'correct-locked':   '#86efac',
  'incorrect-locked': '#fca5a5',
  missed:             '#9CA3AF',  // gray — not guessed after give-up
};

const STROKE_COLOR = '#F7F7F7';
const TAP_THRESHOLD = 10; // px — movement below this is treated as a tap

function CountryPathComponent({
  geography,
  countryCode,
  feedback,
  disabled,
  dimmed,
  baseFill,
  onSelect,
}: CountryPathProps) {
  const { colors } = useMapTheme();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const fill = useMemo(() => {
    return FEEDBACK_COLORS[feedback] ?? baseFill;
  }, [feedback, baseFill]);

  const isClickable = !disabled && feedback === 'none' && !dimmed;
  const strokeColor = feedback !== 'none' ? STROKE_COLOR : colors.countryStroke;

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
      e.preventDefault(); // stop the 300ms click that would follow
      onSelect(countryCode);
    }
    touchStart.current = null;
  };

  return (
    <Geography
      geography={geography}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={0.5}
      onClick={() => {
        if (isClickable) onSelect(countryCode);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        default: {
          outline: 'none',
          transition: 'fill 200ms ease, opacity 200ms ease',
          opacity: dimmed ? 0.3 : 1,
        },
        hover: {
          fill: isClickable ? colors.countryHover : fill,
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

export const CountryPath = memo(CountryPathComponent);
