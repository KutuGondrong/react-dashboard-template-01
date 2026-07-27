export const SKELETON_TYPES = ['dashboard', 'page', 'card', 'line', 'bar', 'donut'] as const;

export type SkeletonType = (typeof SKELETON_TYPES)[number];

export const SKELETON_TYPE_COMPONENTS = {
  dashboard: 'DashboardSkeleton',
  page: 'PageSkeleton',
  card: 'CardSkeleton',
  line: 'LineChartSkeleton',
  bar: 'BarChartSkeleton',
  donut: 'DonutChartSkeleton',
} as const;

export type SkeletonSpecificComponent =
  (typeof SKELETON_TYPE_COMPONENTS)[keyof typeof SKELETON_TYPE_COMPONENTS];
