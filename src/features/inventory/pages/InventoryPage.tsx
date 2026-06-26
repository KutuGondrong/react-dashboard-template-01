import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';
import { InventoryTable } from '@/features/inventory/components/InventoryTable';

export default function InventoryPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.inventory')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('inventory.subtitle')}
        </Typography.Text>
      </div>

      <InventoryTable />
    </div>
  );
}
