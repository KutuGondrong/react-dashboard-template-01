import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/Button';
import {
  DashboardCharts,
  DashboardChartsSkeleton,
} from '@/features/dashboard/components/DashboardCharts';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardInsightsSection } from '@/features/dashboard/components/DashboardInsights';
import { DashboardProfileCard } from '@/features/dashboard/components/DashboardProfileCard';
import {
  DashboardStatsCards,
  DashboardStatsSkeleton,
} from '@/features/dashboard/components/DashboardStatsCards';
import { DashboardUserDistribution } from '@/features/dashboard/components/DashboardUserDistribution';
import { useDashboardPage } from '@/features/dashboard/hooks/useDashboardPage';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const {
    stats,
    revenueChart,
    activityChart,
    userDistribution,
    insights,
    isLoading,
    error,
    refetch,
  } = useDashboardPage();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-stretch">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-stretch">
            <DashboardHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />
            {user && <DashboardProfileCard user={user} />}
          </div>
          {isLoading ? (
            <DashboardStatsSkeleton />
          ) : (
            stats && <DashboardStatsCards stats={stats} resolveLabel={t} />
          )}
        </div>
        <DashboardUserDistribution
          userDistribution={userDistribution}
          resolveLabel={t}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{t('dashboard.loadError')}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            {t('components.common.retry')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <DashboardChartsSkeleton />
      ) : (
        revenueChart &&
        activityChart && (
          <DashboardCharts
            revenueChart={revenueChart}
            activityChart={activityChart}
            resolveLabel={t}
          />
        )
      )}

      <DashboardInsightsSection insights={insights} resolveLabel={t} isLoading={isLoading} />
    </div>
  );
}
