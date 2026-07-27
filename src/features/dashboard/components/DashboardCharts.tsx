import { BarChart, MetricCard, ChartSkeleton, LineChart } from '@/components/Chart';
import type { BarChartData, LineChartData } from '@/models/model.type';

interface DashboardChartsProps {
  revenueChart: LineChartData;
  activityChart: BarChartData;
  resolveLabel: (key: string) => string;
}

export function DashboardCharts({
  revenueChart,
  activityChart,
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
    </div>
  );
}

export function DashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  );
}
