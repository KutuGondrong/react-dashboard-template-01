import type { ReactNode } from 'react';
import type { ChartDataPoint, DonutSegment } from '@/models/model.type';

import type { ChartColorToken } from '@/config/color.tokens';

export interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
}

export interface LineChartProps {
  points: ChartDataPoint[];
  unit?: string;
  height?: number;
  colorToken?: ChartColorToken;
  className?: string;
  animated?: boolean;
  showValues?: boolean;
  showYAxis?: boolean;
  isLoading?: boolean;
}

export interface BarChartProps {
  points: ChartDataPoint[];
  height?: number;
  colorToken?: ChartColorToken;
  className?: string;
  animated?: boolean;
  showValues?: boolean;
  showYAxis?: boolean;
  isLoading?: boolean;
}

export type DonutLegendLayout = 'center' | 'right' | 'bottom';

export interface DonutChartProps {
  segments: Array<DonutSegment & { label: string }>;
  total: number;

  size?: number | null;
  className?: string;
  animated?: boolean;
  centerLabel?: string;
  /** Force legend placement; `auto` (default) picks from container size. */
  legendPosition?: 'auto' | DonutLegendLayout;
  isLoading?: boolean;
}

export interface MetricCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}
