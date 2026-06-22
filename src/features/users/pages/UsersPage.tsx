import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';
import { UsersTable } from '@/features/users/components/UsersTable';

export default function UsersPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.users')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('users.subtitle')}
        </Typography.Text>
      </div>

      <UsersTable />
    </div>
  );
}
