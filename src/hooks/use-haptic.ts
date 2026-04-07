import { useCallback } from 'react';

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (!canVibrate()) return;
    navigator.vibrate(pattern);
  }, []);

  const vibrateCorrect = useCallback(() => {
    if (!canVibrate()) return;
    navigator.vibrate(50);
  }, []);

  const vibrateIncorrect = useCallback(() => {
    if (!canVibrate()) return;
    navigator.vibrate([50, 30, 50]);
  }, []);

  return { vibrate, vibrateCorrect, vibrateIncorrect } as const;
}
