import { Outlet } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { ScrollProvider } from '@/context/ScrollContext';
import { AuthLayoutCard } from '@/layouts/main-layout/components/AuthLayoutCard';
import { AuthLayoutToolbar } from '@/layouts/main-layout/components/AuthLayoutToolbar';

export function AuthLayout() {
  return (
    <ScrollProvider>
      <Layout className="relative min-h-screen overflow-hidden rounded-none border-0">
        <AnimatedBackground variant="auth" />
        <AuthLayoutToolbar />
        <Layout.Content className="relative flex min-h-screen items-center justify-center border-0 bg-transparent px-4 py-8 sm:px-6 sm:py-12">
          <AuthLayoutCard>
            <Outlet />
          </AuthLayoutCard>
        </Layout.Content>
      </Layout>
    </ScrollProvider>
  );
}
