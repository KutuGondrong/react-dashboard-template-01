import { DonutChart, MetricCard } from '@/components/Chart';
import { DonutChartSkeleton } from '@/components/SkeletonLoader';
import type { DonutChartData } from '@/models/model.type';

interface DashboardUserDistributionProps {
  userDistribution?: DonutChartData | null;
  resolveLabel: (key: string) => string;
  isLoading?: boolean;
}

export function DashboardUserDistribution({
  userDistribution,
  resolveLabel,
  isLoading = false,
}: DashboardUserDistributionProps) {
  if (isLoading || !userDistribution) {
    return <DonutChartSkeleton className="h-full min-h-0 w-full overflow-hidden" />;
  }

  return (
    <MetricCard
      title={resolveLabel(userDistribution.titleKey)}
      className="h-full min-h-0 w-full overflow-hidden"
    >
      <DonutChart
        segments={userDistribution.segments.map((segment) => ({
          ...segment,
          label: resolveLabel(segment.labelKey),
        }))}
        total={userDistribution.total}
        centerLabel={resolveLabel('dashboard.charts.totalUsers')}
        className="h-full min-h-0"
      />
    </MetricCard>
  );
}
