import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { appConfig, type SupportedLocale } from '@/config/app.config';
import { appMessages } from '@/locales/messages';
import { localSource } from '@/datasource/local/localSource';
import { translateMessage, type LocaleParams } from '@/locales/localeUtils';
import { LocaleContext } from './localeContext';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(
    () => localSource.getLocale() ?? appConfig.defaultLocale,
  );

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localSource.setLocale(newLocale);
  }, []);

  const localeMessages = appMessages[locale];

  const t = useCallback(
    (key: string, params?: LocaleParams) =>
      translateMessage(localeMessages as Record<string, unknown>, key, params),
    [localeMessages],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
