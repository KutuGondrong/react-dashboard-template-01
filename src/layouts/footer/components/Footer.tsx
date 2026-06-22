import { useLocale } from '@/context/LocaleContext';

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <div className="flex w-full flex-col items-center justify-between gap-1 text-xs text-gray-500 sm:flex-row sm:gap-2 sm:text-sm dark:text-gray-400">
      <p className="truncate">{t('footer.copyright', { year })}</p>
      <p className="shrink-0">{t('footer.version', { version: '1.0.0' })}</p>
    </div>
  );
}
