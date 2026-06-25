import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/context/LocaleContext';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const MENU_ITEM_HEIGHT = 36;
const MENU_PADDING = 8;

interface PageSizeSelectProps {
  value: number;
  options: number[];
  onChange: (size: number) => void;
  label: string;
  shortLabel: string;
}

function PageSizeSelect({ value, options, onChange, label, shortLabel }: PageSizeSelectProps) {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const close = useCallback(() => setIsOpen(false), []);

  const updateMenuPosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuHeight = options.length * MENU_ITEM_HEIGHT + MENU_PADDING;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setOpenUpward(shouldOpenUp);
    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      minWidth: rect.width,
      zIndex: 50,
      ...(shouldOpenUp ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
  }, [options.length]);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      close();
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, close, updateMenuPosition]);

  const handleToggle = () => {
    if (isOpen) {
      close();
      return;
    }
    updateMenuPosition();
    setIsOpen(true);
  };

  const menu = isOpen
    ? createPortal(
        <ul
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={t('components.common.pageSize')}
          style={menuStyle}
          className={`overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
            openUpward ? 'origin-bottom' : 'origin-top'
          }`}
        >
          {options.map((size) => (
            <li
              key={size}
              role="option"
              aria-selected={size === value}
              onClick={() => {
                onChange(size);
                close();
              }}
              className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                size === value
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {size}
            </li>
          ))}
        </ul>,
        document.body,
      )
    : null;

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{shortLabel}</span>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={t('components.common.pageSize')}
        onClick={handleToggle}
        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        {value}
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {menu}
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = '',
}: PaginationProps) {
  const { t } = useLocale();

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 0) return null;

  return (
    <div className={`w-full min-w-0 overflow-x-auto ${className}`}>
      <div className="flex w-max min-w-full flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-600 sm:justify-start dark:text-gray-400">
          {onPageSizeChange && (
            <PageSizeSelect
              value={pageSize}
              options={pageSizeOptions}
              onChange={onPageSizeChange}
              label={t('components.common.rowsPerPage')}
              shortLabel={t('components.common.rowsPerPageShort')}
            />
          )}
          <span className="whitespace-nowrap">
            <span className="hidden sm:inline">
              {t('components.common.pageOf', { current: currentPage, total: totalPages })} (
              {t('components.common.itemCount', { count: totalItems })})
            </span>
            <span className="sm:hidden">
              {t('components.common.pageOfShort', { current: currentPage, total: totalPages })} ·{' '}
              {t('components.common.itemCountShort', { count: totalItems })}
            </span>
          </span>
        </div>

        <nav
          aria-label={t('components.common.pagination')}
          className="flex shrink-0 flex-nowrap items-center gap-1"
        >
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label={t('components.common.previous')}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <span className="hidden sm:inline">{t('components.common.previous')}</span>
            <svg
              className="h-4 w-4 sm:hidden"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {getPageNumbers().map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-gray-400 sm:px-2">
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                className={`rounded-lg px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                  page === currentPage
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label={t('components.common.next')}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <span className="hidden sm:inline">{t('components.common.next')}</span>
            <svg
              className="h-4 w-4 sm:hidden"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
}
