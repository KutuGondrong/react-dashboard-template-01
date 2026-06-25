import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ToastProvider } from '@/components/Toast';
import { ModalProvider } from '@/components/Modal';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { appRouter } from '@/router/AppRouter';

export function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ThemeProvider>
          <ToastProvider>
            <ModalProvider>
              <RouterProvider router={appRouter} future={{ v7_startTransition: true }} />
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
