import { createFeatureLocaleHook } from '@/locales/localeUtils';
import en from '../locales/en.json';
import id from '../locales/id.json';

const messages = { en, id };

export const useTutorialLocale = createFeatureLocaleHook(messages);
