import { useCallback, useEffect, useState } from 'react';
import type {
  BarChartData,
  DashboardInsights,
  DashboardStats,
  DonutChartData,
  LineChartData,
} from '@/models/model.type';
import { dashboardUsecase } from '@/features/dashboard/usecase/dashboardUsecase';

export function useDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<LineChartData | null>(null);
  const [activityChart, setActivityChart] = useState<BarChartData | null>(null);
  const [userDistribution, setUserDistribution] = useState<DonutChartData | null>(null);
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, revenue, activity, distribution, insightsData] = await Promise.all([
        dashboardUsecase.getStats(),
        dashboardUsecase.getRevenueChart(),
        dashboardUsecase.getActivityChart(),
        dashboardUsecase.getUserDistribution(),
        dashboardUsecase.getInsights(),
      ]);
      setStats(statsData);
      setRevenueChart(revenue);
      setActivityChart(activity);
      setUserDistribution(distribution);
      setInsights(insightsData);
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    revenueChart,
    activityChart,
    userDistribution,
    insights,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
