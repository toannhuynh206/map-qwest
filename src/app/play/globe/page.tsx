'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeMap, type GlobeMapHandle } from '@/components/map/globe-map';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuitConfirmDialog } from '@/components/quiz/quit-confirm-dialog';
import { FEEDBACK_DELAY_CORRECT, FEEDBACK_DELAY_INCORRECT } from '@/components/quiz/answer-feedback';
import { useQuizStore, type QuizQuestion } from '@/stores/quiz-store';
import { COUNTRIES, getCountriesByRegion, type Region } from '@/data/countries';
import { useSound } from '@/hooks/use-sound';
import { useHaptic } from '@/hooks/use-haptic';
import { useQuestionTimer } from '@/hooks/use-question-timer';
import { regionToFactCategory } from '@/data/fun-facts';
import { TIMER_SECONDS, type TimerOption } from '@/types/quiz-config';

// ---------------------------------------------------------------------------
// Config types
// ---------------------------------------------------------------------------

type GlobeRegion = 'world' | 'africa' | 'asia' | 'europe' | 'north_america' | 'south_america' | 'oceania';
type GlobeCount  = 10 | 25 | 50 | 'all';

interface GlobeQuizConfig {
  region:        GlobeRegion;
  questionCount: GlobeCount;
  timer:         TimerOption;
}

const DEFAULT_CONFIG: GlobeQuizConfig = { region: 'world', questionCount: 25, timer: 'off' };

const REGION_OPTIONS: { key: GlobeRegion; label: string; emoji: string }[] = [
  { key: 'world',         label: 'World',         emoji: '🌍' },
  { key: 'africa',        label: 'Africa',         emoji: '🌍' },
  { key: 'asia',          label: 'Asia',           emoji: '🌏' },
  { key: 'europe',        label: 'Europe',         emoji: '🌍' },
  { key: 'north_america', label: 'Americas',       emoji: '🌎' },
  { key: 'south_america', label: 'S. America',     emoji: '🌎' },
  { key: 'oceania',       label: 'Oceania',        emoji: '🌏' },
];

const COUNT_OPTIONS: GlobeCount[] = [10, 25, 50, 'all'];

const TIMER_OPTIONS: { value: TimerOption; label: string }[] = [
  { value: 'off',  label: 'No timer' },
  { value: '30s',  label: '30 s' },
  { value: '1min', label: '60 s' },
];

// ---------------------------------------------------------------------------
// Question generation
// ---------------------------------------------------------------------------

function generateQuestions(config: GlobeQuizConfig): QuizQuestion[] {
  const pool = config.region === 'world'
    ? Object.values(COUNTRIES)
    : getCountriesByRegion(config.region as Region);

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const count    = config.questionCount === 'all'
    ? shuffled.length
    : Math.min(config.questionCount, shuffled.length);

  return shuffled.slice(0, count).map(c => ({
    countryCode: c.alpha3,
    countryName: c.name,
    difficulty:  c.difficulty,
    region:      c.region,
  }));
}

// ---------------------------------------------------------------------------
// Config screen
// ---------------------------------------------------------------------------

function ConfigScreen({
  config,
  onConfigChange,
  onStart,
  onBack,
}: {
  config: GlobeQuizConfig;
  onConfigChange: (c: GlobeQuizConfig) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const poolSize = config.region === 'world'
    ? Object.values(COUNTRIES).length
    : getCountriesByRegion(config.region as Region).length;

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Header */}
      <div className="bg-board-card border-b border-board-border px-4 py-4 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center text-board-muted hover:text-board-text transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-extrabold text-board-text">Globe Quiz</h1>
          <p className="text-xs text-board-muted">Spin the globe · Find the country</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-6">

        {/* Region */}
        <div>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Region</p>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => onConfigChange({ ...config, region: opt.key })}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold border transition-all ${
                  config.region === opt.key
                    ? 'bg-board-green text-white border-board-green'
                    : 'bg-board-card border-board-border text-board-muted hover:border-board-green/40'
                }`}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Questions</p>
          {/* Fixed counts */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {([10, 25, 50] as const).map(n => (
              <button
                key={n}
                onClick={() => onConfigChange({ ...config, questionCount: n })}
                disabled={n > poolSize}
                className={`py-3 rounded-xl text-sm font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  config.questionCount === n
                    ? 'bg-board-green text-white border-board-green'
                    : 'bg-board-card border-board-border text-board-muted'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {/* All — spans full width, shows exact country count */}
          <button
            onClick={() => onConfigChange({ ...config, questionCount: 'all' })}
            className={`w-full py-3 rounded-xl text-sm font-bold border transition-all ${
              config.questionCount === 'all'
                ? 'bg-board-green text-white border-board-green'
                : 'bg-board-card border-board-border text-board-muted'
            }`}
          >
            All&nbsp;
            <span className={`text-xs font-black ${config.questionCount === 'all' ? 'text-white/70' : 'text-board-muted/70'}`}>
              ({poolSize} countries)
            </span>
          </button>
          <p className="text-[11px] text-board-muted mt-2 font-bold">{poolSize} countries in pool</p>
        </div>

        {/* Timer */}
        <div>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Timer</p>
          <div className="flex gap-2">
            {TIMER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onConfigChange({ ...config, timer: opt.value })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  config.timer === opt.value
                    ? 'bg-board-green text-white border-board-green'
                    : 'bg-board-card border-board-border text-board-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-[#1A6BAA]/10 border border-[#1A6BAA]/25 rounded-2xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-[#1A6BAA] uppercase tracking-wider">How it works</p>
          <p className="text-board-text text-sm">A country name appears — spin the globe and tap it.</p>
          <p className="text-board-text text-sm">Pinch to zoom in, drag to spin.</p>
          <p className="text-board-text text-sm">Use the hint to narrow it to a region.</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-board-green text-white font-extrabold text-base"
        >
          Start Quiz →
        </motion.button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dark feedback banner (replaces AnswerFeedback for dark globe background)
// ---------------------------------------------------------------------------

function GlobeFeedbackBanner({
  visible,
  correct,
  correctName,
}: {
  visible: boolean;
  correct: boolean;
  correctName: string;
}) {
  const delay = correct ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_INCORRECT;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={`absolute bottom-0 left-0 right-0 z-40 border-t-2 overflow-hidden ${
            correct
              ? 'bg-[#0B2E14]/90 border-[#58CC02] backdrop-blur-md'
              : 'bg-[#2E0B0B]/90 border-[#FF4B4B] backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-4 max-w-lg mx-auto">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
              correct ? 'bg-[#58CC02]' : 'bg-[#FF4B4B]'
            }`}>
              {correct ? '✓' : '✗'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-extrabold text-base ${correct ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                {correct ? 'Correct!' : 'Incorrect'}
              </p>
              {!correct && (
                <p className="text-white/70 text-sm">
                  Answer: <span className="font-bold text-white">{correctName}</span>
                </p>
              )}
            </div>
          </div>
          {/* Auto-advance bar */}
          <motion.div
            className={`h-1 ${correct ? 'bg-[#58CC02]' : 'bg-[#FF4B4B]'}`}
            initial={{ scaleX: 1, originX: 0 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: delay / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Globe quiz page
// ---------------------------------------------------------------------------

type Phase = 'config' | 'quiz' | 'results';

export default function GlobeQuizPage() {
  const router    = useRouter();
  const globeRef  = useRef<GlobeMapHandle>(null);

  const [phase,          setPhase]          = useState<Phase>('config');
  const [config,         setConfig]         = useState<GlobeQuizConfig>(DEFAULT_CONFIG);
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
    startQuiz,
    submitAnswer,
    nextQuestion,
    skipQuestion,
    useHint,
    useFiftyFifty,
    quitQuiz,
    resetQuiz,
    timeoutQuestion,
  } = useQuizStore();

  const { playCorrect, playIncorrect } = useSound();
  const { vibrateCorrect, vibrateIncorrect } = useHaptic();

  const currentQuestion = questions[currentIndex];
  const lastAttempt     = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const showFeedback    = status === 'feedback' && lastAttempt !== null;

  // Sound + haptic + auto-advance + fly-to on wrong answer
  useEffect(() => {
    if (status !== 'feedback' || !lastAttempt) return;
    if (lastAttempt.correct) {
      playCorrect();
      vibrateCorrect();
    } else {
      playIncorrect();
      vibrateIncorrect();
      // Fly to the correct country so the user sees where it is
      globeRef.current?.flyTo(lastAttempt.correctCode);
    }
    const delay = lastAttempt.correct ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_INCORRECT;
    const timer = setTimeout(() => nextQuestion(), delay);
    return () => clearTimeout(timer);
  }, [status, attempts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Transition to results phase when store reaches 'results'
  useEffect(() => {
    if (status === 'results' && phase === 'quiz') setPhase('results');
  }, [status, phase]);

  // Timer
  const questionKey = currentQuestion
    ? `${currentIndex}-${currentQuestion.countryCode}`
    : String(currentIndex);

  const { secondsRemaining, fractionRemaining } = useQuestionTimer({
    timer:               config.timer,
    isActive:            status === 'playing',
    questionKey,
    onExpire:            timeoutQuestion,
  });

  const timerOn = secondsRemaining !== null;
  const urgent  = timerOn && (secondsRemaining ?? 99) < 10;

  // Derived counts
  const correctCount   = attempts.filter(a => a.correct).length;
  const incorrectCount = attempts.filter(a => !a.correct).length;
  const remaining      = questions.length - currentIndex - (status === 'feedback' ? 1 : 0);

  // Handlers
  const allCountryCodes = useMemo(() => Object.keys(COUNTRIES), []);

  const handleStart = () => {
    startQuiz(generateQuestions(config), {
      region:          config.region,
      questionCount:   config.questionCount,
      timer:           config.timer,
      theme:           'classic',
      persistFeedback: false,
    });
    setPhase('quiz');
  };

  const handleCountryTap = useCallback((alpha3: string) => {
    if (status === 'playing') submitAnswer(alpha3);
  }, [status, submitAnswer]);

  const handleHint = useCallback(
    () => useHint(allCountryCodes, (code) => COUNTRIES[code]?.region),
    [useHint, allCountryCodes],
  );

  const handleFiftyFifty = useCallback(
    () => useFiftyFifty(allCountryCodes),
    [useFiftyFifty, allCountryCodes],
  );

  const handleSkip = useCallback(() => skipQuestion(), [skipQuestion]);

  const handleQuitConfirm = useCallback(() => {
    setShowQuitDialog(false);
    quitQuiz();
  }, [quitQuiz]);

  const handlePlayAgain = useCallback(() => {
    resetQuiz();
    setPhase('config');
  }, [resetQuiz]);

  const handleGoHome = useCallback(() => {
    resetQuiz();
    router.push('/');
  }, [resetQuiz, router]);

  const countryNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const [code, info] of Object.entries(COUNTRIES)) map[code] = info.name;
    return map;
  }, []);

  const factCategory = regionToFactCategory('countries', config.region);

  // ── Config phase ───────────────────────────────────────────────────────────

  if (phase === 'config') {
    return (
      <ConfigScreen
        config={config}
        onConfigChange={setConfig}
        onStart={handleStart}
        onBack={() => router.push('/')}
      />
    );
  }

  // ── Results phase ──────────────────────────────────────────────────────────

  if (phase === 'results') {
    return (
      <div className="fixed inset-0 bg-board-bg flex flex-col overflow-hidden">
        <QuizResults
          score={score}
          totalQuestions={questions.length}
          attempts={attempts}
          countryNames={countryNames}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
          factCategory={factCategory}
        />
      </div>
    );
  }

  // ── Quiz phase ─────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-[#0D1B2A] select-none overflow-hidden">
      {/* Globe */}
      <GlobeMap
        ref={globeRef}
        feedbackMap={feedbackMap}
        dimmedCountries={dimmedCountries}
        onCountryTap={handleCountryTap}
        disabled={status !== 'playing'}
        showZoomControls
      />

      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="flex items-center justify-between max-w-lg mx-auto pointer-events-auto">
          {/* Quit */}
          <button
            onClick={() => setShowQuitDialog(true)}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Timer */}
          {timerOn ? (
            <div className={`flex items-center gap-1.5 ${urgent ? 'text-[#FF4B4B]' : 'text-white/70'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth={2} opacity={0.2} />
                <circle
                  cx="12" cy="12" r="10"
                  fill="none" stroke="currentColor" strokeWidth={2}
                  strokeDasharray={2 * Math.PI * 10}
                  strokeDashoffset={fractionRemaining !== null ? 2 * Math.PI * 10 * (1 - fractionRemaining) : 0}
                  strokeLinecap="round"
                  transform="rotate(-90 12 12)"
                  style={{ transition: 'stroke-dashoffset 0.2s linear' }}
                />
              </svg>
              <span className="text-sm font-bold tabular-nums min-w-[2ch] text-center">{secondsRemaining}</span>
            </div>
          ) : <div className="w-14" />}

          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-[#58CC02] flex items-center justify-center text-white text-[10px] font-bold">✓</span>
              <span className="text-sm font-bold text-[#58CC02]">{correctCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-[#FF4B4B] flex items-center justify-center text-white text-[10px] font-bold">✗</span>
              <span className="text-sm font-bold text-[#FF4B4B]">{incorrectCount}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <span className="text-sm font-bold text-white/50">{remaining} left</span>
          </div>
        </div>

        {/* Country name prompt */}
        {currentQuestion && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.countryCode}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="text-center mt-3 pointer-events-none"
            >
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-0.5">Find this country</p>
              <p className="text-white font-black text-2xl leading-tight drop-shadow-lg">
                {currentQuestion.countryName}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Toolbar overlay (bottom-left glass buttons) */}
      {status === 'playing' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-8 left-4 z-30 flex gap-2"
        >
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/15 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Skip
          </button>
          <button
            onClick={handleHint}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/15 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          >
            Hint
          </button>
          <button
            onClick={handleFiftyFifty}
            disabled={hintsUsed >= 3}
            className="flex items-center gap-1.5 px-3 py-2 bg-black/50 backdrop-blur-sm border border-white/15 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-black/70 transition-colors disabled:opacity-30"
          >
            50/50
            {hintsUsed < 3 && (
              <span className="text-[10px] bg-[#58CC02] text-white px-1.5 py-0.5 rounded-full font-bold">
                {3 - hintsUsed}
              </span>
            )}
          </button>
        </motion.div>
      )}

      {/* Feedback banner */}
      <GlobeFeedbackBanner
        visible={showFeedback}
        correct={lastAttempt?.correct ?? false}
        correctName={lastAttempt ? (countryNames[lastAttempt.correctCode] ?? lastAttempt.correctCode) : ''}
      />

      {/* Quit dialog */}
      <QuitConfirmDialog
        visible={showQuitDialog}
        answeredCount={attempts.length}
        totalCount={questions.length}
        onKeepPlaying={() => setShowQuitDialog(false)}
        onQuit={handleQuitConfirm}
      />
    </div>
  );
}
