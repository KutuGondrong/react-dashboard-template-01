import { Avatar } from '@/components/Avatar';
import type { User } from '@/models/model.type';

interface DashboardProfileCardProps {
  user: User;
}

export function DashboardProfileCard({ user }: DashboardProfileCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={user.avatarUrl} name={user.fullName} size="lg" presence="online" />
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-white">{user.fullName}</p>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
            {user.role}
          </p>
        </div>
      </div>
    </div>
  );
}
