import { assetUrl } from '@/config/basePath';

export const appConfig = {
  title: 'Teristimewa Dashboard',
  description: {
    en: 'Admin dashboard for daily operations',
    id: 'Dashboard admin untuk operasional harian',
  },
  logo: {
    light: assetUrl('logo-light.svg'),
    dark: assetUrl('logo-dark.svg'),
  },
  defaultLocale: 'en' as const,
  supportedLocales: ['en', 'id'] as const,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  tokenKey: 'auth_token',
  userKey: 'auth_user',
  themeKey: 'app_theme',
  localeKey: 'app_locale',
  toastPositionKey: 'app_toast_position',
  maxFileSizeMb: 10,
  paginationDefaultPageSize: 10,
  /** true = creator repo with full Tutorial & Storybook. false = template / generated app (landing pages + external links). */
  isBoilerplate: false,
  /** Creator only: allow Tutorial & Components in production build (make build-creator). Template sets false. */
  enableDevFeaturesInProduction: false,
} as const;

export type SupportedLocale = (typeof appConfig.supportedLocales)[number];

export function getAppDescription(locale: SupportedLocale): string {
  return appConfig.description[locale];
}
