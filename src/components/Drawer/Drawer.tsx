import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/context/LocaleContext';

export type DrawerPlacement = 'left' | 'right';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  closeOnBackdropClick?: boolean;
  hideCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  id?: string;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: 'w-72 max-w-[85vw]',
  md: 'w-96 max-w-[90vw]',
  lg: 'w-[28rem] max-w-[92vw]',
  xl: 'w-[32rem] max-w-[95vw]',
};

const placementPanelClasses: Record<DrawerPlacement, string> = {
  left: 'left-0 animate-drawer-enter-left',
  right: 'right-0 animate-drawer-enter-right',
};

function CloseIconButton({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:focus:ring-offset-gray-900"
      aria-label={label}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  placement = 'right',
  size = 'md',
  closeOnBackdropClick = true,
  hideCloseButton = false,
  className = '',
  contentClassName = '',
  id,
}: DrawerProps) {
  const { t } = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      panelRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showHeader = Boolean(title || description) || !hideCloseButton;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 animate-drawer-backdrop bg-black/50 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        aria-describedby={description ? 'drawer-description' : undefined}
        tabIndex={-1}
        className={`fixed inset-y-0 flex flex-col border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 ${sizeClasses[size]} ${placementPanelClasses[placement]} ${placement === 'left' ? 'border-r' : 'border-l'} ${className}`}
      >
        {showHeader && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id="drawer-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="drawer-description"
                  className={`text-sm text-gray-500 dark:text-gray-400 ${title ? 'mt-1' : ''}`}
                >
                  {description}
                </p>
              )}
            </div>
            {!hideCloseButton && (
              <CloseIconButton onClose={onClose} label={t('components.common.close')} />
            )}
          </div>
        )}

        <div className={`flex-1 overflow-y-auto px-6 py-5 ${contentClassName}`.trim()}>
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
