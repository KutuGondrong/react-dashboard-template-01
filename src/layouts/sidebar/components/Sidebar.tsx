import { NavMenu } from '@/components/NavMenu';
import { useSidebar } from '@/layouts/sidebar/hooks/useSidebar';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  collapsible?: boolean;
  embedded?: boolean;
  className?: string;
  onMenuDismiss?: () => void;
}

export function Sidebar({
  collapsed = false,
  onCollapse,
  collapsible = true,
  embedded = false,
  className,
  onMenuDismiss,
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
      embedded={embedded}
      onMenuDismiss={onMenuDismiss}
      className={className ?? 'h-full min-h-0 w-full flex-1'}
    />
  );
}
