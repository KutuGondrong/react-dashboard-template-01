import {
  BarChart,
  MetricCard,
  ChartSkeleton,
  DonutChart,
  DonutChartSkeleton,
  LineChart,
} from '@/components/Chart';
import type { BarChartData, DonutChartData, LineChartData } from '@/models/model.type';

interface DashboardChartsProps {
  revenueChart: LineChartData;
  activityChart: BarChartData;
  userDistribution: DonutChartData;
  resolveLabel: (key: string) => string;
}

export function DashboardCharts({
  revenueChart,
  activityChart,
  userDistribution,
  resolveLabel,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <MetricCard title={resolveLabel(revenueChart.titleKey)}>
        <LineChart points={revenueChart.points} unit={revenueChart.unit} />
      </MetricCard>

      <MetricCard title={resolveLabel(activityChart.titleKey)}>
        <BarChart points={activityChart.points} colorToken="primary-light" />
      </MetricCard>

      <MetricCard title={resolveLabel(userDistribution.titleKey)} className="lg:col-span-2">
        <DonutChart
          segments={userDistribution.segments.map((segment) => ({
            ...segment,
            label: resolveLabel(segment.labelKey),
          }))}
          total={userDistribution.total}
          centerLabel={resolveLabel('dashboard.charts.totalUsers')}
        />
      </MetricCard>
    </div>
  );
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
      <DonutChartSkeleton className="lg:col-span-2" />
    </div>
  );
}
