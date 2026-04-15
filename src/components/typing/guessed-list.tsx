'use client';

import { useEffect, useRef } from 'react';

export interface GuessedChip {
  code: string;
  name: string;
}

interface GuessedListProps {
  guessed: GuessedChip[];
}

export function GuessedList({ guessed }: GuessedListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest guess
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [guessed.length]);

  if (guessed.length === 0) {
    return (
      <div className="h-9 px-4 flex items-center">
        <p className="text-xs text-board-muted italic">Start typing — each correct name appears here</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto py-1 px-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {guessed.map(({ code, name }) => (
        <span
          key={code}
          className="shrink-0 px-2.5 py-1 rounded-full bg-board-green/15 text-board-green text-xs font-bold border border-board-green/30 whitespace-nowrap"
        >
          {name}
        </span>
      ))}
    </div>
  );
}
