import { useMemo } from 'react';
import { isDevFeaturesEnabled } from '@/config/devFeatures';
import { useLocale } from '@/context/LocaleContext';
import type { NavMenuItem } from '@/components/NavMenu';
import {
  DashboardIcon,
  SettingsIcon,
  StorybookIcon,
  TutorialIcon,
  UsersIcon,
} from '@/layouts/sidebar/components/SidebarIcons';

const COMPONENTS_PATH = '/components';

export function useSidebar() {
  const { t } = useLocale();
  const isDev = isDevFeaturesEnabled;

  const menuItems = useMemo<NavMenuItem[]>(() => {
    const items: NavMenuItem[] = [
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
      {
        key: 'settings',
        label: t('nav.settings'),
        path: '/settings',
        icon: <SettingsIcon />,
      },
    ];

    if (isDev) {
      items.push({
        key: 'tutorial',
        label: t('nav.tutorial'),
        path: '/tutorial',
        icon: <TutorialIcon />,
        devBadge: true,
      });

      items.push({
        key: 'components',
        label: t('nav.components'),
        path: COMPONENTS_PATH,
        icon: <StorybookIcon />,
        devBadge: true,
      });
    }

    return items;
  }, [t, isDev]);

  return { menuItems };
}
