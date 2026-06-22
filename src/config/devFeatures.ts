import { appConfig } from '@/config/app.config';

/**
 * Tutorial & Components visibility (requires VITE_SHOW_DEV_FEATURES=true):
 * - Dev (make dev): landing pages + dev banner for creator and another user
 * - Creator prod (make build): .env.production=true + enableDevFeaturesInProduction=true
 * - Another user prod: .env.production=false + enableDevFeaturesInProduction=false
 */
export const isDevFeaturesEnabled =
  import.meta.env.VITE_SHOW_DEV_FEATURES === 'true' &&
  (import.meta.env.MODE !== 'production' || appConfig.enableDevFeaturesInProduction);
