import { Outlet } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { ScrollContainer } from '@/components/ScrollToTop';
import { Header } from '@/layouts/header';
import { Sidebar } from '@/layouts/sidebar';
import { MobileNavDrawer } from '@/layouts/sidebar/components/MobileNavDrawer';
import { Footer } from '@/layouts/footer';
import { cn } from '@/components/Layout/layoutUtils';
import { useMainLayout } from '@/layouts/main-layout/hooks/useMainLayout';
import { layoutSurfaces } from '@/layouts/main-layout/layoutSurfaces';
import { ScrollProvider } from '@/context/ScrollContext';

export function MainLayout() {
  const { sidebarCollapsed, onSidebarCollapse, mobileNavOpen, toggleMobileNav, closeMobileNav } =
    useMainLayout();
  return (
    <ScrollProvider>
      <Layout
        className={cn(
          'relative flex h-screen min-h-0 flex-col overflow-hidden rounded-none border-0',
          layoutSurfaces.canvas,
        )}
      >
        <AnimatedBackground variant="dashboard" />
        <Layout.Header
          sticky
          className={cn('relative z-40 !border-0 px-3 sm:px-4 lg:px-6', layoutSurfaces.header)}
        >
          <Header onMenuToggle={toggleMobileNav} isMobileNavOpen={mobileNavOpen} />
        </Layout.Header>
        <MobileNavDrawer isOpen={mobileNavOpen} onClose={closeMobileNav} />
        <Layout hasSider className="relative min-h-0 flex-1 rounded-none border-0 bg-transparent">
          <Layout.Sider
            width={256}
            collapsedWidth={72}
            collapsed={sidebarCollapsed}
            trigger={null}
            className={cn(
              'hidden min-h-0 shrink-0 p-0 lg:z-30 lg:flex',
              layoutSurfaces.nav,
              '[&>div]:scrollbar-hide [&>div]:flex [&>div]:min-h-0 [&>div]:flex-col [&>div]:!overflow-visible [&>div]:p-0',
              '!overflow-visible !border-0',
            )}
          >
            <Sidebar collapsed={sidebarCollapsed} onCollapse={onSidebarCollapse} />
          </Layout.Sider>
          <ScrollContainer
            className={cn(
              'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden !p-0',
              layoutSurfaces.main,
            )}
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex min-h-0 flex-1 flex-col overflow-auto p-3 sm:p-4 lg:p-6">
                <Outlet />
              </div>
              <Layout.Footer
                className={cn(
                  'relative shrink-0 !border-0 px-3 py-3 text-center sm:px-4 sm:py-4 sm:text-left lg:px-6',
                  layoutSurfaces.footer,
                )}
              >
                <Footer />
              </Layout.Footer>
            </div>
          </ScrollContainer>
        </Layout>
      </Layout>
    </ScrollProvider>
  );
}
