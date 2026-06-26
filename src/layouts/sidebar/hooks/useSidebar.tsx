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
import { buildGeneratedFeatureMenuItems } from '@/layouts/sidebar/featureMenuItems.generated';

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
      ...buildGeneratedFeatureMenuItems(t),
    ];

    if (isDev) {
      items.push({
        key: 'documentation',
        label: t('nav.documentation'),
        path: '/documentation',
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

    items.push({
      key: 'settings',
      label: t('nav.settings'),
      path: '/settings',
      icon: <SettingsIcon />,
    });

    return items;
  }, [t, isDev]);

  return { menuItems };
}
