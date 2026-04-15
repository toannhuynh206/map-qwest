'use client';

import { useCallback } from 'react';
import { useSyncExternalStore } from 'react';

export type WebTheme = 'light' | 'dark' | 'colorful';

const STORAGE_KEY = 'web-theme';

// ---------------------------------------------------------------------------
// Module-level singleton — one source of truth for the whole app
// ---------------------------------------------------------------------------

let _current: WebTheme = 'light';
const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach((l) => l());
}

function _subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
}

function _getSnapshot(): WebTheme {
  return _current;
}

// SSR snapshot — always 'light' on the server (avoids hydration mismatch)
function _getServerSnapshot(): WebTheme {
  return 'light';
}

function _applyTheme(theme: WebTheme) {
  const root = document.documentElement;
  root.classList.remove('dark', 'colorful');
  if (theme === 'dark')     root.classList.add('dark');
  if (theme === 'colorful') root.classList.add('colorful');
}

function _setTheme(theme: WebTheme) {
  _current = theme;
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private browsing */ }
  _applyTheme(theme);
  _notify();
}

// Initialise from localStorage once on the client (called from the hook on
// first render so it happens as early as possible, not just in an effect)
let _initialised = false;
function _initFromStorage() {
  if (_initialised || typeof window === 'undefined') return;
  _initialised = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as WebTheme | null;
    if (stored && stored !== _current) {
      _current = stored;
      _applyTheme(stored);
      // No need to notify — this runs during the render that will read _current
    }
  } catch { /* private browsing */ }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWebTheme() {
  _initFromStorage();

  const theme = useSyncExternalStore(_subscribe, _getSnapshot, _getServerSnapshot);

  const setTheme = useCallback((next: WebTheme) => {
    _setTheme(next);
  }, []);

  return { theme, setTheme };
}
