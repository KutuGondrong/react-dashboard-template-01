import { Badge } from '@/components/Badge';
import { CardSkeleton } from '@/components/SkeletonLoader';
import type { DashboardStats, TrendDirection } from '@/models/model.type';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  resolveLabel: (key: string) => string;
}

function trendBadgeVariant(trend: TrendDirection): 'success' | 'danger' | 'default' {
  if (trend === 'up') return 'success';
  if (trend === 'down') return 'danger';
  return 'default';
}

function formatChange(trend: TrendDirection, value: number): string {
  const prefix = trend === 'down' ? '-' : trend === 'up' ? '+' : '';
  return `${prefix}${value}%`;
}

export function DashboardStatsCards({ stats, resolveLabel }: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {stats.stats.map((stat) => (
        <div
          key={stat.id}
          className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 sm:p-6 dark:border-gray-700 dark:bg-gray-900"
        >
          <p className="truncate text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {resolveLabel(stat.labelKey)}
          </p>
          <div className="mt-1 flex flex-col items-start gap-1 sm:mt-2 sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              {stat.value.toLocaleString()}
            </span>
            <Badge
              variant={trendBadgeVariant(stat.trend)}
              size="sm"
              className="w-fit shrink-0 px-1.5 sm:px-2"
            >
              {formatChange(stat.trend, stat.changePercent)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
