'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveMap } from '@/components/map/interactive-map';
import { MapThemeContext } from '@/context/map-theme-context';
import { COUNTRIES } from '@/data/countries';
import { COUNTRY_FACTS } from '@/data/country-facts';

// ---------------------------------------------------------------------------
// Region colours + labels (mirrors globe explorer)
// ---------------------------------------------------------------------------

const REGION_COLOR: Record<string, string> = {
  europe:        '#5856D6',
  africa:        '#FF9500',
  asia:          '#FF3B30',
  north_america: '#58CC02',
  south_america: '#34C759',
  oceania:       '#007AFF',
};

const REGION_LABEL: Record<string, string> = {
  europe:        'Europe',
  africa:        'Africa',
  asia:          'Asia',
  north_america: 'North America',
  south_america: 'South America',
  oceania:       'Oceania',
};

const CONTINENT_CHIPS = [
  { key: null,            label: 'All' },
  { key: 'africa',        label: 'Africa' },
  { key: 'asia',          label: 'Asia' },
  { key: 'europe',        label: 'Europe' },
  { key: 'north_america', label: 'Americas' },
  { key: 'south_america', label: 'S. America' },
  { key: 'oceania',       label: 'Oceania' },
] as const;

// ---------------------------------------------------------------------------
// Country info panel
// ---------------------------------------------------------------------------

function CountryPanel({
  alpha3,
  onClose,
}: {
  alpha3: string | null;
  onClose: () => void;
}) {
  const country = alpha3 ? COUNTRIES[alpha3] : null;
  const facts   = alpha3 ? COUNTRY_FACTS[alpha3] : null;
  const accent  = country ? (REGION_COLOR[country.region] ?? '#58CC02') : '#58CC02';

  return (
    <AnimatePresence>
      {country && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto px-4 pb-6"
          >
            <div className="bg-board-card rounded-3xl border border-board-border shadow-2xl overflow-hidden">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-board-border/60" />
              </div>
              <div className="px-5 pb-5 flex flex-col gap-4">
                {/* Flag + name */}
                <div className="flex items-center gap-4">
                  {country.alpha2 && (
                    <img
                      src={`https://flagcdn.com/w160/${country.alpha2.toLowerCase()}.png`}
                      alt={country.name}
                      className="h-14 w-auto rounded-xl shadow-md border border-board-border/40 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-black text-board-text leading-tight truncate">
                      {country.name}
                    </h2>
                    <span
                      className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                      style={{ background: accent }}
                    >
                      {REGION_LABEL[country.region] ?? country.region}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-board-border/30 flex items-center justify-center text-board-muted hover:text-board-text transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Capital */}
                {facts?.capital && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">📍</span>
                    <span className="text-board-text text-sm font-bold">{facts.capital}</span>
                    <span className="text-board-muted text-xs font-medium">Capital</span>
                  </div>
                )}

                {/* Fun fact */}
                {facts?.fact && (
                  <div
                    className="rounded-2xl p-3.5 border"
                    style={{ background: `${accent}12`, borderColor: `${accent}30` }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: accent }}>
                      Did you know?
                    </p>
                    <p className="text-board-text text-sm leading-snug">{facts.fact}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const EMPTY_DIMMED = new Set<string>();

export default function ExploreMapPage() {
  const router = useRouter();

  const [selected,     setSelected]     = useState<string | null>(null);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    setRegionFilter(null);
  }, []);

  const handleCountrySelect = useCallback((alpha3: string) => {
    setSelected(prev => prev === alpha3 ? null : alpha3);
  }, []);

  const selectFromSearch = useCallback((alpha3: string) => {
    setSelected(alpha3);
    closeSearch();
  }, [closeSearch]);

  const feedbackMap = useMemo(
    () => selected ? { [selected]: 'selected' as const } : {} as Record<string, never>,
    [selected],
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && !regionFilter) return [];
    return Object.entries(COUNTRIES)
      .filter(([, c]) => {
        const matchesQuery  = !q || c.name.toLowerCase().includes(q);
        const matchesRegion = !regionFilter || c.region === regionFilter;
        return matchesQuery && matchesRegion;
      })
      .sort((a, b) => a[1].name.localeCompare(b[1].name))
      .slice(0, 10) as [string, (typeof COUNTRIES)[keyof typeof COUNTRIES]][];
  }, [searchQuery, regionFilter]);

  return (
    <MapThemeContext.Provider value="classic">
      <div className="fixed inset-0 bg-board-bg select-none overflow-hidden">

        {/* Map — full screen */}
        <div className="absolute inset-0">
          <InteractiveMap
            onCountrySelect={handleCountrySelect}
            feedbackMap={feedbackMap}
            dimmedCountries={EMPTY_DIMMED}
            disabled={false}
            showMiniMap={false}
            showZoomControls
          />
        </div>

        {/* Floating header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4 flex items-center gap-3 pointer-events-none">
          <button
            onClick={() => router.push('/learn')}
            className="pointer-events-auto w-9 h-9 rounded-full bg-board-card/80 backdrop-blur-sm border border-board-border/60 flex items-center justify-center text-board-muted hover:text-board-text transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-board-text font-extrabold text-base leading-tight">Map Explorer</h1>
            <p className="text-board-muted text-[11px] font-medium">Pan · Pinch · Tap any country</p>
          </div>
          {selected && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelected(null)}
              className="pointer-events-auto px-3 py-1.5 rounded-full bg-board-card/80 backdrop-blur-sm border border-board-border/60 text-board-muted text-xs font-bold shadow-sm"
            >
              Clear
            </motion.button>
          )}
        </div>

        {/* Search pill (bottom-left) */}
        <button
          onClick={() => {
            setSearchOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 80);
          }}
          className="absolute bottom-8 left-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-board-card/90 backdrop-blur-sm border border-board-border/60 text-board-muted hover:text-board-text transition-colors shadow-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <span className="text-xs font-bold">Search</span>
        </button>

        {/* Search bottom sheet */}
        <AnimatePresence>
          {searchOpen && (
            <>
              <motion.div
                key="search-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
                onClick={closeSearch}
              />
              <motion.div
                key="search-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                className="fixed left-0 right-0 z-40 flex flex-col rounded-t-3xl bg-board-card border-t border-board-border shadow-2xl overflow-hidden"
                style={{ bottom: 0, maxHeight: 'calc(100dvh - 60px)' }}
              >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-board-border/60" />
                </div>
                <div className="flex items-center justify-between px-5 pb-3 shrink-0">
                  <p className="text-board-text font-extrabold text-base">Find a Country</p>
                  <button
                    onClick={closeSearch}
                    className="w-8 h-8 rounded-full bg-board-border/30 flex items-center justify-center text-board-muted hover:text-board-text transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Input */}
                <div className="mx-4 mb-3 flex items-center gap-2 bg-board-bg border border-board-border rounded-2xl px-3 py-2.5 shrink-0">
                  <svg className="w-4 h-4 text-board-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="e.g. Timor-Leste, France…"
                    className="flex-1 bg-transparent text-board-text text-sm placeholder-board-muted/50 outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-board-muted hover:text-board-text">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Continent chips */}
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
                  {CONTINENT_CHIPS.map(chip => (
                    <button
                      key={String(chip.key)}
                      onClick={() => setRegionFilter(chip.key)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        regionFilter === chip.key
                          ? 'bg-board-green text-white border-board-green'
                          : 'text-board-muted border-board-border hover:border-board-text/40 hover:text-board-text'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="h-px bg-board-border mx-4 shrink-0" />

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(([alpha3, country]) => (
                      <button
                        key={alpha3}
                        onClick={() => selectFromSearch(alpha3)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-board-hover active:bg-board-border/30 transition-colors text-left"
                      >
                        {country.alpha2 && (
                          <img
                            src={`https://flagcdn.com/w40/${country.alpha2.toLowerCase()}.png`}
                            alt=""
                            className="w-8 h-auto rounded-md shrink-0 shadow"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-board-text text-sm font-bold truncate">{country.name}</p>
                          <p className="text-board-muted text-[11px] mt-0.5">{REGION_LABEL[country.region] ?? country.region}</p>
                        </div>
                        <svg className="w-4 h-4 text-board-muted/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))
                  ) : (searchQuery.trim() || regionFilter) ? (
                    <p className="px-5 py-6 text-board-muted text-sm text-center">No countries found</p>
                  ) : (
                    <p className="px-5 py-6 text-board-muted/60 text-sm text-center">Type a name or pick a region above</p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Country info panel */}
        <CountryPanel alpha3={selected} onClose={() => setSelected(null)} />
      </div>
    </MapThemeContext.Provider>
  );
}
