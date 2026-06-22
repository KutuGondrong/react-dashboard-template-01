import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useLocale } from '@/context/LocaleContext';
import { localSource } from '@/datasource/local/localSource';
import type { ToastMessage, ToastPosition } from '@/models/model.type';
import {
  DEFAULT_TOAST_POSITION,
  TOAST_POSITION_CLASSES,
  TOAST_POSITIONS,
} from '@/components/Toast/toastPositions';

interface ToastContextValue {
  toasts: ToastMessage[];
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const typeStyles: Record<ToastMessage['type'], { bg: string; icon: string }> = {
  success: {
    bg: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
  },
  error: {
    bg: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
  },
  warning: {
    bg: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/30',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    bg: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  processing: {
    bg: 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400',
  },
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const { t } = useLocale();
  const styles = typeStyles[toast.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${styles.bg}`}
    >
      <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
        {toast.type === 'success' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {toast.type === 'warning' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01"
            />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {toast.type === 'processing' && (
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label={t('components.common.dismiss')}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [position, setPositionState] = useState<ToastPosition>(
    () => localSource.getToastPosition() ?? DEFAULT_TOAST_POSITION,
  );

  const setPosition = useCallback((newPosition: ToastPosition) => {
    setPositionState(newPosition);
    localSource.setToastPosition(newPosition);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = generateId();
      const duration =
        toast.duration !== undefined ? toast.duration : toast.type === 'processing' ? 0 : 5000;

      setToasts((prev) => [...prev, { ...toast, id }]);

      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({ toasts, position, setPosition, showToast, dismissToast }),
    [toasts, position, setPosition, showToast, dismissToast],
  );

  const toastsByPosition = useMemo(() => {
    const grouped = new Map<ToastPosition, ToastMessage[]>();

    for (const pos of TOAST_POSITIONS) {
      grouped.set(pos, []);
    }

    for (const toast of toasts) {
      const toastPosition = toast.position ?? position;
      grouped.get(toastPosition)?.push(toast);
    }

    return grouped;
  }, [toasts, position]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {TOAST_POSITIONS.map((pos) => {
        const items = toastsByPosition.get(pos) ?? [];
        if (items.length === 0) return null;

        return (
          <div key={pos} aria-live="polite" className={TOAST_POSITION_CLASSES[pos]}>
            {items.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
            ))}
          </div>
        );
      })}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
