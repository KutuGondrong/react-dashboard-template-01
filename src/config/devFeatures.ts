import { appConfig } from '@/config/app.config';

export const isDevFeaturesEnabled =
  import.meta.env.VITE_SHOW_DEV_FEATURES === 'true' &&
  (import.meta.env.MODE !== 'production' || appConfig.enableDevFeaturesInProduction);
