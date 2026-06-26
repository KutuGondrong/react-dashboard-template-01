import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { useLocale } from '@/context/LocaleContext';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const { t } = useLocale();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-6xl font-bold tabular-nums text-primary-600 dark:text-primary-400">404</p>
      <Typography.Title level={2} align="center" className="mt-4">
        {t('errors.notFound.title')}
      </Typography.Title>
      <Typography.Text color="muted" align="center" className="mt-2 max-w-md">
        {t('errors.notFound.description')}
      </Typography.Text>
      {import.meta.env.DEV && (
        <Typography.Text color="muted" align="center" className="mt-3 max-w-md text-xs">
          {t('errors.notFound.descriptionDev')}
        </Typography.Text>
      )}
      <Button className="mt-8" onClick={() => navigate('/dashboard')}>
        {t('errors.notFound.backToDashboard')}
      </Button>
    </div>
  );
}
