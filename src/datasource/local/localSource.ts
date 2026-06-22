import { appConfig, type SupportedLocale } from '@/config/app.config';
import type { ThemeMode, ToastPosition } from '@/models/model.type';
import type { User } from '@/models/model.type';

const isBrowser = typeof window !== 'undefined';

function safeGetItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage quota exceeded or private browsing
  }
}

function safeRemoveItem(key: string): void {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
}

export const localSource = {
  getToken(): string | null {
    return safeGetItem(appConfig.tokenKey);
  },

  setToken(token: string): void {
    safeSetItem(appConfig.tokenKey, token);
  },

  removeToken(): void {
    safeRemoveItem(appConfig.tokenKey);
  },

  getUser(): User | null {
    const raw = safeGetItem(appConfig.userKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as User;
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      };
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    safeSetItem(appConfig.userKey, JSON.stringify(user));
  },

  removeUser(): void {
    safeRemoveItem(appConfig.userKey);
  },

  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  },

  getTheme(): ThemeMode | null {
    const theme = safeGetItem(appConfig.themeKey);
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
    return null;
  },

  setTheme(theme: ThemeMode): void {
    safeSetItem(appConfig.themeKey, theme);
  },

  getLocale(): SupportedLocale | null {
    const locale = safeGetItem(appConfig.localeKey);
    if (locale === 'en' || locale === 'id') {
      return locale;
    }
    return null;
  },

  setLocale(locale: SupportedLocale): void {
    safeSetItem(appConfig.localeKey, locale);
  },

  getToastPosition(): ToastPosition | null {
    const position = safeGetItem(appConfig.toastPositionKey);
    const valid: ToastPosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'center',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ];
    if (position && valid.includes(position as ToastPosition)) {
      return position as ToastPosition;
    }
    return null;
  },

  setToastPosition(position: ToastPosition): void {
    safeSetItem(appConfig.toastPositionKey, position);
  },
};
