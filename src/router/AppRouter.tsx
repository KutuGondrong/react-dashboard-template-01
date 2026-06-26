import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { routerBasename } from '@/config/basePath';
import { isDevFeaturesEnabled } from '@/config/devFeatures';
import { MainLayout, AuthLayout } from '@/layouts';
import { ProtectedRoute, PublicRoute } from '@/router/RouteGuards';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { AuthShell } from '@/router/AuthShell';
import { featureRoutes } from '@/router/featureRoutes';

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/features/errors/pages/NotFoundPage'));

const TutorialLandingPage = isDevFeaturesEnabled
  ? lazy(() => import('@/features/tutorial/pages/TutorialLandingPage'))
  : null;

const StorybookLandingPage = isDevFeaturesEnabled
  ? lazy(() => import('@/features/storybook/pages/StorybookLandingPage'))
  : null;

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>;
}

const componentsRoutes = StorybookLandingPage
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
  : [];

const documentationRoutes = TutorialLandingPage
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
  : [];

const protectedChildren = [
  {
    index: true,
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: 'dashboard',
    element: (
      <LazyPage>
        <DashboardPage />
      </LazyPage>
    ),
  },
  {
    path: 'users',
    element: (
      <LazyPage>
        <UsersPage />
      </LazyPage>
    ),
  },
  {
    path: 'settings',
    element: (
      <LazyPage>
        <SettingsPage />
      </LazyPage>
    ),
  },
  ...featureRoutes,
  ...documentationRoutes,
  ...componentsRoutes,
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
