import { useCallback, useState } from 'react';

export function useMainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSidebarCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const openMobileNav = useCallback(() => {
    setMobileNavOpen(true);
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((open) => !open);
  }, []);

  return {
    sidebarCollapsed,
    onSidebarCollapse: handleSidebarCollapse,
    mobileNavOpen,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
  };
}
