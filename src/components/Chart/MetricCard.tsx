import type { MetricCardProps } from './chart.types';

export function MetricCard({ title, children, className = '' }: MetricCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <h3 className="mb-4 shrink-0 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  );
}
