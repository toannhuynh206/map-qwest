export type QuizRegion =
  | 'world'
  | 'africa'
  | 'europe'
  | 'asia'
  | 'north_america'
  | 'south_america'
  | 'oceania'
  | 'pin_mini';

export type MapTheme = 'classic' | 'political' | 'colorful' | 'terrain';
export type TimerOption = 'off' | '30s' | '1min' | '2min';
export type QuestionCount = 10 | 25 | 50 | 'all';

export interface QuizConfig {
  region: QuizRegion;
  questionCount: QuestionCount;
  timer: TimerOption;
  theme: MapTheme;
  persistFeedback: boolean;
}

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  region: 'world',
  questionCount: 10,
  timer: 'off',
  theme: 'classic',
  persistFeedback: false,
};

export const TIMER_SECONDS: Record<TimerOption, number | null> = {
  off: null,
  '30s': 30,
  '1min': 60,
  '2min': 120,
};
