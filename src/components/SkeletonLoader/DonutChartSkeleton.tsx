import { useLocale } from '@/context/LocaleContext';

export interface DonutChartSkeletonProps {
  className?: string;
  count?: number;
  size?: number;
}

const VIEWBOX = 200;
const STROKE_WIDTH = 28;
const RING_INSET = 3;
const SIDE_RING_FLOOR = 160;
const RADIUS = (VIEWBOX - STROKE_WIDTH) / 2 - RING_INSET;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = VIEWBOX / 2;

export function DonutChartSkeleton({
  className = '',
  count = 3,
  size = 0,
}: DonutChartSkeletonProps) {
  const { t } = useLocale();
  const loadingCount = Math.max(count, 3);
  const ringSize = size > 0 ? size : SIDE_RING_FLOOR;
  const share = CIRCUMFERENCE / loadingCount;
  const loadingSegments = Array.from({ length: loadingCount }, (_, index) => ({
    dashLength: share * 0.72,
    dashOffset: index * share,
  }));
  const loadingLegendRows = Array.from({ length: loadingCount }, (_, i) => i);

  return (
    <div
      className={`flex h-full max-h-full w-full min-w-0 max-w-full items-center justify-center gap-4 overflow-hidden ${className}`}
      role="status"
      aria-label={t('components.common.loading')}
    >
      <div
        className="relative shrink-0 animate-pulse"
        style={{ width: ringSize, height: ringSize }}
      >
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            className="stroke-gray-100 dark:stroke-gray-800"
            strokeWidth={STROKE_WIDTH}
          />
          {loadingSegments.map((segment, index) => (
            <circle
              key={index}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="butt"
              strokeDasharray={`${segment.dashLength} ${CIRCUMFERENCE - segment.dashLength}`}
              strokeDashoffset={-segment.dashOffset}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-14 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <ul className="min-w-0 space-y-3 overflow-hidden">
        {loadingLegendRows.map((row) => (
          <li key={row} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
            <span className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <span className="h-3 w-8 rounded bg-gray-100 dark:bg-gray-800" />
          </li>
        ))}
      </ul>
    </div>
  );
}
