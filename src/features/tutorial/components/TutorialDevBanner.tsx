import { appConfig } from '@/config/app.config';
import { DevFeatureBanner } from '@/components/DevFeatureBanner';
import { useTutorialLocale } from '@/features/tutorial/hooks/useTutorialLocale';

export function TutorialDevBanner() {
  const { t } = useTutorialLocale();

  const title = appConfig.isBoilerplate ? t('creatorBannerTitle') : t('devBannerTitle');
  const description = appConfig.isBoilerplate
    ? t('creatorBannerDescription')
    : t('devBannerDescription');

  return <DevFeatureBanner title={title} description={description} />;
}
