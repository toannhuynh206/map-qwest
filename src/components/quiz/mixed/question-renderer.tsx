'use client';

import { motion } from 'framer-motion';
import { FlagCard } from '@/components/quiz/flag-card';
import { ShapePreview } from './shape-preview';
import { COUNTRIES } from '@/data/countries';
import type { MixedQuestion } from '@/data/mixed-quiz-generators';

interface QuestionRendererProps {
  question: MixedQuestion;
  selectedOption: string | null;
  onSelect: (option: string) => void;
  revealed: boolean;
}

const TYPE_ICONS: Record<MixedQuestion['type'], string> = {
  flag_to_country:      '🏳️',
  continent_of_country: '🌍',
  shape_to_country:     '🗺️',
  neighbor_trivia:      '🗺️',
};

export function QuestionRenderer({ question, selectedOption, onSelect, revealed }: QuestionRendererProps) {
  const isFlag  = question.type === 'flag_to_country';
  const isShape = question.type === 'shape_to_country';

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Question type badge */}
      <div className="flex items-center gap-1.5">
        <span className="text-base">{TYPE_ICONS[question.type]}</span>
        <span className="text-[11px] font-bold text-board-muted uppercase tracking-wider">
          {labelFor(question.type)}
        </span>
      </div>

      {/* Visual (flag or shape) */}
      {isFlag && question.flagAlpha2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-full max-w-[280px] mx-auto"
        >
          <FlagCard
            alpha2={question.flagAlpha2}
            countryName=""
            className="w-full rounded-2xl shadow-lg"
          />
        </motion.div>
      )}

      {isShape && question.shapeAlpha3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="flex justify-center"
        >
          <div className="bg-board-card border-2 border-board-border rounded-2xl p-4 inline-flex flex-col items-center gap-1">
            <ShapePreview
              alpha3={question.shapeAlpha3}
              width={220}
              height={160}
            />
            {question.hint && (
              <p className="text-[11px] text-board-muted font-semibold">{question.hint}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Question text */}
      <motion.p
        key={question.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-extrabold text-board-text text-center leading-snug px-1"
      >
        {question.question}
      </motion.p>

      {/* Non-shape hint */}
      {question.hint && !isShape && (
        <p className="text-xs text-board-muted text-center italic">{question.hint}</p>
      )}

      {/* Answer buttons */}
      <div className="flex flex-col gap-2.5 w-full mt-1">
        {question.options.map((option, i) => (
          <OptionButton
            key={option}
            option={option}
            index={i}
            selected={selectedOption === option}
            correct={option === question.answer}
            revealed={revealed}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface OptionButtonProps {
  option: string;
  index: number;
  selected: boolean;
  correct: boolean;
  revealed: boolean;
  onSelect: (option: string) => void;
}

function OptionButton({ option, index, selected, correct, revealed, onSelect }: OptionButtonProps) {
  let cls = 'w-full py-3.5 px-5 rounded-2xl text-left font-bold text-base border-2 transition-all ';

  if (revealed) {
    if (correct) {
      cls += 'bg-board-green/10 border-board-green text-board-green';
    } else if (selected && !correct) {
      cls += 'bg-red-50 border-red-400 text-red-600';
    } else {
      cls += 'bg-board-card border-board-border text-board-muted opacity-40';
    }
  } else if (selected) {
    cls += 'bg-board-green/10 border-board-green text-board-green-dark';
  } else {
    cls += 'bg-board-card border-board-border text-board-text hover:bg-board-hover active:scale-[0.98]';
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 320, damping: 28 }}
      onClick={() => { if (!revealed) onSelect(option); }}
      className={cls}
    >
      {option}
    </motion.button>
  );
}

// ---------------------------------------------------------------------------

function labelFor(type: MixedQuestion['type']): string {
  switch (type) {
    case 'flag_to_country':      return 'Identify the Flag';
    case 'continent_of_country': return 'Which Continent?';
    case 'shape_to_country':     return 'Identify the Shape';
    case 'neighbor_trivia':      return 'Neighbors & Borders';
    default:                     return 'Question';
  }
}
