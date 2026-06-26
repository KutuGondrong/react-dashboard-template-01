import { AppShell } from '@/AppShell';
import { useFeatureScaffoldHotReload } from '@/router/useFeatureScaffoldHotReload';

/** Dev-only entry: hot-reloads routes after `make feature`. */
export function AppDevelopment() {
  const { router, routerKey } = useFeatureScaffoldHotReload();

  return <AppShell router={router} routerKey={routerKey} />;
}
