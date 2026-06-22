import { LocaleToggle } from '@/layouts/header/components/LocaleToggle';
import { ThemeToggleButton } from '@/layouts/header/components/ThemeToggleButton';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';

export function AuthLayoutToolbar() {
  const { t, locale, setLocale } = useLocale();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 sm:right-6 sm:top-6">
      <LocaleToggle locale={locale} onChange={setLocale} />
      <ThemeToggleButton
        isDark={resolvedTheme === 'dark'}
        label={
          resolvedTheme === 'dark'
            ? t('components.common.lightMode')
            : t('components.common.darkMode')
        }
        onToggle={toggleTheme}
      />
    </div>
  );
}
