import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------
// TanStack Query client – sensible defaults for an MVP.
//   staleTime  : 5 min  – avoid re-fetching on every mount
//   gcTime     : 10 min – keep cache around a bit longer
//   retry      : 1      – single retry before surfacing error
//   refetchOnWindowFocus : false – less noise during development
// ---------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
