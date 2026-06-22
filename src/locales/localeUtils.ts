import { useCallback } from 'react';
import type { SupportedLocale } from '@/config/app.config';
import { useLocale } from '@/context/LocaleContext';

export type LocaleParams = Record<string, string | number>;

export function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

/** Named {{param}} interpolation — EN/ID may place params in different positions. */
export function interpolate(template: string, params?: LocaleParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}

export function translateMessage(
  messages: Record<string, unknown>,
  key: string,
  params?: LocaleParams,
): string {
  const value = getNestedValue(messages, key);
  if (!value) return key;
  return interpolate(value, params);
}

/** Factory for dev-module locale hooks (Tutorial, Storybook, etc.) */
export function createFeatureLocaleHook<T extends Record<SupportedLocale, Record<string, unknown>>>(
  messages: T,
) {
  return function useFeatureLocale() {
    const { locale } = useLocale();

    const t = useCallback(
      (key: string, params?: LocaleParams) =>
        translateMessage(messages[locale] as Record<string, unknown>, key, params),
      [locale],
    );

    return { locale, t };
  };
}
