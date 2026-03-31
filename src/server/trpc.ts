import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

export const createTRPCContext = async () => {
  return {
    // db and user will be added in Phase 1
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
