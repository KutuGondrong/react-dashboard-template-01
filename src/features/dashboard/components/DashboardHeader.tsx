import { Avatar } from '@/components/Avatar';
import type { User } from '@/models/model.type';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  user?: User | null;
}

export function DashboardHeader({ title, subtitle, user }: DashboardHeaderProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        {user && (
          <div className="flex min-w-0 items-center gap-3 border-t border-gray-200 pt-4 sm:shrink-0 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 dark:border-gray-700">
            <Avatar src={user.avatarUrl} name={user.fullName} size="lg" presence="online" />
            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900 dark:text-white">{user.fullName}</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
                {user.role}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
