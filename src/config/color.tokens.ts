/** Design color tokens — keep in sync with tailwind.config.js `theme.extend.colors` */
export const colorTokens = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  success: {
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
  },
  danger: {
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  info: {
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
  },
} as const;

/** Semantic token keys for chart SVG fills/strokes */
export type ChartColorToken =
  | 'primary'
  | 'primary-light'
  | 'accent'
  | 'success'
  | 'danger'
  | 'info';

export const chartColorTokens: Record<ChartColorToken, string> = {
  primary: colorTokens.primary[500],
  'primary-light': colorTokens.primary[400],
  accent: colorTokens.accent[500],
  success: colorTokens.success[500],
  danger: colorTokens.danger[500],
  info: colorTokens.info[500],
};

export const DEFAULT_CHART_COLOR_TOKEN: ChartColorToken = 'primary';

export function resolveChartColor(token: ChartColorToken = DEFAULT_CHART_COLOR_TOKEN): string {
  return chartColorTokens[token];
}

export function isChartColorToken(value: string): value is ChartColorToken {
  return value in chartColorTokens;
}
