import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn } from '@/models/model.type';
import type { OrdersItem } from '@/features/orders/hooks/useOrdersPage';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { useOrdersPage } from '@/features/orders/hooks/useOrdersPage';

export function OrdersTable() {
  const { t } = useLocale();
  const { items, isLoading, page, setPage, pageSize, totalPages, totalItems, onPageSizeChange } =
    useOrdersPage();

  const columns = useMemo<TableColumn<OrdersItem>[]>(
    () => [
      {
        key: 'name',
        header: t('common.name'),
        sortable: true,
      },
      {
        key: 'isActive',
        header: t('common.status'),
        render: (item) => (
          <Badge variant={item.isActive ? 'success' : 'danger'} dot>
            {item.isActive ? t('common.active') : t('common.inactive')}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={items}
      columns={columns}
      isLoading={isLoading}
      currentPage={page}
      totalPages={totalPages}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={setPage}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
