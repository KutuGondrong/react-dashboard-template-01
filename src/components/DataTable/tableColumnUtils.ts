import type { ReactNode } from 'react';
import type { TableColumn } from '@/models/model.type';

export function getNestedValue(source: unknown, path: string): unknown {
  if (!path) return undefined;

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
}

export function getTableColumnRawValue<T>(item: T, column: TableColumn<T>): unknown {
  const path = String(column.key);
  if (path.includes('.')) return getNestedValue(item, path);
  return item[path as keyof T];
}

export function resolveTableColumnCell<T>(item: T, column: TableColumn<T>): ReactNode {
  if (column.render) return column.render(item);

  const raw = getTableColumnRawValue(item, column);
  if (raw === undefined || raw === null) return '';

  if (column.transform) return column.transform(raw, item);

  return String(raw);
}
