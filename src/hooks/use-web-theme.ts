'use client';

import { useState, useEffect, useCallback } from 'react';

export type WebTheme = 'light' | 'dark' | 'colorful';

const STORAGE_KEY = 'web-theme';

function applyTheme(theme: WebTheme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'colorful');
  if (theme === 'dark') root.classList.add('dark');
  if (theme === 'colorful') root.classList.add('colorful');
}

export function useWebTheme() {
  const [theme, setThemeState] = useState<WebTheme>('light');

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as WebTheme | null;
    const initial = stored ?? 'light';
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback((next: WebTheme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }, []);

  return { theme, setTheme };
}
