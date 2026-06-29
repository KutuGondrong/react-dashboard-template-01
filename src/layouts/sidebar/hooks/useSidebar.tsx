import { useMemo } from 'react';
import { isDevFeaturesEnabled } from '@/config/devFeatures';
import { useLocale } from '@/context/LocaleContext';
import type { NavMenuItem } from '@/components/NavMenu';
import { SettingsIcon } from '@/layouts/sidebar/components/SidebarIcons';
import { buildDevLandingMenuItems } from '@/layouts/sidebar/devLandingMenuItems';
import { buildFeatureMenuItems } from '@/layouts/sidebar/featureMenuItems';
import { buildFeatureMenuItemsGenerate } from '@/layouts/sidebar/featureMenuItemsGenerate';

export function useSidebar() {
  const { t } = useLocale();
  const isDev = isDevFeaturesEnabled;

  const menuItems = useMemo<NavMenuItem[]>(() => {
    const items: NavMenuItem[] = [
      ...buildFeatureMenuItems(t),
      ...buildFeatureMenuItemsGenerate(t),
    ];

    if (isDev) {
      items.push(...buildDevLandingMenuItems(t));
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
