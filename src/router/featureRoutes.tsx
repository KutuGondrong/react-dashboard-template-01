/**
 * Manual feature routes — edit this file when adding routes by hand.
 * Scaffolded features use `make feature` (updates featureRoutesGenerate.tsx).
 * Spread into protectedChildren in AppRouter.tsx.
 */
import { Suspense, type ReactNode } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { lazyWithRetry } from '@/router/lazyWithRetry';

function FeatureLazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>;
}

const DashboardPage = lazyWithRetry(() => import('@/features/dashboard/pages/DashboardPage'));
const UsersPage = lazyWithRetry(() => import('@/features/users/pages/UsersPage'));

export const featureRoutes = [
  {
    path: 'dashboard',
    element: (
      <FeatureLazyPage>
        <DashboardPage />
      </FeatureLazyPage>
    ),
  },
  {
    path: 'users',
    element: (
      <FeatureLazyPage>
        <UsersPage />
      </FeatureLazyPage>
    ),
  },
];
