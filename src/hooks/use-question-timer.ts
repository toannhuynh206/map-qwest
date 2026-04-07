import { useState, useEffect, useRef } from 'react';
import { TIMER_SECONDS, type TimerOption } from '@/types/quiz-config';

interface UseQuestionTimerOptions {
  timer: TimerOption;
  isActive: boolean;
  /** Changes on every new question to reset the clock */
  questionKey: string;
  onExpire: () => void;
}

export interface QuestionTimerResult {
  /** null when timer is 'off' */
  secondsRemaining: number | null;
  /** 0..1 fraction of time remaining; null when timer is 'off' */
  fractionRemaining: number | null;
}

export function useQuestionTimer({
  timer,
  isActive,
  questionKey,
  onExpire,
}: UseQuestionTimerOptions): QuestionTimerResult {
  const totalSeconds = TIMER_SECONDS[timer];
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(totalSeconds);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // Keep callback ref fresh without re-triggering effects
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // Reset clock when question changes
  useEffect(() => {
    if (totalSeconds === null) return;
    setSecondsRemaining(totalSeconds);
    expiredRef.current = false;
  }, [questionKey, totalSeconds]);

  // Countdown interval — only while question is active
  useEffect(() => {
    if (!isActive || totalSeconds === null) return;

    const startTime = Date.now();

    const id = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setSecondsRemaining(Math.ceil(remaining));

      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(id);
        onExpireRef.current();
      }
    }, 200);

    return () => clearInterval(id);
  }, [isActive, questionKey, totalSeconds]);

  if (totalSeconds === null) {
    return { secondsRemaining: null, fractionRemaining: null };
  }

  return {
    secondsRemaining,
    fractionRemaining:
      secondsRemaining !== null ? secondsRemaining / totalSeconds : null,
  };
}
