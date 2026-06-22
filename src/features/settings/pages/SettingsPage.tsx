import type { ReactNode } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';
import type { SupportedLocale } from '@/config/app.config';
import type { SelectOption, ThemeMode } from '@/models/model.type';
import { ComboBox } from '@/components/ComboBox';

const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  en: '🇬🇧',
  id: '🇮🇩',
};

function OptionWithLeadingIcon({ leading, label }: { leading: ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center text-base"
        aria-hidden="true"
      >
        {leading}
      </span>
      <span>{label}</span>
    </span>
  );
}

function SunIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

const THEME_ICONS: Record<ThemeMode, ReactNode> = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <SystemIcon />,
};

function renderLocaleOption(option: SelectOption) {
  return (
    <OptionWithLeadingIcon
      leading={LOCALE_FLAGS[option.value as SupportedLocale]}
      label={option.label}
    />
  );
}

function renderThemeOption(option: SelectOption) {
  return (
    <OptionWithLeadingIcon
      leading={THEME_ICONS[option.value as ThemeMode]}
      label={option.label}
    />
  );
}

export default function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const { mode, setMode } = useTheme();

  const localeOptions: SelectOption[] = [
    { value: 'en', label: 'English' },
    { value: 'id', label: 'Bahasa Indonesia' },
  ];

  const themeOptions: SelectOption[] = [
    { value: 'light', label: t('components.common.lightMode') },
    { value: 'dark', label: t('components.common.darkMode') },
    { value: 'system', label: t('components.common.systemMode') },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('components.common.settings')}
        </h1>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <ComboBox
          label={t('components.common.language')}
          options={localeOptions}
          value={locale}
          onChange={(option) => setLocale(option.value as SupportedLocale)}
          searchable={false}
          renderLabel={renderLocaleOption}
          renderSelectedLabel={renderLocaleOption}
        />

        <ComboBox
          label={t('components.common.theme')}
          options={themeOptions}
          value={mode}
          onChange={(option) => setMode(option.value as ThemeMode)}
          searchable={false}
          renderLabel={renderThemeOption}
          renderSelectedLabel={renderThemeOption}
        />
      </div>
    </div>
  );
}
