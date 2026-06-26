import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn } from '@/models/model.type';
import type { InventoryItem } from '@/features/inventory/hooks/useInventoryPage';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';
import { useInventoryPage } from '@/features/inventory/hooks/useInventoryPage';

export function InventoryTable() {
  const { t } = useLocale();
  const { items, isLoading, page, setPage, pageSize, totalPages, totalItems, onPageSizeChange } =
    useInventoryPage();

  const columns = useMemo<TableColumn<InventoryItem>[]>(
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
