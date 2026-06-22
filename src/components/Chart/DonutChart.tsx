import { resolveChartColor } from '@/config/color.tokens';
import { useLocale } from '@/context/LocaleContext';
import { useEffect, useState } from 'react';
import { formatChartValue } from './chartUtils';
import type { DonutChartProps } from './chart.types';
import { useChartAnimationKey } from './useChartAnimationKey';

const STROKE_WIDTH = 28;

export function DonutChart({
  segments,
  total,
  size = 200,
  className = '',
  animated = true,
  centerLabel,
}: DonutChartProps) {
  const { t } = useLocale();
  const animationKey = useChartAnimationKey(animated, size);
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const [animatedOffset, setAnimatedOffset] = useState(animated ? circumference : 0);

  const segmentData = segments.map((segment) => ({
    ...segment,
    color: resolveChartColor(segment.colorToken),
    percentage: total > 0 ? (segment.value / total) * 100 : 0,
    dashLength: total > 0 ? (segment.value / total) * circumference : 0,
  }));

  let cumulativeOffset = 0;

  useEffect(() => {
    if (!animated) {
      setAnimatedOffset(0);
      return;
    }

    setAnimatedOffset(circumference);
    let timer: number | undefined;
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setAnimatedOffset(0), 50);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [animated, animationKey, circumference, segments, total]);

  if (segments.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 ${className}`}
        style={{ width: size, height: size }}
      >
        {t('components.common.noData')}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8 ${className}`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={t('components.common.donutChart')}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-gray-100 dark:stroke-gray-800"
            strokeWidth={STROKE_WIDTH}
          />
          {segmentData.map((segment, index) => {
            const dashOffset = cumulativeOffset;
            cumulativeOffset += segment.dashLength;

            return (
              <circle
                key={`${segment.labelKey}-${animationKey}`}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="butt"
                strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
                strokeDashoffset={-dashOffset + (animated ? animatedOffset : 0)}
                transform={`rotate(-90 ${center} ${center})`}
                style={{
                  transition: animated
                    ? `stroke-dashoffset 1s ease-out ${index * 0.1}s`
                    : undefined,
                }}
              >
                <title>{`${segment.label}: ${formatChartValue(segment.value)} (${segment.percentage.toFixed(1)}%)`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatChartValue(total)}
          </span>
          {centerLabel && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</span>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {segmentData.map((segment) => (
          <li key={segment.labelKey} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
              aria-hidden="true"
            />
            <span className="text-gray-600 dark:text-gray-300">{segment.label}</span>
            <span className="ml-auto font-medium text-gray-900 dark:text-white">
              {segment.percentage.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
