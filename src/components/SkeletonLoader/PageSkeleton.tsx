import { useLocale } from '@/context/LocaleContext';

export function PageSkeleton({ className = '' }: { className?: string }) {
  const { t } = useLocale();

  return (
    <div className={`flex min-h-[60vh] items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('components.common.loading')}</p>
      </div>
    </div>
  );
}
