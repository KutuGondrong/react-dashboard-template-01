import { NavMenu } from '@/components/NavMenu';
import { useSidebar } from '@/layouts/sidebar/hooks/useSidebar';

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  collapsible?: boolean;
  className?: string;
}

export function Sidebar({
  collapsed = false,
  onCollapse,
  collapsible = true,
  className,
}: SidebarProps) {
  const { menuItems } = useSidebar();

  return (
    <NavMenu
      items={menuItems}
      collapsed={collapsible ? collapsed : false}
      onCollapse={onCollapse}
      collapsible={collapsible}
      collapseTriggerPosition="top"
      childConnector="tree"
      className={className ?? 'h-full'}
    />
  );
}
