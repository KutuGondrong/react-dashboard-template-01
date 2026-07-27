import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLocale } from '@/context/LocaleContext';
import { isChunkLoadError } from '@/router/lazyWithRetry';

export function RouteErrorFallback() {
  const error = useRouteError();
  const { t } = useLocale();

  const message =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? error.statusText
        : t('error.boundaryDescription');

  const isStaleChunk = isChunkLoadError(error);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900/50 dark:bg-gray-900">
        <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          {isStaleChunk ? t('error.chunkTitle') : t('error.boundaryTitle')}
        </h1>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {isStaleChunk ? t('error.chunkDescription') : t('error.boundaryDescription')}
        </p>
        {import.meta.env.DEV && (
          <pre className="mb-6 max-h-32 overflow-auto rounded-lg bg-gray-100 p-3 text-left text-xs text-red-600 dark:bg-gray-800 dark:text-red-400">
            {message}
          </pre>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {t('error.reloadPage')}
          </button>
          <Link
            to="/dashboard"
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900"
          >
            {t('error.goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
