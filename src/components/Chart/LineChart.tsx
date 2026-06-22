import { DEFAULT_CHART_COLOR_TOKEN } from '@/config/color.tokens';
import { useLocale } from '@/context/LocaleContext';
import { useEffect, useId, useRef, useState } from 'react';
import { ChartGridAndYAxis } from './ChartGridAndYAxis';
import {
  buildAreaPath,
  buildLinePath,
  formatChartValue,
  getChartPadding,
  getPointCoordinates,
  resolvePointChartColor,
} from './chartUtils';
import type { LineChartProps } from './chart.types';
import { useChartAnimationKey } from './useChartAnimationKey';

export function LineChart({
  points,
  unit,
  height = 220,
  colorToken = DEFAULT_CHART_COLOR_TOKEN,
  className = '',
  animated = true,
  showValues = true,
  showYAxis = true,
}: LineChartProps) {
  const { t } = useLocale();
  const animationKey = useChartAnimationKey(animated, height);
  const gradientId = useId();
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const width = 480;
  const padding = getChartPadding(showYAxis, showValues);
  const coordinates = getPointCoordinates(points, width, height, padding);
  const pointColors = points.map((point) => resolvePointChartColor(point, colorToken));
  const useSegmentColors = new Set(pointColors).size > 1;
  const linePath = buildLinePath(points, width, height, padding);
  const areaPath = buildAreaPath(points, width, height, padding);
  const primaryColor = pointColors[0] ?? resolvePointChartColor(points[0], colorToken);

  useEffect(() => {
    if (!useSegmentColors && pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [linePath, animationKey, useSegmentColors]);

  if (points.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 ${className}`}
        style={{ height }}
      >
        {t('components.common.noData')}
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[320px]"
        role="img"
        aria-label={t('components.common.lineChart')}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </linearGradient>
          {useSegmentColors && (
            <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="1" y2="0">
              {pointColors.map((color, index) => (
                <stop
                  key={`${color}-${index}`}
                  offset={`${(index / Math.max(points.length - 1, 1)) * 100}%`}
                  stopColor={color}
                  stopOpacity="0.2"
                />
              ))}
            </linearGradient>
          )}
        </defs>

        <ChartGridAndYAxis
          points={points}
          width={width}
          height={height}
          padding={padding}
          unit={unit}
          showYAxis={showYAxis}
        />

        <path
          key={`area-${animationKey}`}
          d={areaPath}
          fill={useSegmentColors ? `url(#${gradientId}-area)` : `url(#${gradientId})`}
          className={animated ? 'animate-chart-fade-in' : undefined}
        />

        {useSegmentColors ? (
          coordinates.slice(1).map((coord, index) => {
            const prev = coordinates[index];
            return (
              <line
                key={`segment-${index}-${animationKey}`}
                x1={prev.x}
                y1={prev.y}
                x2={coord.x}
                y2={coord.y}
                stroke={pointColors[index + 1]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={animated ? 'animate-chart-fade-in' : undefined}
                style={animated ? { animationDelay: `${index * 0.08}s` } : undefined}
              />
            );
          })
        ) : (
          <path
            key={`line-${animationKey}`}
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              animated && pathLength > 0
                ? {
                    strokeDasharray: pathLength,
                    strokeDashoffset: pathLength,
                    animation: `chart-draw 1.2s ease-out forwards`,
                  }
                : undefined
            }
          />
        )}

        {points.map((point, index) => {
          const { x, y } = coordinates[index];
          const valueLabel = formatChartValue(point.value, unit);

          return (
            <g key={`${point.label}-${animationKey}`}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill={pointColors[index]}
                className={animated ? 'animate-chart-dot-pop' : undefined}
                style={animated ? { animationDelay: `${0.8 + index * 0.08}s` } : undefined}
              />
              {showValues && (
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="fill-gray-600 text-[9px] font-medium dark:fill-gray-300"
                >
                  {valueLabel}
                </text>
              )}
              <text
                x={x}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                className="fill-gray-500 text-[10px] dark:fill-gray-400"
              >
                {point.label}
              </text>
              <title>{`${point.label}: ${valueLabel}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
