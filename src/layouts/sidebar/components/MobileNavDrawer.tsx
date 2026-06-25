import { Drawer } from '@/components/Drawer';
import { Sidebar } from '@/layouts/sidebar/components/Sidebar';
import { useLocale } from '@/context/LocaleContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const { t } = useLocale();

  return (
    <Drawer
      id="mobile-nav-drawer"
      isOpen={isOpen}
      onClose={onClose}
      title={t('components.common.menu')}
      placement="left"
      size="sm"
      contentClassName="!px-4 !pt-4 !pb-5"
      className="lg:hidden [&>div]:max-w-[85vw]"
    >
      <Sidebar embedded collapsible={false} className="min-h-full" />
    </Drawer>
  );
}
