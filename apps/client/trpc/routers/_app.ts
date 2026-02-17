import { messagesRouter } from '@/features/forum/server/router';
import { createTRPCRouter } from '../init';
import { usersRouter } from '@/features/users/server/router';

export const appRouter = createTRPCRouter({
  users: usersRouter,
  messages: messagesRouter
});

export type AppRouter = typeof appRouter;