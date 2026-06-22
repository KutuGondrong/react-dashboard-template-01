import { appConfig, getAppDescription } from '@/config/app.config';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';

export function AuthBrand() {
  const { locale } = useLocale();
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === 'dark' ? appConfig.logo.dark : appConfig.logo.light;
  const description = getAppDescription(locale);

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
        <img
          src={logoSrc}
          alt={appConfig.title}
          className="h-9 w-9 object-contain"
          width={36}
          height={36}
        />
      </div>
      <div className="min-w-0 text-left">
        <h2 className="text-lg font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
          {appConfig.title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
