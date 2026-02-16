import { createTRPCRouter } from '../init';
import { usersRouter } from '@/features/users/server/router';

export const appRouter = createTRPCRouter({
  users: usersRouter
});

export type AppRouter = typeof appRouter;