import { useLocale } from '@/context/LocaleContext';
import { getChartPadding } from '@/components/Chart/chartUtils';

export interface LineChartSkeletonProps {
  className?: string;
  height?: number;
  count?: number;
  showValues?: boolean;
  showYAxis?: boolean;
}

export function LineChartSkeleton({
  className = '',
  height = 220,
  count = 6,
  showValues = true,
  showYAxis = true,
}: LineChartSkeletonProps) {
  const { t } = useLocale();
  const width = 480;
  const padding = getChartPadding(showYAxis, showValues);
  const loadingCount = Math.max(count, 6);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const loadingSlots = Array.from({ length: loadingCount }, (_, index) => {
    const ratio = loadingCount === 1 ? 0.5 : index / (loadingCount - 1);
    const yWave = 0.28 + 0.42 * Math.sin(ratio * Math.PI * 1.5 + 0.4);
    const x = padding.left + ratio * chartWidth;
    const y = padding.top + chartHeight * yWave;
    return {
      x,
      y,
      valueWidth: 22 + (index % 3) * 4,
      labelWidth: 18 + (index % 2) * 6,
    };
  });

  const loadingLinePath = loadingSlots
    .map((slot, index) => `${index === 0 ? 'M' : 'L'} ${slot.x} ${slot.y}`)
    .join(' ');

  const loadingYTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: padding.top + chartHeight * (1 - ratio),
    tickWidth: ratio === 0 ? 10 : 16 + Math.round(ratio * 8),
  }));

  return (
    <div
      className={`w-full min-w-0 ${className}`}
      role="status"
      aria-label={t('components.common.loading')}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-full animate-pulse">
        {loadingYTicks.map((tick, index) => (
          <g key={`y-${index}`}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <rect
              x={padding.left - 8 - tick.tickWidth}
              y={tick.y - 4}
              width={tick.tickWidth}
              height="8"
              rx="2"
              className="fill-gray-200 dark:fill-gray-700"
            />
          </g>
        ))}

        <path
          d={loadingLinePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-200 dark:text-gray-700"
        />

        {loadingSlots.map((slot, index) => (
          <g key={`point-${index}`}>
            <rect
              x={slot.x - slot.valueWidth / 2}
              y={slot.y - 18}
              width={slot.valueWidth}
              height="8"
              rx="2"
              className="fill-gray-300 dark:fill-gray-600"
            />
            <circle cx={slot.x} cy={slot.y} r="4" className="fill-gray-300 dark:fill-gray-600" />
            <rect
              x={slot.x - slot.labelWidth / 2}
              y={height - padding.bottom + 10}
              width={slot.labelWidth}
              height="8"
              rx="2"
              className="fill-gray-200 dark:fill-gray-700"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
