'use client';

import { useState, useEffect } from 'react';

function toFlagEmoji(alpha2: string): string {
  return alpha2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 0x1f1a5))
    .join('');
}

interface FlagCardProps {
  alpha2: string;
  countryName: string;
  className?: string;
}

export function FlagCard({ alpha2, countryName, className = '' }: FlagCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);
  const src = `https://flagcdn.com/w320/${alpha2.toLowerCase()}.png`;

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [alpha2]);

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-board-border shadow-md bg-board-card ${className}`}
      style={{ aspectRatio: '3/2' }}
    >
      {/* Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-board-border/30 animate-pulse" />
      )}

      {/* Emoji fallback */}
      {error ? (
        <div className="w-full h-full flex items-center justify-center text-5xl select-none">
          {toFlagEmoji(alpha2)}
        </div>
      ) : (
        <img
          src={src}
          alt={`Flag of ${countryName}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-150 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          draggable={false}
        />
      )}
    </div>
  );
}
