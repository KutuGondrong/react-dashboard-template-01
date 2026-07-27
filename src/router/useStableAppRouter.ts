import { useMemo } from 'react';
import { createAppRouter } from '@/router/AppRouter';

export function useStableAppRouter() {
  const router = useMemo(() => createAppRouter(), []);

  return { router };
}
