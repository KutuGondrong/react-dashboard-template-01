import { Suspense, type ReactNode } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import { lazyWithRetry } from '@/router/lazyWithRetry';

function FeatureLazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>;
}

const UsersPage = lazyWithRetry(() => import('@/features/users/pages/UsersPage'));

export const featureRoutes = [
  {
    path: 'dashboard',
    element: <DashboardPage />,
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
