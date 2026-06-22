interface DevFeatureBannerProps {
  title: string;
  description: string;
}

export function DevFeatureBanner({ title, description }: DevFeatureBannerProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 dark:border-yellow-700/60 dark:bg-yellow-900/20"
    >
      <span className="mt-0.5 shrink-0 rounded bg-yellow-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-yellow-800 dark:bg-yellow-800/60 dark:text-yellow-200">
        DEV
      </span>
      <div>
        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">{title}</p>
        <p className="mt-1 text-sm text-yellow-800/90 dark:text-yellow-200/90">{description}</p>
      </div>
    </div>
  );
}
