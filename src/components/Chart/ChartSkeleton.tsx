export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <div className="mb-4 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex h-[220px] items-end gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-shimmer rounded-t bg-gradient-to-t from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
            style={{ height: `${40 + (i % 3) * 20}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function DonutChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex animate-pulse flex-col rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 ${className}`}
    >
      <div className="mb-4 h-4 w-40 shrink-0 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex min-h-0 flex-1 items-center justify-center gap-8">
        <div className="h-40 w-40 shrink-0 rounded-full border-[28px] border-gray-200 dark:border-gray-700" />
        <div className="w-24 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    </div>
  );
}
