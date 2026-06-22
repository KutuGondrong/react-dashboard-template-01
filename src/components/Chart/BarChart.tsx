import { DEFAULT_CHART_COLOR_TOKEN } from '@/config/color.tokens';
import { useLocale } from '@/context/LocaleContext';
import { ChartGridAndYAxis } from './ChartGridAndYAxis';
import {
  formatChartValue,
  getChartPadding,
  getMaxValue,
  resolvePointChartColor,
} from './chartUtils';
import type { BarChartProps } from './chart.types';
import { useChartAnimationKey } from './useChartAnimationKey';

export function BarChart({
  points,
  height = 220,
  colorToken = DEFAULT_CHART_COLOR_TOKEN,
  className = '',
  animated = true,
  showValues = true,
  showYAxis = true,
}: BarChartProps) {
  const { t } = useLocale();
  const animationKey = useChartAnimationKey(animated, height);
  const width = 480;
  const padding = getChartPadding(showYAxis, showValues);
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = getMaxValue(points);
  const barGap = 12;
  const barWidth =
    points.length > 0
      ? (width - padding.left - padding.right - barGap * (points.length - 1)) / points.length
      : 0;

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
        aria-label={t('components.common.barChart')}
      >
        <ChartGridAndYAxis
          points={points}
          width={width}
          height={height}
          padding={padding}
          showYAxis={showYAxis}
        />

        {points.map((point, index) => {
          const barHeight = maxValue === 0 ? 0 : (point.value / maxValue) * chartHeight;
          const x = padding.left + index * (barWidth + barGap);
          const y = padding.top + chartHeight - barHeight;
          const color = resolvePointChartColor(point, colorToken);
          const valueLabel = formatChartValue(point.value);

          return (
            <g key={`${point.label}-${animationKey}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={color}
                opacity="0.85"
                className={animated ? 'origin-bottom animate-chart-bar-grow' : undefined}
                style={
                  animated
                    ? {
                        transformBox: 'fill-box',
                        transformOrigin: 'bottom',
                        animationDelay: `${index * 0.07}s`,
                      }
                    : undefined
                }
              />
              {showValues && barHeight > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-gray-600 text-[9px] font-medium dark:fill-gray-300"
                >
                  {valueLabel}
                </text>
              )}
              <text
                x={x + barWidth / 2}
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
