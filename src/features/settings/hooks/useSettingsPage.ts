import { useCallback, useMemo } from 'react';
import type { SupportedLocale } from '@/config/app.config';
import type { SelectOption, ThemeMode } from '@/models/model.type';

export function useSettingsPage(
  t: (key: string) => string,
  setLocale: (locale: SupportedLocale) => void,
  setMode: (mode: ThemeMode) => void,
) {
  const localeOptions: SelectOption[] = useMemo(
    () => [
      { value: 'en', label: 'English' },
      { value: 'id', label: 'Bahasa Indonesia' },
    ],
    [],
  );

  const themeOptions: SelectOption[] = useMemo(
    () => [
      { value: 'light', label: t('components.common.lightMode') },
      { value: 'dark', label: t('components.common.darkMode') },
      { value: 'system', label: t('components.common.systemMode') },
    ],
    [t],
  );

  const onLocaleChange = useCallback(
    (option: SelectOption) => {
      setLocale(option.value as SupportedLocale);
    },
    [setLocale],
  );

  const onThemeChange = useCallback(
    (option: SelectOption) => {
      setMode(option.value as ThemeMode);
    },
    [setMode],
  );

  return {
    localeOptions,
    themeOptions,
    onLocaleChange,
    onThemeChange,
  };
}
