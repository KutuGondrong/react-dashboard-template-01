/** @deprecated Prefer `DonutChartSkeleton` / `<SkeletonLoader type="donut" />` from `@/components/SkeletonLoader`. */
import { DonutChartSkeleton as SkeletonDonutChartSkeleton } from '@/components/SkeletonLoader';

export function DonutChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <SkeletonDonutChartSkeleton />
    </div>
  );
}
