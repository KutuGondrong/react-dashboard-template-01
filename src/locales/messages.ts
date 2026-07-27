import type { SupportedLocale } from '@/config/app.config';
import componentsEn from '@/components/locales/en.json';
import componentsId from '@/components/locales/id.json';
import en from './en.json';
import id from './id.json';

export const appMessages = {
  en: { ...en, components: componentsEn },
  id: { ...id, components: componentsId },
} satisfies Record<SupportedLocale, Record<string, unknown>>;

export type AppLocaleMessages = (typeof appMessages)['en'];
