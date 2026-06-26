import { AppShell } from '@/AppShell';
import { AppDevelopment } from '@/App.development';
import { useStableAppRouter } from '@/router/useStableAppRouter';

function AppProduction() {
  const { router } = useStableAppRouter();

  return <AppShell router={router} />;
}

export function App() {
  if (import.meta.env.DEV) {
    return <AppDevelopment />;
  }

  return <AppProduction />;
}
