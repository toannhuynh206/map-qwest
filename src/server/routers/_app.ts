import { router } from '@/server/trpc';

export const appRouter = router({
  // Routers will be added as we build each phase
  // Phase 1: auth
  // Phase 3: quiz
  // Phase 4: stats
  // Phase 6: leaderboard
  // Phase 8: puzzle
});

export type AppRouter = typeof appRouter;
