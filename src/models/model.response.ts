export interface ApiUserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  is_active: boolean;
}

export interface ApiAuthResponse {
  token: string;
  user: ApiUserResponse;
  expires_at: string;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiUserListResponse extends ApiPaginatedResponse<ApiUserResponse> {}

export interface ApiDashboardStatItemResponse {
  id: string;
  label_key: string;
  value: number;
  change_percent: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ApiDashboardStatsResponse {
  stats: ApiDashboardStatItemResponse[];
  updated_at: string;
}

export interface ApiChartDataPointResponse {
  label: string;
  value: number;
  color_token?: string;
}

export interface ApiLineChartResponse {
  id: string;
  title_key: string;
  data: ApiChartDataPointResponse[];
  unit?: string;
}

export interface ApiBarChartResponse {
  id: string;
  title_key: string;
  data: ApiChartDataPointResponse[];
}

export interface ApiDonutSegmentResponse {
  label_key: string;
  value: number;
  color_token: string;
}

export interface ApiDonutChartResponse {
  id: string;
  title_key: string;
  segments: ApiDonutSegmentResponse[];
  total: number;
}
