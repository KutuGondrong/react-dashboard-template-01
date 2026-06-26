import { useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';

export default function NotFoundPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-[min(24rem,50vh)] flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-6xl font-bold tabular-nums text-primary-600 dark:text-primary-400">404</p>
      <Typography.Title level={2} className="mt-4">
        {t('errors.notFound.title')}
      </Typography.Title>
      <Typography.Text color="muted" className="mx-auto mt-2 max-w-md">
        {t('errors.notFound.description')}
      </Typography.Text>
      <Typography.Text color="muted" className="mt-3 font-mono text-xs">
        {t('errors.notFound.pathHint', { path: pathname })}
      </Typography.Text>
      <Button className="mt-8" onClick={() => navigate('/dashboard')}>
        {t('errors.notFound.backToDashboard')}
      </Button>
    </div>
  );
}
