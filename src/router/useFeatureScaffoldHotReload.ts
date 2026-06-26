import { useMemo, useSyncExternalStore } from 'react';
import { createAppRouter } from '@/router/AppRouter';

type RevisionListener = () => void;

let routerRevision = 0;
const routerListeners = new Set<RevisionListener>();

function subscribeRouter(listener: RevisionListener) {
  routerListeners.add(listener);
  return () => routerListeners.delete(listener);
}

let routerBumpQueued = false;

function bumpRouterRevision() {
  if (routerBumpQueued) return;
  routerBumpQueued = true;
  queueMicrotask(() => {
    routerBumpQueued = false;
    routerRevision += 1;
    routerListeners.forEach((listener) => listener());
  });
}

if (import.meta.hot) {
  import.meta.hot.accept('@/router/AppRouter', (mod) => {
    if (mod?.createAppRouter) {
      bumpRouterRevision();
    }
  });
  // Only remount the router when generated routes change (`make feature`).
  // Menu items, locale files, and feature pages hot-reload on their own.
  import.meta.hot.accept('@/router/featureRoutes.generated', bumpRouterRevision);
}

/**
 * Dev-only: recreates router when `make feature` updates generated routes.
 * Imported from App.development.tsx only — not used in production builds.
 */
export function useFeatureScaffoldHotReload(): {
  router: ReturnType<typeof createAppRouter>;
  routerKey: number;
} {
  const routerRevisionSnapshot = useSyncExternalStore(
    subscribeRouter,
    () => routerRevision,
    () => routerRevision,
  );

  // routerRevisionSnapshot is an intentional HMR trigger, not used inside the factory.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recreate router when scaffold files change
  const router = useMemo(() => createAppRouter(), [routerRevisionSnapshot]);

  return {
    router,
    routerKey: routerRevisionSnapshot,
  };
}
