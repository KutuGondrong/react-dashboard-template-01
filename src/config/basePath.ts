/** React Router `basename` derived from Vite `base` (no trailing slash). */
export const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

/** Resolve a file from `/public` against the Vite base path. */
export function assetUrl(pathFromPublic: string): string {
  const file = pathFromPublic.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${file}`;
}
