import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { appConfig, type SupportedLocale } from '@/config/app.config';
import { appMessages, type AppLocaleMessages } from '@/locales/messages';
import { localSource } from '@/datasource/local/localSource';
import { translateMessage, type LocaleParams } from '@/locales/localeUtils';

type LocaleMessages = AppLocaleMessages;

const messages: Record<SupportedLocale, LocaleMessages> = appMessages;

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: LocaleParams) => string;
}

function createLocaleContext() {
  return createContext<LocaleContextValue | null>(null);
}

const LocaleContext =
  import.meta.hot?.data?.LocaleContext ?? createLocaleContext();

if (import.meta.hot) {
  import.meta.hot.data.LocaleContext = LocaleContext;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(
    () => localSource.getLocale() ?? appConfig.defaultLocale,
  );

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localSource.setLocale(newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: LocaleParams) =>
      translateMessage(messages[locale] as Record<string, unknown>, key, params),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
