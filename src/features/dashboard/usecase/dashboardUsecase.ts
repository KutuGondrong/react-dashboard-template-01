import { apiRepository } from '@/datasource/network/apiRepository';
import {
  toBarChartData,
  toDashboardStats,
  toDonutChartData,
  toLineChartData,
} from '@/models/model.map';
import type {
  BarChartData,
  DashboardStats,
  DonutChartData,
  LineChartData,
} from '@/models/model.type';

export const dashboardUsecase = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiRepository.getDashboardStats();
    return toDashboardStats(response);
  },

  async getRevenueChart(): Promise<LineChartData> {
    const response = await apiRepository.getRevenueChart();
    return toLineChartData(response);
  },

  async getActivityChart(): Promise<BarChartData> {
    const response = await apiRepository.getActivityChart();
    return toBarChartData(response);
  },

  async getUserDistribution(): Promise<DonutChartData> {
    const response = await apiRepository.getUserDistributionChart();
    return toDonutChartData(response);
  },
};
