import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/Button';
import {
  DashboardCharts,
  DashboardChartsSkeleton,
} from '@/features/dashboard/components/DashboardCharts';
import { DashboardInsightsSection } from '@/features/dashboard/components/DashboardInsights';
import { DashboardWelcomeRow } from '@/features/dashboard/components/DashboardWelcomeRow';
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
      {/*
        One donut chart on the right — height comes from the full left stack
        (welcome + profile + stats). Welcome | profile stay side by side while
        the title fits on one line; otherwise profile moves below.
      */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,22rem)] lg:items-stretch">
        <div className="@container/dash flex min-w-0 flex-col gap-4">
          <DashboardWelcomeRow
            title={t('dashboard.title')}
            subtitle={t('dashboard.subtitle')}
            user={user}
          />
          {isLoading ? (
            <DashboardStatsSkeleton />
          ) : (
            stats && <DashboardStatsCards stats={stats} resolveLabel={t} />
          )}
        </div>

        <div className="min-h-0 w-full lg:relative">
          <div className="w-full lg:absolute lg:inset-0">
            <DashboardUserDistribution
              userDistribution={userDistribution}
              resolveLabel={t}
              isLoading={isLoading}
            />
          </div>
        </div>
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
