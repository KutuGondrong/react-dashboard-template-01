import { createContext, type Context } from 'react';
import type { SupportedLocale } from '@/config/app.config';
import type { LocaleParams } from '@/locales/localeUtils';

export interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: LocaleParams) => string;
}

function createLocaleContextInstance(): Context<LocaleContextValue | null> {
  return createContext<LocaleContextValue | null>(null);
}

export const LocaleContext: Context<LocaleContextValue | null> =
  import.meta.hot?.data?.LocaleContext ?? createLocaleContextInstance();

if (import.meta.hot) {
  import.meta.hot.data.LocaleContext = LocaleContext;
}
