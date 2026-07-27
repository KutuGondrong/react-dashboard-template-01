import type { NavMenuItem } from '@/components/NavMenu';
import { DashboardIcon, UsersIcon } from '@/layouts/sidebar/components/SidebarIcons';

export function buildFeatureMenuItems(t: (key: string) => string): NavMenuItem[] {
  return [
    {
      key: 'dashboard',
      label: t('nav.dashboard'),
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      key: 'users',
      label: t('nav.users'),
      path: '/users',
      icon: <UsersIcon />,
    },
  ];
}
