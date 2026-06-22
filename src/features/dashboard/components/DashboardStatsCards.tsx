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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{resolveLabel(stat.labelKey)}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value.toLocaleString()}
            </span>
            <Badge variant={trendBadgeVariant(stat.trend)} size="sm">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
