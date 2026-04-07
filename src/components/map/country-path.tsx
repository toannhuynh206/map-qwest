'use client';

import { memo, useMemo } from 'react';
import { Geography } from 'react-simple-maps';
import { useMapTheme } from '@/context/map-theme-context';

export type CountryFeedback =
  | 'none'
  | 'selected'
  | 'correct'
  | 'incorrect'
  | 'reveal'
  | 'correct-locked'
  | 'incorrect-locked';

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
  selected: '#89E219',
  correct: '#58CC02',
  incorrect: '#FF4B4B',
  reveal: '#58CC02',
  'correct-locked': 'url(#pattern-correct-locked)',
  'incorrect-locked': 'url(#pattern-incorrect-locked)',
};

const FEEDBACK_STROKE: Partial<Record<CountryFeedback, string>> = {
  'correct-locked': '#16a34a',
  'incorrect-locked': '#dc2626',
};

const STROKE_COLOR = '#F7F7F7';

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

  const fill = useMemo(() => {
    return FEEDBACK_COLORS[feedback] ?? baseFill;
  }, [feedback, baseFill]);

  const isClickable = !disabled && feedback === 'none' && !dimmed;
  const isLocked = feedback === 'correct-locked' || feedback === 'incorrect-locked';
  const strokeColor = isLocked
    ? (FEEDBACK_STROKE[feedback] ?? STROKE_COLOR)
    : feedback !== 'none'
      ? STROKE_COLOR
      : colors.countryStroke;

  return (
    <Geography
      geography={geography}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={isLocked ? 1 : 0.5}
      onClick={() => {
        if (isClickable) onSelect(countryCode);
      }}
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
