'use client';

import { createContext, useContext } from 'react';
import type { MapTheme } from '@/types/quiz-config';

export interface ThemeColors {
  ocean: string;
  countryDefault: string;
  countryHover: string;
  countryStroke: string;
  miniMapOcean: string;
  miniMapLand: string;
  miniMapLandStroke: string;
  getCountryFill: (alpha3: string, region: string) => string;
  getStateFill: (abbrev: string, region: string) => string;
}

function hash(str: string): number {
  return str.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
}

const POLITICAL_BY_REGION: Record<string, string> = {
  africa: '#F5C97A',
  europe: '#85BBD4',
  asia: '#A8D4A0',
  north_america: '#DDA0CC',
  south_america: '#A0C8DD',
  oceania: '#D4B8A0',
};

const POLITICAL_BY_US_REGION: Record<string, string> = {
  northeast: '#85BBD4',
  southeast: '#F5C97A',
  midwest:   '#A8D4A0',
  southwest: '#F4A261',
  west:      '#DDA0CC',
};

const COLORFUL_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#FF8C42', '#6BCB77',
];

const TERRAIN_PALETTE = [
  '#C8D5B9', '#A8C09A', '#90B080', '#B5CDA3',
  '#9BB899', '#C4D4AC', '#7FAD8A',
];

export const THEME_COLORS: Record<MapTheme, ThemeColors> = {
  classic: {
    ocean: '#F7F7F7',
    countryDefault: '#E5E5E5',
    countryHover: '#C8F7C5',
    countryStroke: '#F7F7F7',
    miniMapOcean: '#3a7fa8',
    miniMapLand: '#a8c8a0',
    miniMapLandStroke: '#7aaa72',
    getCountryFill: () => '#E5E5E5',
    getStateFill: () => '#CBD5E1',
  },
  political: {
    ocean: '#4a90d9',
    countryDefault: '#F5C97A',
    countryHover: '#FFE066',
    countryStroke: '#FFFFFF',
    miniMapOcean: '#3a7fa8',
    miniMapLand: '#F5C97A',
    miniMapLandStroke: '#D4A85A',
    getCountryFill: (_alpha3, region) => POLITICAL_BY_REGION[region] ?? '#E0C8A0',
    getStateFill: (_abbrev, region) => POLITICAL_BY_US_REGION[region] ?? '#CBD5E1',
  },
  colorful: {
    ocean: '#EEF6FF',
    countryDefault: '#FF6B6B',
    countryHover: '#FFD700',
    countryStroke: '#FFFFFF',
    miniMapOcean: '#BDD7EE',
    miniMapLand: '#FF6B6B',
    miniMapLandStroke: '#DD4444',
    getCountryFill: (alpha3) => COLORFUL_PALETTE[hash(alpha3) % COLORFUL_PALETTE.length],
    getStateFill: (abbrev) => COLORFUL_PALETTE[hash(abbrev) % COLORFUL_PALETTE.length],
  },
  terrain: {
    ocean: '#5B8FA8',
    countryDefault: '#C8D5B9',
    countryHover: '#D4E89A',
    countryStroke: '#6B8E5E',
    miniMapOcean: '#4a7a96',
    miniMapLand: '#C8D5B9',
    miniMapLandStroke: '#6B8E5E',
    getCountryFill: (alpha3) => TERRAIN_PALETTE[hash(alpha3) % TERRAIN_PALETTE.length],
    getStateFill: (abbrev) => TERRAIN_PALETTE[hash(abbrev) % TERRAIN_PALETTE.length],
  },
};

export const THEME_META: Record<MapTheme, { name: string; description: string }> = {
  classic: { name: 'Classic', description: 'Clean & minimal' },
  political: { name: 'Political', description: 'Blue oceans' },
  colorful: { name: 'Colorful', description: 'Vivid colors' },
  terrain: { name: 'Terrain', description: 'Earth tones' },
};

export const MapThemeContext = createContext<MapTheme>('classic');

export function useMapTheme(): { theme: MapTheme; colors: ThemeColors } {
  const theme = useContext(MapThemeContext);
  return { theme, colors: THEME_COLORS[theme] };
}
