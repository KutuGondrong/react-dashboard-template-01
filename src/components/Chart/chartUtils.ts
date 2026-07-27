import type { ChartDataPoint } from '@/models/model.type';
import {
  DEFAULT_CHART_COLOR_TOKEN,
  resolveChartColor,
  type ChartColorToken,
} from '@/config/color.tokens';
import type { ChartDimensions } from './chart.types';

export function getChartDimensions(width: number, height: number): ChartDimensions {
  return { width, height, padding: 32 };
}

export function getMaxValue(points: ChartDataPoint[]): number {
  if (points.length === 0) return 0;
  return Math.max(...points.map((p) => p.value));
}

export function resolvePointChartColor(
  point: ChartDataPoint,
  fallbackToken: ChartColorToken = DEFAULT_CHART_COLOR_TOKEN,
): string {
  return resolveChartColor(point.colorToken ?? fallbackToken);
}

export interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function getChartPadding(showYAxis: boolean, showValues: boolean): ChartPadding {
  return {
    top: showValues ? 24 : 16,
    right: 32,
    bottom: 32,
    left: showYAxis ? 44 : 32,
  };
}

export function getPointCoordinates(
  points: ChartDataPoint[],
  width: number,
  height: number,
  padding: ChartPadding,
): Array<{ x: number; y: number }> {
  const maxValue = getMaxValue(points);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;

  return points.map((point, index) => {
    const x = padding.left + index * stepX;
    const y =
      maxValue === 0
        ? padding.top + chartHeight / 2
        : padding.top + chartHeight - (point.value / maxValue) * chartHeight;
    return { x, y };
  });
}

export function buildLinePath(
  points: ChartDataPoint[],
  width: number,
  height: number,
  padding: ChartPadding,
): string {
  if (points.length === 0) return '';

  const maxValue = getMaxValue(points);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;

  return points
    .map((point, index) => {
      const x = padding.left + index * stepX;
      const y =
        maxValue === 0
          ? padding.top + chartHeight / 2
          : padding.top + chartHeight - (point.value / maxValue) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function buildAreaPath(
  points: ChartDataPoint[],
  width: number,
  height: number,
  padding: ChartPadding,
): string {
  if (points.length === 0) return '';

  const linePath = buildLinePath(points, width, height, padding);
  const chartWidth = width - padding.left - padding.right;
  const bottomY = height - padding.bottom;
  const lastX =
    padding.left + (points.length - 1) * (points.length > 1 ? chartWidth / (points.length - 1) : 0);

  return `${linePath} L ${lastX} ${bottomY} L ${padding.left} ${bottomY} Z`;
}

export function formatChartValue(value: number, unit?: string): string {
  if (unit) return `${value}${unit}`;
  return value.toLocaleString();
}

export function formatYAxisTick(value: number, unit?: string): string {
  if (value === 0) return '0';
  const rounded = Number.isInteger(value) ? value : Math.round(value * 10) / 10;
  return formatChartValue(rounded, unit);
}

export const Y_AXIS_RATIOS = [0, 0.25, 0.5, 0.75, 1] as const;
