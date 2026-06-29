/**
 * Sidebar entries for publisher landing routes (see devLandingRoutes.tsx).
 *
 * To hide: stop spreading this in useSidebar.tsx and follow devLandingRoutes.tsx notes.
 */
import type { NavMenuItem } from '@/components/NavMenu';
import { StorybookIcon, TutorialIcon } from '@/layouts/sidebar/components/SidebarIcons';

const COMPONENTS_PATH = '/components';

export function buildDevLandingMenuItems(t: (key: string) => string): NavMenuItem[] {
  return [
    {
      key: 'documentation',
      label: t('nav.documentation'),
      path: '/documentation',
      icon: <TutorialIcon />,
      devBadge: true,
    },
    {
      key: 'components',
      label: t('nav.components'),
      path: COMPONENTS_PATH,
      icon: <StorybookIcon />,
      devBadge: true,
    },
  ];
}
