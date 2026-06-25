import { useState, type ReactNode } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn } from '@/models/model.type';
import { resolveTableColumnCell } from './tableColumnUtils';
import { DataTableStatusIcon } from './DataTableStatusIcon';
import type { DataTableStatusIconVariant } from './DataTableStatusIcon';

type SortDirection = 'asc' | 'desc';

export type RowSelectionMode = 'checkbox' | 'radio';

export type { DataTableStatusIconVariant } from './DataTableStatusIcon';

export interface DataTableStatusContent {
  label?: string;
  desc?: string;
  icon?: ReactNode;
  /** When true, shows the error icon preset and common load-error copy as defaults. */
  error?: boolean;
  /** @deprecated Use `error` instead */
  iconVariant?: DataTableStatusIconVariant;
}

/** @deprecated Use {@link DataTableStatusContent} */
export type DataTableEmptyState = DataTableStatusContent;

export interface DataTableSelectionContext<T extends { id: string }> {
  selectedIds: string[];
  selectedItems: T[];
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  /** @deprecated Use rowSelection="checkbox" instead */
  selectable?: boolean;
  /** Skip the outer card wrapper — use inside {@link DataTableGroup} with {@link Pagination}. */
  unwrapped?: boolean;
  rowSelection?: RowSelectionMode;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  renderSelectionActions?: (context: DataTableSelectionContext<T>) => ReactNode;
  onSort?: (key: string, direction: SortDirection) => void;
  statusContent?: DataTableStatusContent;
  /** @deprecated Use `statusContent` instead */
  empty?: DataTableStatusContent;
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
  unwrapped = false,
  rowSelection,
  selectedIds = [],
  onSelectionChange,
  renderSelectionActions,
  onSort,
  statusContent,
  empty,
  className = '',
}: DataTableProps<T>) {
  const resolvedStatusContent = statusContent ?? empty;
  const { t } = useLocale();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const selectionMode = rowSelection ?? (selectable ? 'checkbox' : undefined);
  const hasRowSelection = Boolean(selectionMode && onSelectionChange);

  const totalCols = columns.length + (hasRowSelection ? 1 : 0);

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

  const getCellValue = (item: T, column: TableColumn<T>): ReactNode =>
    resolveTableColumnCell(item, column);

  const isEmpty = !isLoading && data.length === 0;
  const isErrorState =
    resolvedStatusContent?.error === true || resolvedStatusContent?.iconVariant === 'error';
  const selectedItems = data.filter((item) => selectedIds.includes(item.id));
  const showSelectionBar = hasRowSelection && selectedIds.length > 0;

  const headerCellClass = 'bg-inherit px-4 py-3';

  const table = (
    <table className="w-full min-w-max border-collapse text-left text-sm">
      <thead className="sticky top-0 z-20 bg-gray-50 shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] dark:bg-gray-900 dark:shadow-[0_1px_3px_0_rgb(0_0_0/0.25)]">
        <tr className="border-b border-gray-200 dark:border-gray-700">
          {hasRowSelection && (
            <th className={`${headerCellClass} w-10`}>
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
                <span className="sr-only">{t('components.common.selectRow')}</span>
              )}
            </th>
          )}
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className={`${headerCellClass} font-medium text-gray-600 dark:text-gray-400 ${column.className ?? ''}`}
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
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={totalCols} />)
        ) : isEmpty ? (
          <tr>
            <td colSpan={totalCols} className="px-4 py-16">
              <div className="flex flex-col items-center justify-center text-center">
                {resolvedStatusContent?.icon ?? (
                  <DataTableStatusIcon variant={isErrorState ? 'error' : 'default'} />
                )}
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {resolvedStatusContent?.label ??
                    (isErrorState
                      ? t('components.common.loadError')
                      : t('components.common.noData'))}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {resolvedStatusContent?.desc ??
                    (isErrorState
                      ? t('components.common.loadErrorDescription')
                      : t('components.common.noDataDescription'))}
                </p>
              </div>
            </td>
          </tr>
        ) : (
          data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              {hasRowSelection && (
                <td className="px-4 py-3">
                  <input
                    type={selectionMode === 'radio' ? 'radio' : 'checkbox'}
                    name={selectionMode === 'radio' ? 'datatable-row-selection' : undefined}
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelectRow(item.id)}
                    aria-label={t('components.common.selectRowItem', { id: item.id })}
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
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  const content = (
    <>
      {showSelectionBar && (
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-primary-50 px-4 py-2 dark:border-gray-700 dark:bg-primary-900/20">
          <span className="text-sm text-primary-700 dark:text-primary-300">
            {t('components.common.selectedCount', { count: selectedIds.length })}
          </span>
          {renderSelectionActions && (
            <div className="flex shrink-0 items-center gap-2">
              {renderSelectionActions({ selectedIds, selectedItems })}
            </div>
          )}
        </div>
      )}

      {unwrapped ? table : <div className="overflow-x-auto">{table}</div>}
    </>
  );

  if (unwrapped) {
    return <>{content}</>;
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {content}
    </div>
  );
}
