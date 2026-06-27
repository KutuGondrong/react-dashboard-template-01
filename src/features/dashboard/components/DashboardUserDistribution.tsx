import { DonutChart, DonutChartSkeleton, MetricCard } from '@/components/Chart';
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
    return <DonutChartSkeleton className="h-full" />;
  }

  return (
    <MetricCard title={resolveLabel(userDistribution.titleKey)} className="h-full">
      <DonutChart
        segments={userDistribution.segments.map((segment) => ({
          ...segment,
          label: resolveLabel(segment.labelKey),
        }))}
        total={userDistribution.total}
        centerLabel={resolveLabel('dashboard.charts.totalUsers')}
        size={140}
      />
    </MetricCard>
  );
}
