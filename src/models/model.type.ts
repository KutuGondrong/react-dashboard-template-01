import type { ReactNode } from 'react';
import type { ChartColorToken } from '@/config/color.tokens';

export type UserRole = 'admin' | 'user' | 'moderator';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: Date;
  isActive: boolean;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ComponentState = 'default' | 'active' | 'disabled' | 'loading' | 'error' | 'success';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  /** Field path — supports dot notation for nested objects, e.g. "profile.department" or "a.a1". */
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  /** Transform raw cell value before display — enum labels, formatting, custom UI, etc. */
  transform?: (value: unknown, item: T) => ReactNode;
  className?: string;
}

export interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  /** True setelah handler memanggil onProgress — kontrol tampilan progress bar */
  reportsProgress?: boolean;
}

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'processing';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  position?: ToastPosition;
}

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface DashboardStat {
  id: string;
  labelKey: string;
  value: number;
  changePercent: number;
  trend: TrendDirection;
}

export interface DashboardStats {
  stats: DashboardStat[];
  updatedAt: Date;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  colorToken?: ChartColorToken;
}

export interface LineChartData {
  id: string;
  titleKey: string;
  points: ChartDataPoint[];
  unit?: string;
}

export interface BarChartData {
  id: string;
  titleKey: string;
  points: ChartDataPoint[];
}

export interface DonutSegment {
  labelKey: string;
  value: number;
  colorToken: ChartColorToken;
}

export interface DonutChartData {
  id: string;
  titleKey: string;
  segments: DonutSegment[];
  total: number;
}

export type DashboardInsightTone = 'success' | 'info' | 'warning' | 'primary';

export interface DashboardInsightHighlight {
  id: string;
  badgeKey: string;
  titleKey: string;
  descriptionKey: string;
  tone: DashboardInsightTone;
  href?: string;
  actionKey?: string;
}

export interface DashboardInsightSummaryItem {
  id: string;
  labelKey: string;
  valueKey: string;
  tone: DashboardInsightTone;
}

export interface DashboardInsights {
  highlights: DashboardInsightHighlight[];
  summaryTitleKey: string;
  summaryItems: DashboardInsightSummaryItem[];
  updatedAt: Date;
}
