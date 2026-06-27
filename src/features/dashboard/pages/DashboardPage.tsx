import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/Button';
import {
  DashboardCharts,
  DashboardChartsSkeleton,
} from '@/features/dashboard/components/DashboardCharts';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import {
  DashboardStatsCards,
  DashboardStatsSkeleton,
} from '@/features/dashboard/components/DashboardStatsCards';
import { useDashboardPage } from '@/features/dashboard/hooks/useDashboardPage';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const { stats, revenueChart, activityChart, userDistribution, isLoading, error, refetch } =
    useDashboardPage();

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        user={user}
      />

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{t('dashboard.loadError')}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            {t('components.common.retry')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <>
          <DashboardStatsSkeleton />
          <DashboardChartsSkeleton />
        </>
      ) : (
        stats &&
        revenueChart &&
        activityChart &&
        userDistribution && (
          <>
            <DashboardStatsCards stats={stats} resolveLabel={t} />
            <DashboardCharts
              revenueChart={revenueChart}
              activityChart={activityChart}
              userDistribution={userDistribution}
              resolveLabel={t}
            />
          </>
        )
      )}
    </div>
  );
}
