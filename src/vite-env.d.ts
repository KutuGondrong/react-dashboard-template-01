/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_SHOW_DEV_FEATURES?: string;
  readonly VITE_ENABLE_SCROLL_TO_TOP?: string;
  readonly MODE: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
