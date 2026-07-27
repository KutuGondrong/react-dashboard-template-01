import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CardSkeleton } from '@/components/SkeletonLoader';
import { Typography } from '@/components/Typography';
import {
  DashboardCharts,
  DashboardChartsSkeleton,
} from '@/features/dashboard/components/DashboardCharts';
import { DashboardWelcomeRow } from '@/features/dashboard/components/DashboardWelcomeRow';
import {
  DashboardStatsCards,
  DashboardStatsSkeleton,
} from '@/features/dashboard/components/DashboardStatsCards';
import { DashboardUserDistribution } from '@/features/dashboard/components/DashboardUserDistribution';
import { useDashboardPage } from '@/features/dashboard/hooks/useDashboardPage';
import type { LocaleParams } from '@/locales/localeUtils';
import type { DashboardInsightTone, DashboardInsights } from '@/models/model.type';

const TEMPLATE_SAFE_HREFS = new Set(['/users', '/dashboard']);

function toTemplateInsights(insights: DashboardInsights | null): DashboardInsights | null {
  if (!insights) return null;
  return {
    ...insights,
    highlights: insights.highlights.filter(
      (highlight) => highlight.href && TEMPLATE_SAFE_HREFS.has(highlight.href),
    ),
  };
}

function toneToBadgeVariant(
  tone: DashboardInsightTone,
): 'success' | 'info' | 'warning' | 'primary' {
  return tone;
}

function formatUpdatedAt(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function TemplateInsightsSection({
  insights,
  resolveLabel,
  isLoading = false,
}: {
  insights?: DashboardInsights | null;
  resolveLabel: (key: string, params?: LocaleParams) => string;
  isLoading?: boolean;
}) {
  if (isLoading || !insights) {
    return (
      <section className="space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CardSkeleton />
          <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 h-5 w-36 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const highlight = insights.highlights[0];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Typography.Title level={3} className="!text-lg sm:!text-xl">
            {resolveLabel('dashboard.insights.title')}
          </Typography.Title>
          <Typography.Text color="muted" className="text-sm">
            {resolveLabel('dashboard.insights.subtitle')}
          </Typography.Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" dot>
            {resolveLabel('dashboard.insights.live')}
          </Badge>
          <Typography.Caption color="muted">
            {resolveLabel('dashboard.insights.updatedAt', {
              time: formatUpdatedAt(insights.updatedAt),
            })}
          </Typography.Caption>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        {highlight ? (
          <Card
            variant="alternate"
            description={resolveLabel(highlight.descriptionKey)}
            actionLabel={highlight.actionKey ? resolveLabel(highlight.actionKey) : undefined}
            href={highlight.href}
            clickable={Boolean(highlight.href)}
            className="h-full"
          >
            <Badge variant={toneToBadgeVariant(highlight.tone)} size="sm">
              {resolveLabel(highlight.badgeKey)}
            </Badge>
            <Typography.Text
              weight="semibold"
              className="mt-3 block w-full text-base text-gray-900 dark:text-gray-100"
            >
              {resolveLabel(highlight.titleKey)}
            </Typography.Text>
          </Card>
        ) : null}

        <Card title={resolveLabel(insights.summaryTitleKey)} variant="default" className="h-full">
          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {insights.summaryItems.map((item) => (
              <div
                key={item.id}
                className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-gray-700/60 dark:bg-gray-800/50"
              >
                <Typography.Text color="muted" className="text-sm">
                  {resolveLabel(item.labelKey)}
                </Typography.Text>
                <Badge variant={toneToBadgeVariant(item.tone)} size="sm" className="shrink-0">
                  {resolveLabel(item.valueKey)}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

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
  const templateInsights = toTemplateInsights(insights);

  return (
    <div className="space-y-6">
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

      <TemplateInsightsSection insights={templateInsights} resolveLabel={t} isLoading={isLoading} />
    </div>
  );
}
