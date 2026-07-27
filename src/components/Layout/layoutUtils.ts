import type { CSSProperties } from 'react';

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function gapStyle(gap?: number | string): CSSProperties | undefined {
  if (gap === undefined || gap === '') return undefined;
  const value = typeof gap === 'number' ? `${gap}px` : gap;
  return { gap: value };
}
