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

function LazyPage({
  children,
  fallbackClassName = 'w-full',
}: {
  children: ReactNode;
  fallbackClassName?: string;
}) {
  return (
    <Suspense fallback={<SkeletonLoader className={fallbackClassName} />}>{children}</Suspense>
  );
}

export const devLandingRoutes: RouteObject[] = [
  ...(StorybookLandingPage
    ? [
        {
          path: 'components',
          element: (
            <LazyPage fallbackClassName="mx-auto w-full max-w-2xl">
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
            <LazyPage fallbackClassName="mx-auto w-full min-w-0 max-w-2xl">
              <TutorialLandingPage />
            </LazyPage>
          ),
        },
      ]
    : []),
];
