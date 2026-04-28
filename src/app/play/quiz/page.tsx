'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveMap } from '@/components/map/interactive-map';
import { QuizHeader } from '@/components/quiz/quiz-header';
import { AnswerFeedback } from '@/components/quiz/answer-feedback';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuizToolbar } from '@/components/quiz/quiz-toolbar';
import { QuitConfirmDialog } from '@/components/quiz/quit-confirm-dialog';
import { FEEDBACK_DELAY_CORRECT, FEEDBACK_DELAY_INCORRECT } from '@/components/quiz/answer-feedback';
import { RegionSelectScreen } from '@/components/quiz/setup/region-select-screen';
import { QuizConfigScreen } from '@/components/quiz/setup/quiz-config-screen';
import { MapThemeContext } from '@/context/map-theme-context';
import { useQuizStore, type QuizQuestion } from '@/stores/quiz-store';
import { COUNTRIES, getCountriesByRegion, type Region } from '@/data/countries';
import { SMALL_COUNTRY_COORDS } from '@/data/country-coordinates';
import { useSound } from '@/hooks/use-sound';
import { useHaptic } from '@/hooks/use-haptic';
import { useQuestionTimer } from '@/hooks/use-question-timer';
import {
  DEFAULT_QUIZ_CONFIG,
  type QuizConfig,
  type QuizRegion,
} from '@/types/quiz-config';
import { REGION_MAP_DEFAULTS } from '@/data/region-defaults';
import { regionToFactCategory } from '@/data/fun-facts';

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

function generateQuestions(config: QuizConfig): QuizQuestion[] {
  let pool: ReturnType<typeof getCountriesByRegion>;

  if (config.region === 'world') {
    pool = Object.values(COUNTRIES);
  } else if (config.region === 'pin_mini') {
    const smallCodes = new Set(Object.keys(SMALL_COUNTRY_COORDS));
    pool = Object.values(COUNTRIES).filter((c) => smallCodes.has(c.alpha3));
  } else {
    pool = getCountriesByRegion(config.region as Region);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count =
    config.questionCount === 'all'
      ? shuffled.length
      : Math.min(config.questionCount, shuffled.length);

  return shuffled.slice(0, count).map((c) => ({
    countryCode: c.alpha3,
    countryName: c.name,
    difficulty: c.difficulty,
    region: c.region,
  }));
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

type SetupStep = 'region' | 'config';

export default function QuizPage() {
  const router = useRouter();

  // Setup flow — local state, lives outside the quiz store
  const [setupStep, setSetupStep] = useState<SetupStep>('region');
  const [selectedRegion, setSelectedRegion] = useState<QuizRegion | null>(null);
  const [config, setConfig] = useState<QuizConfig>(DEFAULT_QUIZ_CONFIG);

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
    questionStartTime,
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

  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const { playCorrect, playIncorrect } = useSound();
  const { vibrateCorrect, vibrateIncorrect } = useHaptic();

  const currentQuestion = questions[currentIndex];
  const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const showFeedback = status === 'feedback' && lastAttempt !== null;

  // Sound + haptic + auto-advance on feedback
  useEffect(() => {
    if (status !== 'feedback' || !lastAttempt) return;
    if (lastAttempt.correct) {
      playCorrect();
      vibrateCorrect();
    } else {
      playIncorrect();
      vibrateIncorrect();
    }
    const delay = lastAttempt.correct ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_INCORRECT;
    const timer = setTimeout(() => nextQuestion(), delay);
    return () => clearTimeout(timer);
  }, [status, attempts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-question countdown timer
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

  // Setup handlers
  const handleRegionSelect = useCallback((region: QuizRegion) => {
    setSelectedRegion(region);
    setSetupStep('config');
  }, []);

  const handleConfigBack = useCallback(() => {
    setSetupStep('region');
  }, []);

  const handleStart = useCallback(
    (cfg: QuizConfig) => {
      setConfig(cfg);
      startQuiz(generateQuestions(cfg), cfg);
    },
    [startQuiz],
  );

  // Quiz handlers
  const handleCountrySelect = useCallback(
    (alpha3: string) => {
      if (status === 'playing') submitAnswer(alpha3);
    },
    [status, submitAnswer],
  );



  const handlePlayAgain = useCallback(() => {
    resetQuiz();
    setSetupStep('config'); // go back to config (same region)
  }, [resetQuiz]);

  const handleGoHome = useCallback(() => {
    resetQuiz();
    router.push('/');
  }, [resetQuiz, router]);

  const handleSkip = useCallback(() => skipQuestion(), [skipQuestion]);

  const handleQuitRequest = useCallback(() => setShowQuitDialog(true), []);
  const handleQuitCancel = useCallback(() => setShowQuitDialog(false), []);
  const handleQuitConfirm = useCallback(() => {
    setShowQuitDialog(false);
    quitQuiz();
  }, [quitQuiz]);

  const allCountryCodes = useMemo(() => Object.keys(COUNTRIES), []);

  const handleHint = useCallback(
    () => useHint(allCountryCodes, (code) => COUNTRIES[code]?.region),
    [useHint, allCountryCodes],
  );

  const handleFiftyFifty = useCallback(
    () => useFiftyFifty(allCountryCodes),
    [useFiftyFifty, allCountryCodes],
  );

  const countryNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const [code, info] of Object.entries(COUNTRIES)) {
      names[code] = info.name;
    }
    return names;
  }, []);

  const correctCount = attempts.filter((a) => a.correct).length;
  const incorrectCount = attempts.filter((a) => !a.correct).length;
  const remaining = questions.length - currentIndex - (status === 'feedback' ? 1 : 0);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Pre-quiz setup screens
  if (status === 'idle') {
    if (setupStep === 'region') {
      return <RegionSelectScreen onSelect={handleRegionSelect} />;
    }
    if (setupStep === 'config' && selectedRegion) {
      return (
        <QuizConfigScreen
          region={selectedRegion}
          onBack={handleConfigBack}
          onStart={handleStart}
        />
      );
    }
    // Fallback — shouldn't happen
    return <RegionSelectScreen onSelect={handleRegionSelect} />;
  }

  // Loading state (brief flash while questions are generated)
  if (!currentQuestion && status !== 'results') {
    return (
      <div className="flex items-center justify-center h-screen bg-board-bg">
        <div className="w-12 h-12 border-4 border-board-border border-t-board-green rounded-full animate-spin" />
      </div>
    );
  }

  // Results
  if (status === 'results') {
    return (
      <div className="h-screen">
        <QuizResults
          score={score}
          totalQuestions={questions.length}
          attempts={attempts}
          countryNames={countryNames}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          factCategory={regionToFactCategory('countries', config.region)}
        />
      </div>
    );
  }

  // Active quiz
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
          <InteractiveMap
            key={mapKey}
            onCountrySelect={handleCountrySelect}
            feedbackMap={feedbackMap}
            dimmedCountries={dimmedCountries}
            disabled={status !== 'playing'}
            initialCenter={REGION_MAP_DEFAULTS[config.region].center}
            initialZoom={REGION_MAP_DEFAULTS[config.region].zoom}
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
            lastAttempt
              ? countryNames[lastAttempt.correctCode] || lastAttempt.correctCode
              : ''
          }
          factCategory={regionToFactCategory('countries', config.region)}
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
