interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}
