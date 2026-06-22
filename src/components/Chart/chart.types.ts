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

export interface DonutChartProps {
  segments: Array<DonutSegment & { label: string }>;
  total: number;
  size?: number;
  className?: string;
  animated?: boolean;
  centerLabel?: string;
}

export interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}
