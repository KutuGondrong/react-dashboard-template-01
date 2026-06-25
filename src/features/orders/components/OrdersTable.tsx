import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn } from '@/models/model.type';
import type { OrdersItem } from '@/features/orders/hooks/useOrdersPage';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
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
        header: t('components.common.name'),
        sortable: true,
      },
      {
        key: 'isActive',
        header: t('components.common.status'),
        render: (item) => (
          <Badge variant={item.isActive ? 'success' : 'danger'} dot>
            {item.isActive ? t('components.common.active') : t('components.common.inactive')}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTableGroup>
      <DataTable unwrapped data={items} columns={columns} isLoading={isLoading} />
      <DataTableGroup.Footer>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={onPageSizeChange}
        />
      </DataTableGroup.Footer>
    </DataTableGroup>
  );
}
