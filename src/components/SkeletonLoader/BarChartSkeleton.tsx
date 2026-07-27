import { useLocale } from '@/context/LocaleContext';

export interface BarChartSkeletonProps {
  className?: string;
  height?: number;
  count?: number;
}

export function BarChartSkeleton({
  className = '',
  height = 220,
  count = 7,
}: BarChartSkeletonProps) {
  const { t } = useLocale();
  const loadingCount = Math.max(count, 7);
  const loadingBars = Array.from({ length: loadingCount }, (_, index) => ({
    heightPct: 35 + ((index * 17) % 50),
  }));

  return (
    <div
      className={`flex w-full min-w-0 items-end gap-2 px-1 ${className}`}
      style={{ height }}
      role="status"
      aria-label={t('components.common.loading')}
    >
      {loadingBars.map((bar, index) => (
        <div
          key={index}
          className="flex-1 animate-pulse rounded-t bg-gray-200 dark:bg-gray-700"
          style={{ height: `${bar.heightPct}%` }}
        />
      ))}
    </div>
  );
}
