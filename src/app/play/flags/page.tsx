'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveMap } from '@/components/map/interactive-map';
import { FlagsHeader } from '@/components/quiz/flags-header';
import { AnswerFeedback, FEEDBACK_DELAY_CORRECT, FEEDBACK_DELAY_INCORRECT } from '@/components/quiz/answer-feedback';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuitConfirmDialog } from '@/components/quiz/quit-confirm-dialog';
import { RegionSelectScreen } from '@/components/quiz/setup/region-select-screen';
import { FlagsConfigScreen, type FlagsConfig, type FlagsMode } from '@/components/quiz/flags-config-screen';
import { MapThemeContext } from '@/context/map-theme-context';
import { useQuizStore, type QuizQuestion } from '@/stores/quiz-store';
import { COUNTRIES, getCountriesByRegion, type Region } from '@/data/countries';
import { SMALL_COUNTRY_COORDS } from '@/data/country-coordinates';
import { useSound } from '@/hooks/use-sound';
import { useHaptic } from '@/hooks/use-haptic';
import { useQuestionTimer } from '@/hooks/use-question-timer';
import { buildPool, matchInput } from '@/lib/typing-match';
import type { QuizRegion } from '@/types/quiz-config';
import { REGION_MAP_DEFAULTS } from '@/data/region-defaults';

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

function generateQuestions(cfg: FlagsConfig): QuizQuestion[] {
  let pool: ReturnType<typeof getCountriesByRegion>;

  if (cfg.region === 'world') {
    pool = Object.values(COUNTRIES);
  } else if (cfg.region === 'pin_mini') {
    const smallCodes = new Set(Object.keys(SMALL_COUNTRY_COORDS));
    pool = Object.values(COUNTRIES).filter((c) => smallCodes.has(c.alpha3));
  } else {
    pool = getCountriesByRegion(cfg.region as Region);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count =
    cfg.questionCount === 'all' ? shuffled.length : Math.min(cfg.questionCount, shuffled.length);

  return shuffled.slice(0, count).map((c) => ({
    countryCode: c.alpha3,
    countryName: c.name,
    difficulty: c.difficulty,
    region: c.region,
  }));
}

// ---------------------------------------------------------------------------
// Multiple Choice helpers
// ---------------------------------------------------------------------------

function buildChoices(questions: QuizQuestion[], currentIndex: number): QuizQuestion[] {
  const current = questions[currentIndex];
  if (!current) return [];
  const pool = questions.filter((_, i) => i !== currentIndex);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const distractors = shuffled.slice(0, Math.min(3, pool.length));
  return [...distractors, current].sort(() => Math.random() - 0.5);
}

// ---------------------------------------------------------------------------
// Header (shared across all 3 modes)
// ---------------------------------------------------------------------------

// (unused — kept for reference only)

// ---------------------------------------------------------------------------
// Multiple Choice mode
// ---------------------------------------------------------------------------

interface MultipleChoiceProps {
  currentQuestion: QuizQuestion;
  choices: QuizQuestion[];
  status: 'playing' | 'feedback';
  lastAttempt: { selectedCode: string; correctCode: string; correct: boolean } | null;
  correctCount: number;
  incorrectCount: number;
  remaining: number;
  onQuit: () => void;
  onSelect: (alpha3: string) => void;
  secondsRemaining: number | null;
  fractionRemaining: number | null;
}

function MultipleChoiceGame({
  currentQuestion,
  choices,
  status,
  lastAttempt,
  correctCount,
  incorrectCount,
  remaining,
  onQuit,
  onSelect,
  secondsRemaining,
  fractionRemaining,
}: MultipleChoiceProps) {
  return (
    <div className="h-screen flex flex-col bg-board-bg">
      <FlagsHeader
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        remaining={remaining}
        countryAlpha2={currentQuestion.countryCode ? (COUNTRIES[currentQuestion.countryCode]?.alpha2 ?? '') : ''}
        countryName={currentQuestion.countryName}
        onQuit={onQuit}
        secondsRemaining={secondsRemaining}
        fractionRemaining={fractionRemaining}
      />

      {/* Choice buttons */}
      <div className="flex-1 flex flex-col justify-end px-4 pb-6 gap-2.5">
        <AnimatePresence mode="wait">
          {choices.map((choice, i) => {
            let buttonClass =
              'w-full py-4 px-5 rounded-2xl text-left font-bold text-base border-2 transition-all ';

            if (status === 'feedback' && lastAttempt) {
              if (choice.countryCode === lastAttempt.correctCode) {
                buttonClass += 'bg-board-green/10 border-board-green text-board-green';
              } else if (choice.countryCode === lastAttempt.selectedCode && !lastAttempt.correct) {
                buttonClass += 'bg-red-50 border-red-400 text-red-600';
              } else {
                buttonClass += 'bg-board-card border-board-border text-board-muted opacity-50';
              }
            } else {
              buttonClass += 'bg-board-card border-board-border text-board-text hover:bg-board-hover active:scale-[0.98]';
            }

            return (
              <motion.button
                key={choice.countryCode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 320, damping: 28 }}
                onClick={() => { if (status === 'playing') onSelect(choice.countryCode); }}
                className={buttonClass}
              >
                {choice.countryName}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pin It mode
// ---------------------------------------------------------------------------

interface PinItProps {
  currentQuestion: QuizQuestion;
  stickers: Record<string, string>;
  feedbackMap: Record<string, import('@/components/map/country-path').CountryFeedback>;
  dimmedCountries: Set<string>;
  mapKey: number;
  theme: import('@/types/quiz-config').MapTheme;
  region: QuizRegion;
  correctCount: number;
  incorrectCount: number;
  remaining: number;
  onQuit: () => void;
  onSelect: (alpha3: string) => void;
  disabled: boolean;
  secondsRemaining: number | null;
  fractionRemaining: number | null;
  showFeedback: boolean;
  lastAttempt: { correct: boolean } | null;
  countryNames: Record<string, string>;
  showQuitDialog: boolean;
  onQuitCancel: () => void;
  onQuitConfirm: () => void;
  totalCount: number;
  attemptCount: number;
}

function PinItGame({
  currentQuestion,
  stickers,
  feedbackMap,
  dimmedCountries,
  mapKey,
  theme,
  region,
  correctCount,
  incorrectCount,
  remaining,
  onQuit,
  onSelect,
  disabled,
  secondsRemaining,
  fractionRemaining,
  showFeedback,
  lastAttempt,
  countryNames,
  showQuitDialog,
  onQuitCancel,
  onQuitConfirm,
  totalCount,
  attemptCount,
}: PinItProps) {
  return (
    <MapThemeContext.Provider value={theme}>
      <div className="h-screen flex flex-col bg-board-bg relative overflow-hidden">
        <FlagsHeader
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          remaining={remaining}
          countryAlpha2={COUNTRIES[currentQuestion.countryCode]?.alpha2 ?? ''}
          countryName={currentQuestion.countryName}
          onQuit={onQuit}
          secondsRemaining={secondsRemaining}
          fractionRemaining={fractionRemaining}
        />
        <div className="flex-1 relative">
          <InteractiveMap
            key={mapKey}
            onCountrySelect={onSelect}
            feedbackMap={feedbackMap}
            dimmedCountries={dimmedCountries}
            disabled={disabled}
            initialCenter={REGION_MAP_DEFAULTS[region].center}
            initialZoom={REGION_MAP_DEFAULTS[region].zoom}
            stickers={stickers}
          />
        </div>
        <AnswerFeedback
          visible={showFeedback}
          correct={lastAttempt?.correct ?? false}
          correctCountryName={
            lastAttempt && 'correctCode' in lastAttempt
              ? countryNames[(lastAttempt as { correctCode: string }).correctCode] || ''
              : ''
          }
        />
        <QuitConfirmDialog
          visible={showQuitDialog}
          answeredCount={attemptCount}
          totalCount={totalCount}
          onKeepPlaying={onQuitCancel}
          onQuit={onQuitConfirm}
        />
      </div>
    </MapThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Type It mode
// ---------------------------------------------------------------------------

interface TypeInputRef {
  clear: () => void;
  shake: () => void;
  focus: () => void;
}

interface TypeItProps {
  currentQuestion: QuizQuestion;
  correctCount: number;
  incorrectCount: number;
  remaining: number;
  onQuit: () => void;
  onMatch: (alpha3: string) => void;
  onSkip: () => void;
  disabled: boolean;
  secondsRemaining: number | null;
  fractionRemaining: number | null;
  showQuitDialog: boolean;
  onQuitCancel: () => void;
  onQuitConfirm: () => void;
  totalCount: number;
  attemptCount: number;
  region: QuizRegion;
}

function TypeItGame({
  currentQuestion,
  correctCount,
  incorrectCount,
  remaining,
  onQuit,
  onMatch,
  onSkip,
  disabled,
  secondsRemaining,
  fractionRemaining,
  showQuitDialog,
  onQuitCancel,
  onQuitConfirm,
  totalCount,
  attemptCount,
  region,
}: TypeItProps) {
  const [inputValue, setInputValue] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [matched, setMatched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { lookup } = useMemo(() => buildPool('countries', region), [region]);
  const guessedSet = useMemo(() => new Set([currentQuestion.countryCode]), [currentQuestion.countryCode]);

  // Reset input on question change
  useEffect(() => {
    setInputValue('');
    setMatched(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentQuestion.countryCode]);

  function handleInput(val: string) {
    if (disabled || matched) return;
    setInputValue(val);
    // Only match against the current question's country
    const code = matchInput(val, lookup, new Set());
    if (code === currentQuestion.countryCode) {
      setMatched(true);
      setInputValue('');
      onMatch(code);
    }
  }

  function handleSkipClick() {
    setInputValue('');
    setMatched(false);
    onSkip();
  }

  return (
    <div className="h-screen flex flex-col bg-board-bg">
      <FlagsHeader
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        remaining={remaining}
        countryAlpha2={COUNTRIES[currentQuestion.countryCode]?.alpha2 ?? ''}
        countryName={currentQuestion.countryName}
        onQuit={onQuit}
        secondsRemaining={secondsRemaining}
        fractionRemaining={fractionRemaining}
      />

      {/* Spacer / prompt */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-3">
        <p className="text-board-muted text-sm">Type the country name</p>

        {/* Shake wrapper */}
        <motion.div
          key={shakeKey}
          animate={shakeKey > 0 ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !inputValue.trim()) {
                setShakeKey((k) => k + 1);
              }
            }}
            disabled={disabled || matched}
            placeholder="Country name…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full text-center text-lg font-bold bg-board-card border-2 border-board-border rounded-2xl px-4 py-3 text-board-text placeholder:text-board-muted focus:outline-none focus:border-board-green transition-colors"
          />
        </motion.div>

        <button
          onClick={handleSkipClick}
          className="text-xs text-board-muted underline underline-offset-2 mt-1"
        >
          Skip
        </button>
      </div>

      <QuitConfirmDialog
        visible={showQuitDialog}
        answeredCount={attemptCount}
        totalCount={totalCount}
        onKeepPlaying={onQuitCancel}
        onQuit={onQuitConfirm}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type SetupStep = 'region' | 'config';

export default function FlagsPage() {
  const router = useRouter();

  const [setupStep, setSetupStep] = useState<SetupStep>('region');
  const [selectedRegion, setSelectedRegion] = useState<QuizRegion | null>(null);
  const [flagsConfig, setFlagsConfig] = useState<FlagsConfig | null>(null);
  const [flagsMode, setFlagsMode] = useState<FlagsMode>('multiple-choice');

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
    timeoutQuestion,
    quitQuiz,
    resetQuiz,
  } = useQuizStore();

  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const { playCorrect, playIncorrect } = useSound();
  const { vibrateCorrect, vibrateIncorrect } = useHaptic();

  const currentQuestion = questions[currentIndex];
  const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const showFeedback = status === 'feedback' && lastAttempt !== null;

  // Sound + haptic + auto-advance
  useEffect(() => {
    if (status !== 'feedback' || !lastAttempt) return;
    if (lastAttempt.correct) { playCorrect(); vibrateCorrect(); }
    else                     { playIncorrect(); vibrateIncorrect(); }
    const delay = lastAttempt.correct ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_INCORRECT;
    const timer = setTimeout(() => nextQuestion(), delay);
    return () => clearTimeout(timer);
  }, [status, attempts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Per-question countdown timer
  const questionKey = currentQuestion
    ? `${currentIndex}-${currentQuestion.countryCode}`
    : String(currentIndex);
  const { secondsRemaining, fractionRemaining } = useQuestionTimer({
    timer: flagsConfig?.timer ?? 'off',
    isActive: status === 'playing',
    questionKey,
    onExpire: timeoutQuestion,
  });

  // Multiple-choice choices — regenerated each question
  const choices = useMemo(
    () => buildChoices(questions, currentIndex),
    [currentIndex, questions.length], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Pin-it stickers: flag for every correctly answered country
  const stickers = useMemo(() => {
    const result: Record<string, string> = {};
    for (const attempt of attempts) {
      if (attempt.correct) {
        const alpha2 = COUNTRIES[attempt.correctCode]?.alpha2;
        if (alpha2) result[attempt.correctCode] = alpha2;
      }
    }
    return result;
  }, [attempts]);

  const countryNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const [code, info] of Object.entries(COUNTRIES)) {
      names[code] = info.name;
    }
    return names;
  }, []);

  const correctCount   = attempts.filter((a) =>  a.correct).length;
  const incorrectCount = attempts.filter((a) => !a.correct).length;
  const remaining      = questions.length - currentIndex - (status === 'feedback' ? 1 : 0);

  // Setup handlers
  const handleRegionSelect = useCallback((region: QuizRegion) => {
    setSelectedRegion(region);
    setSetupStep('config');
  }, []);

  const handleConfigBack = useCallback(() => setSetupStep('region'), []);

  const handleStart = useCallback(
    (cfg: FlagsConfig) => {
      setFlagsConfig(cfg);
      setFlagsMode(cfg.flagsMode);
      startQuiz(generateQuestions(cfg), {
        region: cfg.region,
        questionCount: cfg.questionCount,
        timer: cfg.timer,
        theme: cfg.theme,
        persistFeedback: false,
      });
    },
    [startQuiz],
  );

  // Quiz handlers
  const handleCountrySelect = useCallback(
    (alpha3: string) => { if (status === 'playing') submitAnswer(alpha3); },
    [status, submitAnswer],
  );

  const handleTypeItMatch = useCallback(
    (alpha3: string) => { if (status === 'playing') submitAnswer(alpha3); },
    [status, submitAnswer],
  );

  const handlePlayAgain = useCallback(() => {
    resetQuiz();
    setSetupStep('config');
  }, [resetQuiz]);

  const handleGoHome = useCallback(() => {
    resetQuiz();
    router.push('/');
  }, [resetQuiz, router]);

  const handleQuitRequest = useCallback(() => setShowQuitDialog(true), []);
  const handleQuitCancel  = useCallback(() => setShowQuitDialog(false), []);
  const handleQuitConfirm = useCallback(() => { setShowQuitDialog(false); quitQuiz(); }, [quitQuiz]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Setup screens
  if (status === 'idle') {
    if (setupStep === 'region') {
      return <RegionSelectScreen title="Guess the Flag" onSelect={handleRegionSelect} />;
    }
    if (setupStep === 'config' && selectedRegion) {
      return (
        <FlagsConfigScreen
          region={selectedRegion}
          onBack={handleConfigBack}
          onStart={handleStart}
        />
      );
    }
    return <RegionSelectScreen title="Guess the Flag" onSelect={handleRegionSelect} />;
  }

  // Loading guard
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
        />
      </div>
    );
  }

  // Game UIs
  if (flagsMode === 'multiple-choice') {
    return (
      <>
        <MultipleChoiceGame
          currentQuestion={currentQuestion!}
          choices={choices}
          status={status as 'playing' | 'feedback'}
          lastAttempt={lastAttempt}
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          remaining={remaining}
          onQuit={handleQuitRequest}
          onSelect={handleCountrySelect}
          secondsRemaining={secondsRemaining}
          fractionRemaining={fractionRemaining}
        />
        <QuitConfirmDialog
          visible={showQuitDialog}
          answeredCount={attempts.length}
          totalCount={questions.length}
          onKeepPlaying={handleQuitCancel}
          onQuit={handleQuitConfirm}
        />
        <AnswerFeedback
          visible={showFeedback}
          correct={lastAttempt?.correct ?? false}
          correctCountryName={
            lastAttempt ? countryNames[lastAttempt.correctCode] || lastAttempt.correctCode : ''
          }
        />
      </>
    );
  }

  if (flagsMode === 'pin-it') {
    return (
      <PinItGame
        currentQuestion={currentQuestion!}
        stickers={stickers}
        feedbackMap={feedbackMap}
        dimmedCountries={dimmedCountries}
        mapKey={mapKey}
        theme={flagsConfig?.theme ?? 'classic'}
        region={flagsConfig?.region ?? 'world'}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        remaining={remaining}
        onQuit={handleQuitRequest}
        onSelect={handleCountrySelect}
        disabled={status !== 'playing'}
        secondsRemaining={secondsRemaining}
        fractionRemaining={fractionRemaining}
        showFeedback={showFeedback}
        lastAttempt={lastAttempt}
        countryNames={countryNames}
        showQuitDialog={showQuitDialog}
        onQuitCancel={handleQuitCancel}
        onQuitConfirm={handleQuitConfirm}
        totalCount={questions.length}
        attemptCount={attempts.length}
      />
    );
  }

  // Type It
  return (
    <>
      <TypeItGame
        currentQuestion={currentQuestion!}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        remaining={remaining}
        onQuit={handleQuitRequest}
        onMatch={handleTypeItMatch}
        onSkip={() => skipQuestion()}
        disabled={status !== 'playing'}
        secondsRemaining={secondsRemaining}
        fractionRemaining={fractionRemaining}
        showQuitDialog={showQuitDialog}
        onQuitCancel={handleQuitCancel}
        onQuitConfirm={handleQuitConfirm}
        totalCount={questions.length}
        attemptCount={attempts.length}
        region={flagsConfig?.region ?? 'world'}
      />
      <AnswerFeedback
        visible={showFeedback}
        correct={lastAttempt?.correct ?? false}
        correctCountryName={
          lastAttempt ? countryNames[lastAttempt.correctCode] || lastAttempt.correctCode : ''
        }
      />
    </>
  );
}
