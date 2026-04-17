import { COUNTRY_ALIASES, NORMAL_MODE_ALIASES, STATE_ALIASES } from '@/data/country-aliases';
import { COUNTRIES, getCountriesByRegion, type Region } from '@/data/countries';
import { US_STATES } from '@/data/us-states';
import type { QuizRegion } from '@/types/quiz-config';

export interface TypingEntry {
  code: string;
  name: string;
}

/** Strip diacritics, apostrophes, lowercase, collapse spaces. */
export function normalize(s: string): string {
  return s
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacritics
    .replace(/['''`]/g, '')          // apostrophes
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Build the pool of entries for a given mode/region/difficulty, and a lookup
 * map from every normalized name/alias to that entry's code.
 *
 * - expert: canonical names + genuine alternate names (e.g. "Russia", "USA")
 * - normal: expert + short-form truncations (e.g. "Antigua" for "Antigua and Barbuda")
 */
export function buildPool(
  mode: 'countries' | 'states',
  region: QuizRegion = 'world',
  difficulty: 'normal' | 'expert' = 'normal',
): {
  pool: TypingEntry[];
  lookup: Map<string, string>;
} {
  const pool: TypingEntry[] = [];
  const lookup = new Map<string, string>();

  if (mode === 'states') {
    for (const [abbrev, state] of Object.entries(US_STATES)) {
      pool.push({ code: abbrev, name: state.name });
      lookup.set(normalize(state.name), abbrev);
    }
    // Normal mode: 2-letter abbreviations work (NY = New York).
    // Expert mode: full state name only — no shortcuts.
    if (difficulty === 'normal') {
      for (const [alias, abbrev] of Object.entries(STATE_ALIASES)) {
        lookup.set(alias, abbrev);
      }
    }
  } else {
    let countries;
    if (region === 'world') {
      countries = Object.values(COUNTRIES);
    } else if (region === 'pin_mini') {
      countries = Object.values(COUNTRIES); // fallback to world
    } else {
      countries = getCountriesByRegion(region as Region);
    }

    for (const c of countries) {
      pool.push({ code: c.alpha3, name: c.name });
      lookup.set(normalize(c.name), c.alpha3);
    }

    // Add aliases — only if the code is in the current pool
    const poolCodes = new Set(pool.map((e) => e.code));
    for (const [alias, code] of Object.entries(COUNTRY_ALIASES)) {
      if (poolCodes.has(code)) {
        lookup.set(normalize(alias), code);
      }
    }

    // Normal mode: also accept first-word/partial forms of compound names
    if (difficulty === 'normal') {
      for (const [alias, code] of Object.entries(NORMAL_MODE_ALIASES)) {
        if (poolCodes.has(code)) {
          lookup.set(normalize(alias), code);
        }
      }
    }
  }

  return { pool, lookup };
}

/**
 * Try to match player input against the lookup. Returns the matched code or
 * null if no match.
 */
export function matchInput(
  input: string,
  lookup: Map<string, string>,
  alreadyGuessed: Set<string>,
): string | null {
  const key = normalize(input);
  if (key.length < 2) return null;
  const code = lookup.get(key);
  if (!code || alreadyGuessed.has(code)) return null;
  return code;
}
