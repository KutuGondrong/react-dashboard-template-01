import type { Ref } from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  titleRef?: Ref<HTMLHeadingElement>;
}

export function DashboardHeader({ title, subtitle, titleRef }: DashboardHeaderProps) {
  return (
    <div className="flex h-full min-w-0 flex-col justify-center rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
      <h1 ref={titleRef} className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {subtitle}
      </p>
    </div>
  );
}
