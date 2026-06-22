import type { RefObject, ReactNode } from 'react';
import type { User } from '@/models/model.type';
import { Avatar } from '@/components/Avatar';

function ProfileMenuItem({
  children,
  onClick,
  tone = 'default',
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
        tone === 'danger'
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/60'
      }`}
    >
      {children}
    </button>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  );
}

export function ProfileMenu({
  user,
  isOpen,
  profileRef,
  settingsLabel,
  logoutLabel,
  onToggle,
  onSettings,
  onLogout,
}: {
  user: User;
  isOpen: boolean;
  profileRef: RefObject<HTMLDivElement>;
  settingsLabel: string;
  logoutLabel: string;
  onToggle: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <div ref={profileRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`rounded-full p-0.5 transition-colors hover:bg-gray-100 lg:rounded-lg lg:p-1.5 dark:hover:bg-gray-800 ${
          isOpen ? 'ring-2 ring-primary-500/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
        }`}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" presence="online" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>

          <div className="py-1">
            <ProfileMenuItem onClick={onSettings}>
              <SettingsIcon />
              {settingsLabel}
            </ProfileMenuItem>

            <ProfileMenuItem onClick={onLogout} tone="danger">
              <LogoutIcon />
              {logoutLabel}
            </ProfileMenuItem>
          </div>
        </div>
      )}
    </div>
  );
}
