/** @deprecated Prefer `BarChartSkeleton` / `<SkeletonLoader type="bar" />` from `@/components/SkeletonLoader`. */
import { BarChartSkeleton } from '@/components/SkeletonLoader';

export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <BarChartSkeleton height={220} />
    </div>
  );
}
