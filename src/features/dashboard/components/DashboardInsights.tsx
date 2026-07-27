import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { CardSkeleton } from '@/components/SkeletonLoader';
import { Typography } from '@/components/Typography';
import type { LocaleParams } from '@/locales/localeUtils';
import type { DashboardInsightTone, DashboardInsights } from '@/models/model.type';

interface DashboardInsightsProps {
  insights?: DashboardInsights | null;
  resolveLabel: (key: string, params?: LocaleParams) => string;
  isLoading?: boolean;
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

export function DashboardInsightsSection({
  insights,
  resolveLabel,
  isLoading = false,
}: DashboardInsightsProps) {
  if (isLoading || !insights) {
    return <DashboardInsightsSkeleton />;
  }

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {insights.highlights.map((highlight) => (
          <Card
            key={highlight.id}
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
        ))}
      </div>

      <Card title={resolveLabel(insights.summaryTitleKey)} variant="default">
        <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
    </section>
  );
}

export function DashboardInsightsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 h-5 w-36 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    </section>
  );
}
