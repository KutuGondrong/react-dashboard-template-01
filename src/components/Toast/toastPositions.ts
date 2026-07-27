import type { ToastPosition } from '@/models/model.type';

export const TOAST_POSITIONS: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'center',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export const DEFAULT_TOAST_POSITION: ToastPosition = 'bottom-right';

export const TOAST_POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-left':
    'pointer-events-none fixed top-4 left-4 z-[100] flex max-h-[calc(100vh-2rem)] flex-col gap-2 items-start overflow-hidden',
  'top-center':
    'pointer-events-none fixed top-4 left-1/2 z-[100] flex max-h-[calc(100vh-2rem)] w-full max-w-sm -translate-x-1/2 flex-col gap-2 items-center overflow-hidden px-4',
  'top-right':
    'pointer-events-none fixed top-4 right-4 z-[100] flex max-h-[calc(100vh-2rem)] flex-col gap-2 items-end overflow-hidden',
  center:
    'pointer-events-none fixed top-1/2 left-1/2 z-[100] flex max-h-[calc(100vh-4rem)] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col gap-2 items-center overflow-hidden px-4',
  'bottom-left':
    'pointer-events-none fixed bottom-4 left-4 z-[100] flex max-h-[calc(100vh-2rem)] flex-col-reverse gap-2 items-start overflow-hidden',
  'bottom-center':
    'pointer-events-none fixed bottom-4 left-1/2 z-[100] flex max-h-[calc(100vh-2rem)] w-full max-w-sm -translate-x-1/2 flex-col-reverse gap-2 items-center overflow-hidden px-4',
  'bottom-right':
    'pointer-events-none fixed bottom-4 right-4 z-[100] flex max-h-[calc(100vh-2rem)] flex-col-reverse gap-2 items-end overflow-hidden',
};

export function isToastPosition(value: string): value is ToastPosition {
  return TOAST_POSITIONS.includes(value as ToastPosition);
}

export function getToastPositionLabelKey(position: ToastPosition): string {
  return `toast.position.${position}`;
}
