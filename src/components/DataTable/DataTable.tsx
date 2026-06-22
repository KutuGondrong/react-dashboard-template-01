import { useState, type ReactNode } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn } from '@/models/model.type';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/Button';

type SortDirection = 'asc' | 'desc';

export type RowSelectionMode = 'checkbox' | 'radio';

export interface DataTableEmptyState {
  label?: string;
  desc?: string;
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  /** @deprecated Use rowSelection="checkbox" instead */
  selectable?: boolean;
  rowSelection?: RowSelectionMode;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  renderActions?: (item: T) => ReactNode;
  empty?: DataTableEmptyState;
  className?: string;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  selectable = false,
  rowSelection,
  selectedIds = [],
  onSelectionChange,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  onSort,
  renderActions,
  empty,
  className = '',
}: DataTableProps<T>) {
  const { t } = useLocale();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const selectionMode = rowSelection ?? (selectable ? 'checkbox' : undefined);
  const hasRowSelection = Boolean(selectionMode && onSelectionChange);

  const totalCols = columns.length + (hasRowSelection ? 1 : 0) + (renderActions ? 1 : 0);

  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const pageSelectedCount = data.filter((item) => selectedIds.includes(item.id)).length;

  const handleSelectAll = () => {
    if (!onSelectionChange || selectionMode !== 'checkbox') return;
    const pageIds = data.map((item) => item.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allPageSelected) {
      onSelectionChange(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedIds, ...pageIds])]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange || !selectionMode) return;

    if (selectionMode === 'radio') {
      onSelectionChange(selectedIds.includes(id) ? [] : [id]);
      return;
    }

    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getCellValue = (item: T, column: TableColumn<T>): ReactNode => {
    if (column.render) return column.render(item);
    const value = item[column.key as keyof T];
    return value !== undefined && value !== null ? String(value) : '';
  };

  const isEmpty = !isLoading && data.length === 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {hasRowSelection && selectedIds.length > 0 && (
        <div className="border-b border-gray-200 bg-primary-50 px-4 py-2 text-sm text-primary-700 dark:border-gray-700 dark:bg-primary-900/20 dark:text-primary-300">
          {t('table.selected', { count: selectedIds.length })}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
            <tr>
              {hasRowSelection && (
                <th className="w-10 px-4 py-3">
                  {selectionMode === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={!isEmpty && pageSelectedCount === data.length}
                      disabled={isEmpty}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate =
                            !isEmpty && pageSelectedCount > 0 && pageSelectedCount < data.length;
                        }
                      }}
                      onChange={handleSelectAll}
                      aria-label={t('components.common.selectAll')}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  ) : (
                    <span className="sr-only">{t('table.selectRow')}</span>
                  )}
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 font-medium text-gray-600 dark:text-gray-400 ${column.className ?? ''}`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(String(column.key))}
                      className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                    >
                      {column.header}
                      {sortKey === String(column.key) && (
                        <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {renderActions && (
                <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                  {t('components.common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={totalCols} />)
            ) : isEmpty ? (
              <tr>
                <td colSpan={totalCols} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <svg
                      className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {empty?.label ?? t('table.emptyTitle')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {empty?.desc ?? t('table.emptyDescription')}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {hasRowSelection && (
                    <td className="px-4 py-3">
                      <input
                        type={selectionMode === 'radio' ? 'radio' : 'checkbox'}
                        name={selectionMode === 'radio' ? 'datatable-row-selection' : undefined}
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        aria-label={t('table.selectRowItem', { id: item.id })}
                        className={
                          selectionMode === 'radio'
                            ? 'h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500'
                            : 'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                        }
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-4 py-3 text-gray-900 dark:text-gray-100 ${column.className ?? ''}`}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">{renderActions(item)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}

export function DataTableActionButton({
  onClick,
  children,
  variant = 'ghost',
}: {
  onClick: () => void;
  children: ReactNode;
  variant?: 'ghost' | 'danger';
}) {
  return (
    <Button variant={variant === 'danger' ? 'danger' : 'ghost'} size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}
