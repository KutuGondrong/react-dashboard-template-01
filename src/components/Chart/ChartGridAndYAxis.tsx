import { formatYAxisTick, getMaxValue, Y_AXIS_RATIOS, type ChartPadding } from './chartUtils';
import type { ChartDataPoint } from '@/models/model.type';

interface ChartGridAndYAxisProps {
  points: ChartDataPoint[];
  width: number;
  height: number;
  padding: ChartPadding;
  unit?: string;
  showYAxis: boolean;
}

export function ChartGridAndYAxis({
  points,
  width,
  height,
  padding,
  unit,
  showYAxis,
}: ChartGridAndYAxisProps) {
  const maxValue = getMaxValue(points);
  const chartHeight = height - padding.top - padding.bottom;

  return (
    <>
      {Y_AXIS_RATIOS.map((ratio) => {
        const y = padding.top + chartHeight * (1 - ratio);
        const tickValue = maxValue * ratio;

        return (
          <g key={ratio}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              className="stroke-gray-200 dark:stroke-gray-700"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {showYAxis && (
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-gray-400 text-[9px] dark:fill-gray-500"
              >
                {formatYAxisTick(tickValue, unit)}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}
