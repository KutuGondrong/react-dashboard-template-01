import { NavMenu } from '@/components/NavMenu';
import { useSidebar } from '@/layouts/sidebar/hooks/useSidebar';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  collapsible?: boolean;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed = false,
  onCollapse,
  collapsible = true,
  className,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { menuItems } = useSidebar();

  return (
    <NavMenu
      items={menuItems}
      collapsed={collapsible ? collapsed : false}
      onCollapse={onCollapse}
      collapsible={collapsible}
      collapseTriggerPosition="top-peek"
      childConnector="tree"
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
      className={className ?? 'h-full min-h-0 w-full flex-1'}
    />
  );
}
