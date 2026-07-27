export const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

export function assetUrl(pathFromPublic: string): string {
  const file = pathFromPublic.replace(/^\//, '');
  const base = import.meta.env.BASE_URL || '/';
  const withSlash = base.endsWith('/') ? base : `${base}/`;
  return `${withSlash}${file}`;
}
