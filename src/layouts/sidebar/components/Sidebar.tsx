import { NavMenu } from '@/components/NavMenu';
import { useSidebar } from '@/layouts/sidebar/hooks/useSidebar';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  collapsible?: boolean;
  embedded?: boolean;
  className?: string;
}

export function Sidebar({
  collapsed = false,
  onCollapse,
  collapsible = true,
  embedded = false,
  className,
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
      className={className ?? 'h-full min-h-0 w-full flex-1'}
    />
  );
}
