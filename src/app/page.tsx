'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWebTheme, type WebTheme } from '@/hooks/use-web-theme';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const QUIZZES = [
  {
    id: 'pin-country',
    title: 'Pin the Country',
    description: 'Tap the correct country on the map',
    icon: '📍',
    href: '/play/quiz',
    available: true,
    accent: '#58CC02',
  },
  {
    id: 'us-states',
    title: 'US States',
    description: 'Pin all 50 states on the map',
    icon: '🗺️',
    href: '/play/states',
    available: true,
    accent: '#007AFF',
  },
  {
    id: 'guess-flag',
    title: 'Guess the Flag',
    description: 'See the flag, tap the country',
    icon: '🏳️',
    href: '/play/flags',
    available: true,
    accent: '#FF9500',
  },
  {
    id: 'name-country',
    title: 'Name the Country',
    description: 'Type every country you know — timed',
    icon: '⌨️',
    href: '/play/typing',
    available: true,
    accent: '#007AFF',
  },
  {
    id: 'geography-quiz',
    title: 'Geography Quiz',
    description: 'Flags, capitals, shapes & trivia — mixed',
    icon: '🧠',
    href: '/play/mixed',
    available: true,
    accent: '#AF52DE',
  },
  {
    id: 'puzzle',
    title: 'Daily Puzzle',
    description: '3 curated questions, one shot',
    icon: '🧩',
    href: '/play/puzzle',
    available: false,
    accent: '#FF9500',
  },
] as const;

const LEARNING = [
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Learn countries with spaced repetition',
    icon: '🃏',
    href: '/learn/flashcards',
  },
  {
    id: 'facts',
    title: 'Country Facts',
    description: 'Capitals, populations, languages',
    icon: '📖',
    href: '/learn/facts',
  },
  {
    id: 'us-states',
    title: 'US States',
    description: 'All 50 states on the map',
    icon: '🗺️',
    href: '/learn/states',
  },
] as const;

const RATING = 1200;
const STREAK = 0;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 26, delay: i * 0.05 },
  }),
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-board-muted uppercase tracking-wider mb-3 px-1">
      {children}
    </p>
  );
}

function AvailableCard({
  icon,
  title,
  description,
  href,
  accent,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  accent: string;
  index: number;
}) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="show">
      <Link href={href}>
        <motion.div
          whileHover={{ backgroundColor: 'var(--color-board-hover)' }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-board-card border border-board-border cursor-pointer transition-colors"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: `${accent}18` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-board-text font-bold text-base">{title}</h3>
            <p className="text-board-muted text-sm leading-snug">{description}</p>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: accent }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

function LockedCard({
  icon,
  title,
  index,
}: {
  icon: string;
  title: string;
  index: number;
}) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="show">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-board-card/50 border border-board-border/50 opacity-40 cursor-not-allowed">
        <div className="w-12 h-12 bg-board-border/30 rounded-xl flex items-center justify-center text-2xl grayscale shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-board-muted font-bold text-base">{title}</h3>
          <p className="text-board-muted/60 text-sm">Coming soon</p>
        </div>
        <div className="w-8 h-8 bg-board-border/40 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-board-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const THEME_OPTIONS: { value: WebTheme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'colorful', label: 'Colorful', icon: '🎨' },
];

export default function HomePage() {
  const { theme, setTheme } = useWebTheme();
  return (
    <div className="min-h-screen bg-board-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-board-card border-b border-board-border">
        <div className="h-1 bg-gradient-to-r from-board-green via-earth-400 to-ocean-500" />
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌍</span>
            <h1 className="text-xl font-black text-board-text tracking-tight">Map Qwest</h1>
          </div>
          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <span>🔥</span>
              <span className="font-black text-board-text">{STREAK}</span>
              <span className="text-board-muted text-xs font-bold uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-board-green">{RATING}</span>
              <span className="text-board-muted text-xs font-bold uppercase tracking-wider">Rating</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="md:hidden flex items-center justify-around bg-board-card border-b border-board-border py-3 px-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-board-text font-black text-lg leading-tight">{STREAK}</p>
            <p className="text-board-muted text-[10px] font-bold uppercase tracking-wider">Streak</p>
          </div>
        </div>
        <div className="w-px h-8 bg-board-border" />
        <div className="flex items-center gap-2">
          <div>
            <p className="text-board-green font-black text-lg leading-tight">{RATING}</p>
            <p className="text-board-muted text-[10px] font-bold uppercase tracking-wider">Rating</p>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">

        {/* ── QUIZZES ─────────────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Quizzes</SectionLabel>
          <div className="space-y-2.5">
            {QUIZZES.map((mode, i) =>
              mode.available ? (
                <AvailableCard
                  key={mode.id}
                  icon={mode.icon}
                  title={mode.title}
                  description={mode.description}
                  href={mode.href}
                  accent={mode.accent}
                  index={i}
                />
              ) : (
                <LockedCard key={mode.id} icon={mode.icon} title={mode.title} index={i} />
              ),
            )}
          </div>
        </section>

        {/* ── LEARNING ────────────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Learning</SectionLabel>
          <div className="space-y-2.5">
            {LEARNING.map((item, i) => (
              <LockedCard key={item.id} icon={item.icon} title={item.title} index={QUIZZES.length + i} />
            ))}
          </div>
        </section>

        {/* ── PROFILE & SETTINGS ──────────────────────────────────────────── */}
        <section>
          <SectionLabel>Profile &amp; Settings</SectionLabel>
          <motion.div
            custom={QUIZZES.length + LEARNING.length}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-board-card border border-board-border rounded-2xl overflow-hidden"
          >
            {/* Profile summary */}
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-board-green/15 flex items-center justify-center text-2xl shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-board-text text-base">Guest Player</p>
                <p className="text-board-muted text-sm">Sign in to save your progress</p>
              </div>
              <div className="w-8 h-8 bg-board-border/40 rounded-xl flex items-center justify-center shrink-0 opacity-40">
                <svg className="w-4 h-4 text-board-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Stats row */}
            <div className="border-t border-board-border grid grid-cols-3 divide-x divide-board-border">
              {[
                { label: 'Streak', value: STREAK, suffix: '🔥' },
                { label: 'Rating', value: RATING, suffix: '' },
                { label: 'Games', value: 0, suffix: '' },
              ].map((stat) => (
                <div key={stat.label} className="py-3 text-center">
                  <p className="text-board-text font-black text-lg leading-tight">
                    {stat.value}{stat.suffix}
                  </p>
                  <p className="text-board-muted text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Theme toggle row */}
            <div className="border-t border-board-border px-4 py-3 flex items-center justify-between">
              <span className="text-board-text text-sm font-bold">Theme</span>
              <div className="flex gap-1.5">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      theme === opt.value
                        ? 'bg-board-green text-white border-board-green-dark'
                        : 'bg-board-bg text-board-muted border-board-border hover:bg-board-hover hover:text-board-text'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Settings row */}
            <div className="border-t border-board-border divide-y divide-board-border opacity-40 cursor-not-allowed">
              {['Account & Sign In', 'Notifications', 'App Settings'].map((label) => (
                <div key={label} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-board-text text-sm font-bold">{label}</span>
                  <svg className="w-4 h-4 text-board-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="h-4" /> {/* bottom breathing room */}
      </main>
    </div>
  );
}
