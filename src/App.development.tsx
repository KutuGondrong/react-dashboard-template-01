import { AppShell } from '@/AppShell';
import { useFeatureScaffoldHotReload } from '@/router/useFeatureScaffoldHotReload';

/** Dev-only entry: hot-reloads routes/menu/locale after `make feature`. */
export function AppDevelopment() {
  const { router, localeKey, routerKey } = useFeatureScaffoldHotReload();

  return <AppShell router={router} localeKey={localeKey} routerKey={routerKey} />;
}
