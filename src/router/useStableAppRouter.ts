import { useMemo } from 'react';
import { createAppRouter } from '@/router/AppRouter';

/** Production / stable path: one router instance per page load. */
export function useStableAppRouter() {
  const router = useMemo(() => createAppRouter(), []);

  return { router };
}
