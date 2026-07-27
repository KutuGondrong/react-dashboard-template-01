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
    <div className="@[28rem]/dash:gap-3 @[40rem]/dash:gap-4 grid grid-cols-3 gap-2">
      {stats.stats.map((stat) => (
        <div
          key={stat.id}
          className="@[28rem]/dash:p-4 @[40rem]/dash:p-6 min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-900"
        >
          <p className="@[28rem]/dash:text-xs @[40rem]/dash:text-sm truncate text-[11px] text-gray-500 dark:text-gray-400">
            {resolveLabel(stat.labelKey)}
          </p>
          <div className="@[32rem]/dash:mt-2 @[40rem]/dash:flex-row @[40rem]/dash:items-baseline @[40rem]/dash:gap-2 mt-1 flex min-w-0 flex-col items-start gap-1">
            <span className="@[28rem]/dash:text-2xl @[40rem]/dash:text-3xl max-w-full truncate text-lg font-bold tabular-nums text-gray-900 dark:text-white">
              {stat.value.toLocaleString()}
            </span>
            <Badge
              variant={trendBadgeVariant(stat.trend)}
              size="sm"
              className="@[40rem]/dash:px-2 w-fit max-w-full shrink-0 truncate px-1.5"
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
    <div className="@[28rem]/dash:gap-3 @[40rem]/dash:gap-4 grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
