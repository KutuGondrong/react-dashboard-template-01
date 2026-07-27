import { externalLinksConfig } from '@/config/externalLinks';
import { Typography } from '@/components/Typography';
import { TutorialDevBanner } from '@/features/tutorial/components/TutorialDevBanner';
import { useTutorialLocale } from '@/features/tutorial/hooks/useTutorialLocale';

const TUTORIAL_LINK_CLASS =
  'font-medium text-primary-600 underline-offset-2 hover:underline dark:text-primary-400';

export default function TutorialLandingPage() {
  const { t } = useTutorialLocale();
  const docsUrl = externalLinksConfig.tutorialUrl;
  const repoUrl = externalLinksConfig.templateRepoUrl;

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-6 pb-10">
      <div className="space-y-3">
        <Typography.Title level={2} className="!text-2xl sm:!text-3xl">
          {t('landingTitle')}
        </Typography.Title>
        <Typography.Text color="muted">{t('landingSubtitle')}</Typography.Text>
      </div>

      <TutorialDevBanner />

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <Typography.Text>{t('landingDescription')}</Typography.Text>
        <Typography.Text color="muted" className="text-sm">
          {t('landingHint')}
        </Typography.Text>
        <Typography.Text color="muted" className="block text-xs">
          {t('landingRepoNote')}{' '}
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={TUTORIAL_LINK_CLASS}
          >
            {repoUrl}
          </a>
        </Typography.Text>
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {t('landingLinkLabel')}
          <span aria-hidden="true">↗</span>
        </a>
        <Typography.Text color="muted" className="block text-xs">
          {t('landingUrlNote', { url: docsUrl })}
        </Typography.Text>
      </div>
    </div>
  );
}
