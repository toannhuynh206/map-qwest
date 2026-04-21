/**
 * Generates dynamic quiz questions (flag, continent, shape, neighbor/borders)
 * and assembles a mixed quiz from all sources.
 */

import { COUNTRIES, type CountryInfo, type Region } from '@/data/countries';
import { QUIZ_BANK, type BankDifficulty } from '@/data/mixed-quiz-bank';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestionType =
  | 'flag_to_country'
  | 'continent_of_country'
  | 'shape_to_country'
  | 'neighbor_trivia';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface MixedQuestion {
  id: string;
  type: QuestionType;
  difficulty: QuizDifficulty;
  question: string;
  options: [string, string, string, string];
  answer: string;
  hint?: string;
  // Rendering extras
  flagAlpha2?: string;   // for flag_to_country
  shapeAlpha3?: string;  // for shape_to_country
}

// ---------------------------------------------------------------------------
// Country pools by difficulty
// ---------------------------------------------------------------------------

const ALL_COUNTRIES = Object.values(COUNTRIES);

function getPool(difficulty: QuizDifficulty): CountryInfo[] {
  if (difficulty === 'easy')   return ALL_COUNTRIES.filter(c => c.difficulty <= 2);
  if (difficulty === 'medium') return ALL_COUNTRIES.filter(c => c.difficulty <= 3);
  return ALL_COUNTRIES; // hard: all
}

// Countries with shapes that render recognizably (no antimeridian issues for simple Mercator)
const SHAPE_CODES: Record<QuizDifficulty, string[]> = {
  easy: [
    'AUS', 'ITA', 'JPN', 'GBR', 'BRA', 'IND', 'CHL', 'NOR', 'NZL',
    'MEX', 'ARG', 'EGY', 'ZAF', 'TUR', 'SWE',
  ],
  medium: [
    'DEU', 'FRA', 'ESP', 'POL', 'UKR', 'FIN', 'IRN', 'PAK',
    'NGA', 'KEN', 'ETH', 'AGO', 'MOZ', 'PER', 'COL', 'VEN',
    'IDN', 'THA', 'VNM', 'MYS',
  ],
  hard: [
    'IRQ', 'SYR', 'YEM', 'OMN', 'KAZ', 'UZB', 'TKM', 'AFG',
    'SDN', 'MRT', 'MLI', 'NER', 'TCD', 'CMR', 'TZA', 'ZMB',
    'BOL', 'PRY', 'URY', 'ECU',
    'BLR', 'ROU', 'BGR', 'HRV', 'GRC', 'PRT', 'CZE', 'HUN',
    'PHL', 'MMR', 'KHM', 'LAO',
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

const CONTINENT_LABELS: Record<Region, string> = {
  africa:        'Africa',
  asia:          'Asia',
  europe:        'Europe',
  north_america: 'North America',
  south_america: 'South America',
  oceania:       'Oceania',
};

const ALL_CONTINENTS = Object.values(CONTINENT_LABELS);

let questionCounter = 0;
function nextId(): string {
  return `q${++questionCounter}_${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Flag → Country
// ---------------------------------------------------------------------------

function generateFlagQuestion(pool: CountryInfo[]): MixedQuestion | null {
  const country = pickRandom(pool);
  if (!country.alpha2) return null;

  // Distractors: same region first, then any
  const sameRegion = pool.filter(c => c.region === country.region && c.alpha3 !== country.alpha3);
  const distractorPool = sameRegion.length >= 3 ? sameRegion : pool.filter(c => c.alpha3 !== country.alpha3);
  const distractors = pickN(distractorPool, 3);
  if (distractors.length < 3) return null;

  const options = shuffle([country.name, ...distractors.map(d => d.name)]) as [string, string, string, string];

  return {
    id: nextId(),
    type: 'flag_to_country',
    difficulty: 'easy',
    question: 'Which country does this flag belong to?',
    options,
    answer: country.name,
    flagAlpha2: country.alpha2,
  };
}

// ---------------------------------------------------------------------------
// Continent of country
// ---------------------------------------------------------------------------

function generateContinentQuestion(pool: CountryInfo[]): MixedQuestion | null {
  const country = pickRandom(pool);
  const correct = CONTINENT_LABELS[country.region];
  const wrong = ALL_CONTINENTS.filter(c => c !== correct);
  const distractors = pickN(wrong, 3);
  const options = shuffle([correct, ...distractors]) as [string, string, string, string];

  return {
    id: nextId(),
    type: 'continent_of_country',
    difficulty: 'easy',
    question: `On which continent is ${country.name} located?`,
    options,
    answer: correct,
  };
}

// ---------------------------------------------------------------------------
// Shape → Country
// ---------------------------------------------------------------------------

function generateShapeQuestion(difficulty: QuizDifficulty): MixedQuestion | null {
  // Build shape pool for this difficulty (include all tiers up to and including this one)
  const codes = difficulty === 'easy'
    ? SHAPE_CODES.easy
    : difficulty === 'medium'
      ? [...SHAPE_CODES.easy, ...SHAPE_CODES.medium]
      : [...SHAPE_CODES.easy, ...SHAPE_CODES.medium, ...SHAPE_CODES.hard];

  const validCodes = codes.filter(c => COUNTRIES[c]);
  if (validCodes.length < 4) return null;

  const alpha3 = pickRandom(validCodes);
  const country = COUNTRIES[alpha3];

  // Distractors from same continent
  const sameContinent = validCodes.filter(c => c !== alpha3 && COUNTRIES[c]?.region === country.region);
  const distractorCodes = sameContinent.length >= 3
    ? pickN(sameContinent, 3)
    : pickN(validCodes.filter(c => c !== alpha3), 3);

  if (distractorCodes.length < 3) return null;

  const options = shuffle([country.name, ...distractorCodes.map(c => COUNTRIES[c].name)]) as [string, string, string, string];

  return {
    id: nextId(),
    type: 'shape_to_country',
    difficulty,
    question: 'Which country has this shape?',
    options,
    answer: country.name,
    hint: `Hint: This country is in ${CONTINENT_LABELS[country.region]}.`,
    shapeAlpha3: alpha3,
  };
}

// ---------------------------------------------------------------------------
// Neighbor / borders from bank (neighbor_trivia only)
// ---------------------------------------------------------------------------

function getNeighborQuestion(difficulty: QuizDifficulty, used: Set<string>): MixedQuestion | null {
  const eligible = QUIZ_BANK.filter(q => {
    if (q.type !== 'neighbor_trivia') return false;
    if (used.has(q.id)) return false;
    if (difficulty === 'easy')   return q.difficulty === 'easy';
    if (difficulty === 'medium') return q.difficulty === 'easy' || q.difficulty === 'medium';
    return true; // hard: all
  });

  if (eligible.length === 0) return null;
  const q = pickRandom(eligible);
  used.add(q.id);

  return {
    id: nextId(),
    type: 'neighbor_trivia' as const,
    difficulty,
    question: q.question,
    options: [...q.options] as [string, string, string, string],
    answer: q.answer,
    hint: q.hint,
  };
}

// ---------------------------------------------------------------------------
// Main assembler
// ---------------------------------------------------------------------------

export function buildMixedQuiz(count: number, difficulty: QuizDifficulty): MixedQuestion[] {
  const pool = getPool(difficulty);
  const usedNeighborIds = new Set<string>();

  const bufferSize = count * 3;

  function tryGenerate<T>(fn: () => T | null, n: number): T[] {
    const results: T[] = [];
    let attempts = 0;
    while (results.length < n && attempts < n * 10) {
      const q = fn();
      if (q) results.push(q);
      attempts++;
    }
    return results;
  }

  const flags      = tryGenerate(() => generateFlagQuestion(pool), bufferSize);
  const continents = tryGenerate(() => generateContinentQuestion(pool), bufferSize);
  const shapes     = tryGenerate(() => generateShapeQuestion(difficulty), bufferSize);
  const neighbors  = tryGenerate(() => getNeighborQuestion(difficulty, usedNeighborIds), QUIZ_BANK.length);

  // Even split across 4 types
  const perType = Math.ceil(count / 4);

  const selected: MixedQuestion[] = [
    ...pickN(flags,      perType),
    ...pickN(continents, perType),
    ...pickN(shapes,     perType),
    ...pickN(neighbors,  perType),
  ];

  return shuffle(selected).slice(0, count);
}
