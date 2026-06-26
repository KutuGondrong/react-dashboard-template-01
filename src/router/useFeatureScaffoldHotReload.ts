import { useMemo, useSyncExternalStore } from 'react';
import { createAppRouter } from '@/router/AppRouter';

type RevisionListener = () => void;

let routerRevision = 0;
let localeRevision = 0;
const routerListeners = new Set<RevisionListener>();
const localeListeners = new Set<RevisionListener>();

function subscribeRouter(listener: RevisionListener) {
  routerListeners.add(listener);
  return () => routerListeners.delete(listener);
}

function subscribeLocale(listener: RevisionListener) {
  localeListeners.add(listener);
  return () => localeListeners.delete(listener);
}

function bumpRouterRevision() {
  routerRevision += 1;
  routerListeners.forEach((listener) => listener());
}

function bumpLocaleRevision() {
  localeRevision += 1;
  localeListeners.forEach((listener) => listener());
}

if (import.meta.hot) {
  import.meta.hot.accept('@/router/AppRouter', (mod) => {
    if (mod?.createAppRouter) {
      bumpRouterRevision();
    }
  });
  import.meta.hot.accept('@/router/featureRoutes.generated', bumpRouterRevision);
  import.meta.hot.accept('@/layouts/sidebar/featureMenuItems.generated', bumpRouterRevision);

  import.meta.hot.accept('@/locales/messages.ts', bumpLocaleRevision);
  import.meta.hot.accept('@/locales/en.json', bumpLocaleRevision);
  import.meta.hot.accept('@/locales/id.json', bumpLocaleRevision);

  import.meta.hot.on('vite:afterUpdate', (payload) => {
    const scaffoldedFeatureChanged = payload.updates.some(({ path: filePath }) =>
      /\/src\/features\/[^/]+\/(pages|components|hooks|usecase)\//.test(filePath),
    );
    if (scaffoldedFeatureChanged) {
      bumpRouterRevision();
    }
  });
}

/**
 * Dev-only: recreates router and locale when `make feature` updates generated files.
 * Imported from App.development.tsx only — not used in production builds.
 */
export function useFeatureScaffoldHotReload(): {
  router: ReturnType<typeof createAppRouter>;
  localeKey: number;
  routerKey: number;
} {
  const routerRevisionSnapshot = useSyncExternalStore(
    subscribeRouter,
    () => routerRevision,
    () => routerRevision,
  );
  const localeRevisionSnapshot = useSyncExternalStore(
    subscribeLocale,
    () => localeRevision,
    () => localeRevision,
  );

  // routerRevisionSnapshot is an intentional HMR trigger, not used inside the factory.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recreate router when scaffold files change
  const router = useMemo(() => createAppRouter(), [routerRevisionSnapshot]);

  return {
    router,
    localeKey: localeRevisionSnapshot,
    routerKey: routerRevisionSnapshot,
  };
}
