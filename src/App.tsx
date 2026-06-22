import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ToastProvider } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { appRouter } from '@/router/AppRouter';

export function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ThemeProvider>
          <ToastProvider>
            <RouterProvider router={appRouter} />
          </ToastProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
