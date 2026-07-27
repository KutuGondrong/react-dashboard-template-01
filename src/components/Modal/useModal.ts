import { useContext } from 'react';
import { ModalContext, type ModalContextValue } from './modalContext';

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
