import { createContext, type Context, type ReactNode } from 'react';
import type { ModalProps } from './Modal';

type ConfirmVariant = 'primary' | 'danger';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export interface ShowModalOptions {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalProps['size'];
  closeOnBackdropClick?: boolean;
}

export interface ModalContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  show: (options: ShowModalOptions) => void;
  close: () => void;
}

function createModalContextInstance(): Context<ModalContextValue | null> {
  return createContext<ModalContextValue | null>(null);
}

export const ModalContext: Context<ModalContextValue | null> =
  import.meta.hot?.data?.ModalContext ?? createModalContextInstance();

if (import.meta.hot) {
  import.meta.hot.data.ModalContext = ModalContext;
}
