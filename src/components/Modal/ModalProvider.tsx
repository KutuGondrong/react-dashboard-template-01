import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog, Modal } from './Modal';
import { ModalContext, type ConfirmOptions, type ShowModalOptions } from './modalContext';

type ModalState =
  | { type: 'confirm'; options: ConfirmOptions }
  | { type: 'custom'; options: ShowModalOptions }
  | null;

export function ModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModalState>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState(null);
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ type: 'confirm', options });
    });
  }, []);

  const show = useCallback((options: ShowModalOptions) => {
    resolveRef.current = null;
    setState({ type: 'custom', options });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState(null);
  }, []);

  const value = useMemo(() => ({ confirm, show, close }), [confirm, show, close]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {state?.type === 'confirm' && (
        <ConfirmDialog
          isOpen
          onClose={close}
          onConfirm={handleConfirm}
          title={state.options.title}
          message={state.options.message}
          confirmLabel={state.options.confirmLabel}
          cancelLabel={state.options.cancelLabel}
          variant={state.options.variant}
        />
      )}
      {state?.type === 'custom' && (
        <Modal
          isOpen
          onClose={close}
          title={state.options.title}
          description={state.options.description}
          size={state.options.size}
          closeOnBackdropClick={state.options.closeOnBackdropClick}
          footer={state.options.footer}
        >
          {state.options.children}
        </Modal>
      )}
    </ModalContext.Provider>
  );
}
