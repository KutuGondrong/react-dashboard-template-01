import { AppShell } from '@/AppShell';
import { useFeatureScaffoldHotReload } from '@/router/useFeatureScaffoldHotReload';

export function AppDevelopment() {
  const { router, routerKey } = useFeatureScaffoldHotReload();

  return <AppShell router={router} routerKey={routerKey} />;
}
