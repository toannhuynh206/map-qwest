import type { QuizRegion } from '@/types/quiz-config';

export interface RegionMapDefaults {
  /** Geographic center [longitude, latitude] */
  center: [number, number];
  /** Initial zoom level (1 = fully zoomed out) */
  zoom: number;
}

/**
 * Default map center and zoom for each quiz region.
 * Used by all game modes — Pin the Country, Flags, Name the Country, etc.
 */
export const REGION_MAP_DEFAULTS: Record<QuizRegion, RegionMapDefaults> = {
  world:         { center: [0, 10],     zoom: 1   },
  pin_mini:      { center: [0, 10],     zoom: 1   },
  africa:        { center: [20, 2],     zoom: 2.8 },
  europe:        { center: [15, 52],    zoom: 3.5 },
  asia:          { center: [90, 35],    zoom: 2.2 },
  north_america: { center: [-95, 47],   zoom: 2.4 },
  south_america: { center: [-58, -15],  zoom: 2.6 },
  oceania:       { center: [150, -25],  zoom: 3.0 },
};
