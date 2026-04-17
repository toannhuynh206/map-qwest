'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionRenderer } from '@/components/quiz/mixed/question-renderer';
import { buildMixedQuiz, type MixedQuestion, type QuizDifficulty } from '@/data/mixed-quiz-generators';
import { getScoreTier, getEndMessage } from '@/data/end-messages';
import { getRandomFunFact } from '@/data/fun-facts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = 'setup' | 'playing' | 'results';

const QUESTION_COUNTS = [10, 20, 25] as const;
type QuestionCount = (typeof QUESTION_COUNTS)[number];

interface AnswerRecord {
  question: MixedQuestion;
  selected: string;
  correct: boolean;
}

// ---------------------------------------------------------------------------
// Setup screen
// ---------------------------------------------------------------------------

function SetupScreen({
  onStart,
  onBack,
}: {
  onStart: (difficulty: QuizDifficulty, count: QuestionCount) => void;
  onBack: () => void;
}) {
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [count, setCount] = useState<QuestionCount>(10);

  const DIFFICULTIES: { id: QuizDifficulty; label: string; desc: string; emoji: string }[] = [
    { id: 'easy',   label: 'Easy',   emoji: '🌱', desc: 'Famous countries, major capitals, well-known flags' },
    { id: 'medium', label: 'Medium', emoji: '🌍', desc: 'Regional capitals, trickier shapes, varied trivia' },
    { id: 'hard',   label: 'Hard',   emoji: '🔥', desc: 'Obscure nations, tricky borders, expert knowledge' },
  ];

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
          <h1 className="text-base font-extrabold text-board-text">Geography Quiz</h1>
          <p className="text-xs text-board-muted">Mix of flags, capitals, shapes & trivia</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* Difficulty */}
        <section>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Difficulty</p>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                  difficulty === d.id
                    ? 'border-board-green bg-board-green/8'
                    : 'border-board-border bg-board-card hover:bg-board-hover'
                }`}
              >
                <span className="text-2xl shrink-0">{d.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-extrabold text-sm ${difficulty === d.id ? 'text-board-green-dark' : 'text-board-text'}`}>
                    {d.label}
                  </p>
                  <p className="text-xs text-board-muted leading-snug">{d.desc}</p>
                </div>
                {difficulty === d.id && (
                  <div className="w-5 h-5 rounded-full bg-board-green flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Question count */}
        <section>
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Questions</p>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-3 rounded-2xl font-extrabold text-base border-2 transition-all ${
                  count === n
                    ? 'bg-board-green text-white border-board-green-dark'
                    : 'bg-board-card text-board-text border-board-border hover:bg-board-hover'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </section>

        {/* Question type preview */}
        <section className="bg-board-card border border-board-border rounded-2xl p-4">
          <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3">Question Mix</p>
          <div className="space-y-1.5">
            {[
              ['🏳️', 'Flag Identification'],
              ['🏛️', 'Capital Cities'],
              ['🌍', 'Continents'],
              ['🗺️', 'Country Shapes'],
              ['🌐', 'Geography Trivia & Borders'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="text-sm text-board-text font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={() => onStart(difficulty, count)}
          className="w-full py-4 bg-board-green text-white font-extrabold text-lg rounded-2xl btn-chunky hover:bg-board-green-dark"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game screen
// ---------------------------------------------------------------------------

const REVEAL_DELAY_CORRECT   = 1000;
const REVEAL_DELAY_INCORRECT = 1800;

function GameScreen({
  questions,
  onFinish,
}: {
  questions: MixedQuestion[];
  onFinish: (answers: AnswerRecord[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const question = questions[currentIndex];

  const handleSelect = useCallback((option: string) => {
    if (revealed || selectedOption !== null) return;

    const correct = option === question.answer;
    setSelectedOption(option);
    setRevealed(true);

    const record: AnswerRecord = { question, selected: option, correct };
    const newAnswers = [...answers, record];

    const delay = correct ? REVEAL_DELAY_CORRECT : REVEAL_DELAY_INCORRECT;
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        onFinish(newAnswers);
      } else {
        setAnswers(newAnswers);
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setRevealed(false);
      }
    }, delay);
  }, [revealed, selectedOption, question, answers, currentIndex, questions.length, onFinish]);

  const progress = (currentIndex / questions.length);

  return (
    <div className="min-h-screen bg-board-bg flex flex-col">
      {/* Progress header */}
      <div className="bg-board-card border-b border-board-border px-4 py-3 shrink-0">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <span className="text-xs font-bold text-board-muted tabular-nums">
            {currentIndex + 1}/{questions.length}
          </span>
          <div className="flex-1 bg-board-border rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 bg-board-green rounded-full"
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-board-green flex items-center justify-center text-white text-[10px] font-bold">✓</span>
            <span className="text-xs font-bold text-board-green">
              {answers.filter(a => a.correct).length}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            >
              <QuestionRenderer
                question={question}
                selectedOption={selectedOption}
                onSelect={handleSelect}
                revealed={revealed}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback bar */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className={`shrink-0 border-t-2 px-4 py-4 ${
              selectedOption === question.answer
                ? 'bg-green-50 border-board-green'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <div className="max-w-lg mx-auto flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                selectedOption === question.answer ? 'bg-board-green' : 'bg-red-400'
              }`}>
                {selectedOption === question.answer ? '✓' : '✗'}
              </div>
              <div>
                <p className={`font-extrabold text-base ${selectedOption === question.answer ? 'text-board-green-dark' : 'text-red-600'}`}>
                  {selectedOption === question.answer ? 'Correct!' : 'Incorrect'}
                </p>
                {selectedOption !== question.answer && (
                  <p className="text-red-500 text-sm">
                    Answer: <span className="font-bold">{question.answer}</span>
                  </p>
                )}
              </div>
            </div>
            {/* Auto-advance bar */}
            <motion.div
              className={`mt-3 h-0.5 rounded-full ${selectedOption === question.answer ? 'bg-board-green' : 'bg-red-400'}`}
              initial={{ scaleX: 1, originX: 0 }}
              animate={{ scaleX: 0 }}
              transition={{
                duration: (selectedOption === question.answer ? REVEAL_DELAY_CORRECT : REVEAL_DELAY_INCORRECT) / 1000,
                ease: 'linear',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------

function ResultsScreen({
  answers,
  difficulty,
  onPlayAgain,
  onGoHome,
}: {
  answers: AnswerRecord[];
  difficulty: QuizDifficulty;
  onPlayAgain: () => void;
  onGoHome: () => void;
}) {
  const total    = answers.length;
  const score    = answers.filter(a => a.correct).length;
  const accuracy = Math.round((score / total) * 100);

  const endMessage = useMemo(() => getEndMessage(getScoreTier(score, total)), [score, total]);
  const funFact    = useMemo(() => getRandomFunFact('world'), []);

  const emoji =
    accuracy === 100 ? '🏆' :
    accuracy >= 80   ? '🌟' :
    accuracy >= 60   ? '🎯' :
    accuracy >= 40   ? '💪' : '📚';

  const DIFF_LABEL: Record<QuizDifficulty, string> = {
    easy: 'Easy', medium: 'Medium', hard: 'Hard',
  };

  return (
    <div className="flex flex-col items-center px-5 py-8 min-h-screen overflow-y-auto bg-board-bg">
      {/* Score circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.2 }}
        className="w-32 h-32 rounded-full bg-board-green flex flex-col items-center justify-center mb-4 shadow-lg"
      >
        <span className="text-3xl">{emoji}</span>
        <span className="text-white font-black text-3xl">{accuracy}%</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-black text-board-text mb-1 text-center"
      >
        {endMessage}
      </motion.h2>
      <p className="text-board-muted mb-5 text-center">
        {score}/{total} correct &middot; {DIFF_LABEL[difficulty]} difficulty
      </p>

      {/* Fun fact */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm mb-6 bg-board-card border border-board-border rounded-2xl px-4 py-3 flex gap-3 items-start"
      >
        <span className="text-xl shrink-0">🌍</span>
        <div>
          <p className="text-[10px] font-bold text-board-green uppercase tracking-wider mb-0.5">Did you know?</p>
          <p className="text-sm text-board-text leading-snug">{funFact}</p>
        </div>
      </motion.div>

      {/* Buttons */}
      <div className="flex gap-3 w-full max-w-sm mb-8">
        <button
          onClick={onPlayAgain}
          className="flex-1 py-3 bg-board-green text-white font-bold rounded-xl btn-chunky hover:bg-board-green-dark"
        >
          Play Again
        </button>
        <button
          onClick={onGoHome}
          className="flex-1 py-3 bg-board-card text-board-text font-bold rounded-xl btn-chunky border border-board-border hover:bg-board-hover"
        >
          Home
        </button>
      </div>

      {/* Review list */}
      <div className="w-full max-w-sm space-y-2">
        <h3 className="font-bold text-board-muted text-sm uppercase tracking-wider mb-3">Review</h3>
        {answers.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.04 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-board-card border border-board-border"
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 ${
              a.correct ? 'bg-board-green' : 'bg-red-400'
            }`}>
              {a.correct ? '✓' : '✗'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-board-muted leading-snug">{a.question.question}</p>
              {!a.correct && (
                <p className="text-xs text-board-text font-bold mt-0.5">
                  ✓ {a.question.answer}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-8" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MixedQuizPage() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium');
  const [questions, setQuestions] = useState<MixedQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const handleStart = useCallback((diff: QuizDifficulty, count: number) => {
    const qs = buildMixedQuiz(count, diff);
    setDifficulty(diff);
    setQuestions(qs);
    setAnswers([]);
    setPhase('playing');
  }, []);

  const handleFinish = useCallback((recs: AnswerRecord[]) => {
    setAnswers(recs);
    setPhase('results');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPhase('setup');
  }, []);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  if (phase === 'setup') {
    return <SetupScreen onStart={handleStart} onBack={() => router.push('/')} />;
  }

  if (phase === 'playing') {
    return <GameScreen questions={questions} onFinish={handleFinish} />;
  }

  return (
    <ResultsScreen
      answers={answers}
      difficulty={difficulty}
      onPlayAgain={handlePlayAgain}
      onGoHome={handleGoHome}
    />
  );
}
