import { createFeatureLocaleHook } from '@/locales/localeUtils';
import en from '../locales/en.json';
import id from '../locales/id.json';

const messages = { en, id };

/** Storybook-only i18n — separate from app locales in src/locales/ */
export const useStorybookLocale = createFeatureLocaleHook(messages);
