/**
 * App chrome surfaces — one cohesive slate family, no divider borders.
 *
 * Light (top → bottom): white header → slate-100 nav → slate-50 body → slate-200 footer
 * Dark:  slate-900 header/nav → slate-950 body → slate-800 footer (footer lifts slightly)
 */
export const layoutSurfaces = {
  canvas: 'bg-slate-50 dark:bg-slate-950',
  header: 'bg-white dark:bg-slate-900',
  nav: 'bg-slate-100 dark:bg-slate-900',
  main: 'bg-slate-50 dark:bg-slate-950',
  footer: 'bg-slate-200 dark:bg-slate-800',
} as const;
