import { Avatar } from '@/components/Avatar';
import type { User } from '@/models/model.type';

/** Keep in sync with DashboardWelcomeRow side-by-side probe. */
export const DASHBOARD_PROFILE_MIN_WIDTH_PX = 240; // 15rem

interface DashboardProfileCardProps {
  user: User;
}

export function DashboardProfileCard({ user }: DashboardProfileCardProps) {
  return (
    <div className="flex h-full w-full shrink-0 items-center rounded-xl border border-gray-200 bg-white p-4 sm:w-auto sm:min-w-[15rem] sm:p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex min-w-0 items-center gap-3">
        <div className="shrink-0">
          <Avatar src={user.avatarUrl} name={user.fullName} size="lg" presence="online" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-gray-900 dark:text-white">{user.fullName}</p>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <p className="mt-0.5 truncate text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
            {user.role}
          </p>
        </div>
      </div>
    </div>
  );
}
