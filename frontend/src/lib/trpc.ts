import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/routers/index'; // Type hint only in dev
import superjson from 'superjson';

const base =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  'http://localhost:4000';

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${base}/trpc`,
      fetch: (input, init) => fetch(input, { ...init }),
    }),
  ],
});
