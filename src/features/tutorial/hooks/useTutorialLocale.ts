import { createFeatureLocaleHook } from '@/locales/localeUtils';
import en from '../locales/en.json';
import id from '../locales/id.json';

const messages = { en, id };

/** Tutorial-only i18n. Separate from app locales in src/locales/ */
export const useTutorialLocale = createFeatureLocaleHook(messages);
