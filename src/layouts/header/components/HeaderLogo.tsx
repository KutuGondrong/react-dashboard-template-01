import { Link } from 'react-router-dom';
import { appConfig, getAppDescription } from '@/config/app.config';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';

export function HeaderLogo() {
  const { locale } = useLocale();
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === 'dark' ? appConfig.logo.dark : appConfig.logo.light;
  const description = getAppDescription(locale);

  return (
    <Link
      to="/dashboard"
      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 lg:flex-none lg:gap-2.5 dark:focus-visible:ring-offset-gray-900"
    >
      <img
        src={logoSrc}
        alt={appConfig.title}
        className="h-7 w-7 shrink-0 rounded-lg object-contain lg:h-7 lg:w-7"
        width={28}
        height={28}
      />
      <div className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-semibold text-gray-900 lg:text-base dark:text-white">
          {appConfig.title}
        </span>
        {description ? (
          <span className="hidden truncate text-xs text-gray-500 lg:block dark:text-gray-400">
            {description}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
