import type {
  ApiAuthResponse,
  ApiBarChartResponse,
  ApiChartDataPointResponse,
  ApiDashboardInsightsResponse,
  ApiDashboardStatsResponse,
  ApiDonutChartResponse,
  ApiLineChartResponse,
  ApiPaginatedResponse,
  ApiUserResponse,
} from './model.response';
import {
  DEFAULT_CHART_COLOR_TOKEN,
  isChartColorToken,
  type ChartColorToken,
} from '@/config/color.tokens';
import type {
  AuthSession,
  BarChartData,
  ChartDataPoint,
  DashboardStat,
  DashboardStats,
  DashboardInsightHighlight,
  DashboardInsightSummaryItem,
  DashboardInsights,
  DashboardInsightTone,
  DonutChartData,
  DonutSegment,
  LineChartData,
  PaginatedResult,
  TrendDirection,
  User,
  UserRole,
} from './model.type';

function mapRole(role: string): UserRole {
  const normalized = role.toLowerCase();
  if (normalized === 'admin' || normalized === 'moderator' || normalized === 'user') {
    return normalized;
  }
  return 'user';
}

export function toUser(apiUser: ApiUserResponse): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.full_name,
    role: mapRole(apiUser.role),
    avatarUrl: apiUser.avatar_url,
    createdAt: new Date(apiUser.created_at),
    isActive: apiUser.is_active,
  };
}

export function toAuthSession(response: ApiAuthResponse): AuthSession {
  return {
    token: response.token,
    user: toUser(response.user),
    expiresAt: new Date(response.expires_at),
  };
}

export function toPaginatedUsers(
  response: ApiPaginatedResponse<ApiUserResponse>,
): PaginatedResult<User> {
  return {
    data: response.data.map(toUser),
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
    totalPages: response.total_pages,
  };
}

function mapTrend(trend: string): TrendDirection {
  if (trend === 'up' || trend === 'down' || trend === 'neutral') {
    return trend;
  }
  return 'neutral';
}

function toChartDataPoint(point: ApiChartDataPointResponse): ChartDataPoint {
  return {
    label: point.label,
    value: point.value,
    ...(point.color_token ? { colorToken: mapColorToken(point.color_token) } : {}),
  };
}

export function toDashboardStats(response: ApiDashboardStatsResponse): DashboardStats {
  return {
    stats: response.stats.map(
      (item): DashboardStat => ({
        id: item.id,
        labelKey: item.label_key,
        value: item.value,
        changePercent: item.change_percent,
        trend: mapTrend(item.trend),
      }),
    ),
    updatedAt: new Date(response.updated_at),
  };
}

export function toLineChartData(response: ApiLineChartResponse): LineChartData {
  return {
    id: response.id,
    titleKey: response.title_key,
    points: response.data.map(toChartDataPoint),
    unit: response.unit,
  };
}

export function toBarChartData(response: ApiBarChartResponse): BarChartData {
  return {
    id: response.id,
    titleKey: response.title_key,
    points: response.data.map(toChartDataPoint),
  };
}

function mapColorToken(token: string): ChartColorToken {
  return isChartColorToken(token) ? token : DEFAULT_CHART_COLOR_TOKEN;
}

export function toDonutChartData(response: ApiDonutChartResponse): DonutChartData {
  return {
    id: response.id,
    titleKey: response.title_key,
    segments: response.segments.map(
      (segment): DonutSegment => ({
        labelKey: segment.label_key,
        value: segment.value,
        colorToken: mapColorToken(segment.color_token),
      }),
    ),
    total: response.total,
  };
}

function mapInsightTone(tone: string): DashboardInsightTone {
  if (tone === 'success' || tone === 'info' || tone === 'warning' || tone === 'primary') {
    return tone;
  }
  return 'info';
}

export function toDashboardInsights(response: ApiDashboardInsightsResponse): DashboardInsights {
  return {
    highlights: response.highlights.map(
      (item): DashboardInsightHighlight => ({
        id: item.id,
        badgeKey: item.badge_key,
        titleKey: item.title_key,
        descriptionKey: item.description_key,
        tone: mapInsightTone(item.tone),
        ...(item.href ? { href: item.href } : {}),
        ...(item.action_key ? { actionKey: item.action_key } : {}),
      }),
    ),
    summaryTitleKey: response.summary_title_key,
    summaryItems: response.summary_items.map(
      (item): DashboardInsightSummaryItem => ({
        id: item.id,
        labelKey: item.label_key,
        valueKey: item.value_key,
        tone: mapInsightTone(item.tone),
      }),
    ),
    updatedAt: new Date(response.updated_at),
  };
}
