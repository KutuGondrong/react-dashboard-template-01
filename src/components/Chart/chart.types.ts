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
}

export interface BarChartProps {
  points: ChartDataPoint[];
  height?: number;
  colorToken?: ChartColorToken;
  className?: string;
  animated?: boolean;
  showValues?: boolean;
  showYAxis?: boolean;
}

export type DonutLegendLayout = 'center' | 'right' | 'bottom';

export interface DonutChartProps {
  segments: Array<DonutSegment & { label: string }>;
  total: number;
  /**
   * Ring size in px.
   * - `0` / `undefined` / `null` → dynamic (fill remaining container space). Default: `0`.
   * - `> 0` → preferred ring size; shrinks only if the container is smaller.
   */
  size?: number | null;
  className?: string;
  animated?: boolean;
  centerLabel?: string;
}

export interface MetricCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}
