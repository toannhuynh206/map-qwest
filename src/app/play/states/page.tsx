'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { USInteractiveMap } from '@/components/map/us-interactive-map';
import { QuizHeader } from '@/components/quiz/quiz-header';
import { AnswerFeedback, FEEDBACK_DELAY_CORRECT, FEEDBACK_DELAY_INCORRECT } from '@/components/quiz/answer-feedback';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuizToolbar } from '@/components/quiz/quiz-toolbar';
import { QuitConfirmDialog } from '@/components/quiz/quit-confirm-dialog';
import { StatesConfigScreen, type StatesQuizConfig } from '@/components/quiz/setup/states-config-screen';
import { MapThemeContext } from '@/context/map-theme-context';
import { useQuizStore, type QuizQuestion } from '@/stores/quiz-store';
import { US_STATES } from '@/data/us-states';
import { useSound } from '@/hooks/use-sound';
import { useHaptic } from '@/hooks/use-haptic';
import { useQuestionTimer } from '@/hooks/use-question-timer';
import { TIMER_SECONDS } from '@/types/quiz-config';

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

function generateStateQuestions(config: StatesQuizConfig): QuizQuestion[] {
  const pool = Object.values(US_STATES);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count =
    config.questionCount === 'all'
      ? pool.length
      : Math.min(config.questionCount as number, pool.length);

  return shuffled.slice(0, count).map((s) => ({
    countryCode: s.abbrev,
    countryName: s.name,
    difficulty: s.difficulty,
    region: s.region,
  }));
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StatesQuizPage() {
  const router = useRouter();
  const [showConfig, setShowConfig] = useState(true);
  const [config, setConfig] = useState<StatesQuizConfig>({
    questionCount: 10,
    timer: 'off',
    theme: 'classic',
    persistFeedback: false,
  });
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const {
    status,
    questions,
    currentIndex,
    attempts,
    feedbackMap,
    dimmedCountries,
    score,
    hintsUsed,
    mapKey,
    startQuiz,
    submitAnswer,
    nextQuestion,
    skipQuestion,
    useHint,
    useFiftyFifty,
    resetQuiz,
    timeoutQuestion,
    quitQuiz,
  } = useQuizStore();

  const { playCorrect, playIncorrect } = useSound();
  const { vibrateCorrect, vibrateIncorrect } = useHaptic();

  const currentQuestion = questions[currentIndex];
  const lastAttempt     = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const showFeedback    = status === 'feedback' && lastAttempt !== null;

  // Sound + haptic + auto-advance
  useEffect(() => {
    if (status !== 'feedback' || !lastAttempt) return;
    if (lastAttempt.correct) { playCorrect();   vibrateCorrect();   }
    else                     { playIncorrect(); vibrateIncorrect(); }

    const delay = lastAttempt.correct ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_INCORRECT;
    const timer = setTimeout(() => nextQuestion(), delay);
    return () => clearTimeout(timer);
  }, [status, attempts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-question countdown
  const questionKey = currentQuestion
    ? `${currentIndex}-${currentQuestion.countryCode}`
    : String(currentIndex);

  const { secondsRemaining, fractionRemaining } = useQuestionTimer({
    timer: config.timer,
    customTimerSeconds: config.customTimerSeconds,
    isActive: status === 'playing',
    questionKey,
    onExpire: timeoutQuestion,
  });

  // Handlers
  const handleStart = useCallback((cfg: StatesQuizConfig) => {
    setConfig(cfg);
    // Build a fake QuizConfig to satisfy the store (states mode repurposes same store)
    startQuiz(generateStateQuestions(cfg), {
      region: 'world',       // placeholder
      questionCount: cfg.questionCount,
      timer: cfg.timer,
      theme: 'classic',      // unused for US map
      persistFeedback: cfg.persistFeedback,
    });
    setShowConfig(false);
  }, [startQuiz]);

  const handleStateSelect = useCallback(
    (abbrev: string) => {
      if (status === 'playing') submitAnswer(abbrev);
    },
    [status, submitAnswer],
  );

  const handlePlayAgain = useCallback(() => {
    resetQuiz();
    setShowConfig(true);
  }, [resetQuiz]);

  const handleGoHome = useCallback(() => {
    resetQuiz();
    router.push('/');
  }, [resetQuiz, router]);

  const handleSkip = useCallback(() => skipQuestion(), [skipQuestion]);

  const allStateCodes = useMemo(() => Object.keys(US_STATES), []);
  const handleHint = useCallback(
    () => useHint(allStateCodes, (code) => US_STATES[code]?.region),
    [useHint, allStateCodes],
  );

  const handleFiftyFifty = useCallback(
    () => useFiftyFifty(allStateCodes),
    [useFiftyFifty, allStateCodes],
  );

  const stateNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [abbrev, s] of Object.entries(US_STATES)) map[abbrev] = s.name;
    return map;
  }, []);

  const handleQuitRequest  = useCallback(() => setShowQuitDialog(true), []);
  const handleQuitCancel   = useCallback(() => setShowQuitDialog(false), []);
  const handleQuitConfirm  = useCallback(() => { setShowQuitDialog(false); quitQuiz(); }, [quitQuiz]);

  const correctCount   = attempts.filter((a) => a.correct).length;
  const incorrectCount = attempts.filter((a) => !a.correct).length;
  const remaining      = questions.length - currentIndex - (status === 'feedback' ? 1 : 0);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (showConfig || status === 'idle') {
    return <StatesConfigScreen onBack={() => router.push('/')} onStart={handleStart} />;
  }

  if (!currentQuestion && status !== 'results') {
    return (
      <div className="flex items-center justify-center h-screen bg-board-bg">
        <div className="w-12 h-12 border-4 border-board-border border-t-board-green rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'results') {
    return (
      <div className="h-screen">
        <QuizResults
          score={score}
          totalQuestions={questions.length}
          attempts={attempts}
          countryNames={stateNames}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          factCategory="us_states"
        />
      </div>
    );
  }

  return (
    <MapThemeContext.Provider value={config.theme}>
    <div className="h-screen flex flex-col bg-board-bg relative overflow-hidden">
      <QuizHeader
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        remaining={remaining}
        countryName={currentQuestion!.countryName}
        questionIndex={currentIndex}
        isPlaying={status === 'playing' || status === 'feedback'}
        onQuit={handleQuitRequest}
        secondsRemaining={secondsRemaining}
        fractionRemaining={fractionRemaining}
      />

      <div className="flex-1 relative">
        <USInteractiveMap
          key={mapKey}
          onStateSelect={handleStateSelect}
          feedbackMap={feedbackMap}
          dimmedStates={dimmedCountries}
          disabled={status !== 'playing'}
        />

        <QuizToolbar
          onSkip={handleSkip}
          onHint={handleHint}
          onFiftyFifty={handleFiftyFifty}
          disabled={status !== 'playing'}
          hintsUsed={hintsUsed}
        />
      </div>

      <AnswerFeedback
        visible={showFeedback}
        correct={lastAttempt?.correct ?? false}
        correctCountryName={
          lastAttempt ? stateNames[lastAttempt.correctCode] || lastAttempt.correctCode : ''
        }
        factCategory="us_states"
      />

      <QuitConfirmDialog
        visible={showQuitDialog}
        answeredCount={attempts.length}
        totalCount={questions.length}
        onKeepPlaying={handleQuitCancel}
        onQuit={handleQuitConfirm}
      />
    </div>
    </MapThemeContext.Provider>
  );
}
