import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';
import { OrdersTable } from '@/features/orders/components/OrdersTable';

export default function OrdersPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.orders')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('orders.subtitle')}
        </Typography.Text>
      </div>

      <OrdersTable />
    </div>
  );
}
