import type { SkeletonType } from './skeleton.types';
import { DashboardSkeleton } from './DashboardSkeleton';
import { PageSkeleton } from './PageSkeleton';
import { CardSkeleton } from './CardSkeleton';
import { LineChartSkeleton } from './LineChartSkeleton';
import { BarChartSkeleton } from './BarChartSkeleton';
import { DonutChartSkeleton } from './DonutChartSkeleton';

export interface SkeletonLoaderProps {
  type?: SkeletonType;
  className?: string;
  height?: number;
  count?: number;
  showValues?: boolean;
  showYAxis?: boolean;
  size?: number;
}

export function SkeletonLoader({
  type = 'dashboard',
  className = '',
  height = 220,
  count = 0,
  showValues = true,
  showYAxis = true,
  size = 0,
}: SkeletonLoaderProps) {
  if (type === 'page') {
    return <PageSkeleton className={className} />;
  }
  if (type === 'card') {
    return <CardSkeleton className={className} />;
  }
  if (type === 'line') {
    return (
      <LineChartSkeleton
        className={className}
        height={height}
        count={count > 0 ? count : 6}
        showValues={showValues}
        showYAxis={showYAxis}
      />
    );
  }
  if (type === 'bar') {
    return <BarChartSkeleton className={className} height={height} count={count > 0 ? count : 7} />;
  }
  if (type === 'donut') {
    return <DonutChartSkeleton className={className} count={count > 0 ? count : 3} size={size} />;
  }
  return <DashboardSkeleton className={className || 'w-full'} />;
}
