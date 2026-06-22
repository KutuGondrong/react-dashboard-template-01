type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  presence?: PresenceStatus;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string; ring: string }> = {
  xs: { container: 'h-6 w-6', text: 'text-[10px]', ring: 'ring-1' },
  sm: { container: 'h-8 w-8', text: 'text-xs', ring: 'ring-2' },
  md: { container: 'h-10 w-10', text: 'text-sm', ring: 'ring-2' },
  lg: { container: 'h-12 w-12', text: 'text-base', ring: 'ring-2' },
  xl: { container: 'h-16 w-16', text: 'text-lg', ring: 'ring-[3px]' },
};

const presenceColors: Record<PresenceStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  presence,
  className = '',
}: AvatarProps) {
  const sizeConfig = sizeClasses[size];
  const initials = name ? getInitials(name) : '?';

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizeConfig.container} ${sizeConfig.ring} flex items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700 ring-white dark:bg-primary-900/50 dark:text-primary-300 dark:ring-gray-900`}
      >
        {src ? (
          <img src={src} alt={alt || name} className="h-full w-full object-cover" />
        ) : (
          <span className={sizeConfig.text}>{initials}</span>
        )}
      </div>
      {presence && (
        <span
          className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${presenceColors[presence]} ring-2 ring-white dark:ring-gray-900`}
          aria-label={`Status: ${presence}`}
        />
      )}
    </div>
  );
}

export interface UserCardProps {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  presence?: PresenceStatus;
  className?: string;
}

export function UserCard({
  name,
  email,
  role,
  avatarUrl,
  presence,
  className = '',
}: UserCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <Avatar src={avatarUrl} name={name} size="lg" presence={presence} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900 dark:text-white">{name}</p>
        {email && <p className="truncate text-sm text-gray-500 dark:text-gray-400">{email}</p>}
        {role && (
          <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
            {role}
          </p>
        )}
      </div>
    </div>
  );
}
