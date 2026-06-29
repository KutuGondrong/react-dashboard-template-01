/**
 * Publisher landing routes — links to external Tutorial & Components docs.
 *
 * Shown when VITE_SHOW_DEV_FEATURES=true (see src/config/devFeatures.ts).
 *
 * To hide completely:
 * 1. Remove `...devLandingRoutes` from AppRouter.tsx protectedChildren
 * 2. Remove matching items from useSidebar.tsx (search "isDev")
 * 3. Set VITE_SHOW_DEV_FEATURES=false in .env / .env.development
 */
import { Suspense, type ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { isDevFeaturesEnabled } from '@/config/devFeatures';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { lazyWithRetry } from '@/router/lazyWithRetry';

const TutorialLandingPage = isDevFeaturesEnabled
  ? lazyWithRetry(() => import('@/features/tutorial/pages/TutorialLandingPage'))
  : null;

const StorybookLandingPage = isDevFeaturesEnabled
  ? lazyWithRetry(() => import('@/features/storybook/pages/StorybookLandingPage'))
  : null;

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>;
}

export const devLandingRoutes: RouteObject[] = [
  ...(StorybookLandingPage
    ? [
        {
          path: 'components',
          element: (
            <LazyPage>
              <StorybookLandingPage />
            </LazyPage>
          ),
        },
      ]
    : []),
  ...(TutorialLandingPage
    ? [
        {
          path: 'documentation',
          element: (
            <LazyPage>
              <TutorialLandingPage />
            </LazyPage>
          ),
        },
      ]
    : []),
];
