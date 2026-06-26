import { RouterProvider } from 'react-router-dom';
import type { createAppRouter } from '@/router/AppRouter';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ToastProvider } from '@/components/Toast';
import { ModalProvider } from '@/components/Modal';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';

type AppRouter = ReturnType<typeof createAppRouter>;

interface AppShellProps {
  router: AppRouter;
  localeKey?: number;
  routerKey?: number;
}

export function AppShell({ router, localeKey, routerKey }: AppShellProps) {
  return (
    <ErrorBoundary>
      <LocaleProvider key={localeKey}>
        <ThemeProvider>
          <ToastProvider>
            <ModalProvider>
              <RouterProvider
                router={router}
                key={routerKey}
                future={{ v7_startTransition: true }}
              />
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
