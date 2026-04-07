import { useCallback, useRef } from 'react';

function getAudioContext(
  contextRef: React.MutableRefObject<AudioContext | null>,
): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (contextRef.current) return contextRef.current;

  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtx) return null;

  contextRef.current = new AudioCtx();
  return contextRef.current;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  startOffset: number = 0,
): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startOffset);

  gain.gain.setValueAtTime(gainValue, ctx.currentTime + startOffset);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + startOffset + duration,
  );

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(ctx.currentTime + startOffset);
  oscillator.stop(ctx.currentTime + startOffset + duration);
}

const DEFAULT_GAIN = 0.3;

export function useSound() {
  const contextRef = useRef<AudioContext | null>(null);

  const playCorrect = useCallback(() => {
    const ctx = getAudioContext(contextRef);
    if (!ctx) return;

    playTone(ctx, 523, 0.1, 'sine', DEFAULT_GAIN, 0);
    playTone(ctx, 659, 0.1, 'sine', DEFAULT_GAIN, 0.1);
  }, []);

  const playIncorrect = useCallback(() => {
    const ctx = getAudioContext(contextRef);
    if (!ctx) return;

    playTone(ctx, 200, 0.2, 'square', DEFAULT_GAIN);
  }, []);

  const playClick = useCallback(() => {
    const ctx = getAudioContext(contextRef);
    if (!ctx) return;

    playTone(ctx, 1000, 0.05, 'sine', DEFAULT_GAIN);
  }, []);

  return { playCorrect, playIncorrect, playClick } as const;
}
