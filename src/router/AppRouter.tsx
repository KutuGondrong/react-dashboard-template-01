import { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { routerBasename } from '@/config/basePath';
import { MainLayout, AuthLayout } from '@/layouts';
import { ProtectedRoute, PublicRoute } from '@/router/RouteGuards';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { AuthShell } from '@/router/AuthShell';
import { devLandingRoutes } from '@/router/devLandingRoutes';
import { featureRoutes } from '@/router/featureRoutes';
import { featureRoutesGenerate } from '@/router/featureRoutesGenerate';
import { lazyWithRetry } from '@/router/lazyWithRetry';
import { RouteErrorFallback } from '@/router/RouteErrorFallback';

const LoginPage = lazyWithRetry(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('@/features/auth/pages/RegisterPage'));
const SettingsPage = lazyWithRetry(() => import('@/features/settings/pages/SettingsPage'));
const NotFoundPage = lazyWithRetry(() => import('@/features/errors/pages/NotFoundPage'));

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>;
}

const protectedChildren = [
  {
    index: true,
    element: <Navigate to="/dashboard" replace />,
  },
  ...featureRoutes,
  ...featureRoutesGenerate,
  ...devLandingRoutes,
  {
    path: 'settings',
    element: (
      <LazyPage>
        <SettingsPage />
      </LazyPage>
    ),
  },
  {
    path: '*',
    element: (
      <LazyPage>
        <NotFoundPage />
      </LazyPage>
    ),
  },
];

export function createAppRouter() {
  return createBrowserRouter(
  [
    {
      element: <AuthShell />,
      errorElement: <RouteErrorFallback />,
      children: [
        {
          path: '/',
          element: (
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          ),
          children: protectedChildren,
        },
        {
          path: '/',
          element: (
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          ),
          children: [
            {
              path: 'login',
              element: (
                <LazyPage>
                  <LoginPage />
                </LazyPage>
              ),
            },
            {
              path: 'register',
              element: (
                <LazyPage>
                  <RegisterPage />
                </LazyPage>
              ),
            },
          ],
        },
        {
          path: '*',
          element: (
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          ),
          children: [
            {
              path: '*',
              element: (
                <LazyPage>
                  <NotFoundPage />
                </LazyPage>
              ),
            },
          ],
        },
      ],
    },
  ],
  { basename: routerBasename },
  );
}
