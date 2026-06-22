import type { PaginatedResult } from '@/models/model.type';
import type { OrdersItem } from '@/features/orders/hooks/useOrdersPage';

const MOCK_ORDERS_ITEMS: OrdersItem[] = [
  { id: 'orders_001', name: 'Orders A', isActive: true },
  { id: 'orders_002', name: 'Orders B', isActive: true },
  { id: 'orders_003', name: 'Orders C', isActive: false },
  { id: 'orders_004', name: 'Orders D', isActive: true },
  { id: 'orders_005', name: 'Orders E', isActive: true },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const ordersUsecase = {
  async getItems(page: number, pageSize: number): Promise<PaginatedResult<OrdersItem>> {
    await delay(500);
    const start = (page - 1) * pageSize;
    const data = MOCK_ORDERS_ITEMS.slice(start, start + pageSize);
    return {
      data,
      total: MOCK_ORDERS_ITEMS.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(MOCK_ORDERS_ITEMS.length / pageSize)),
    };
  },
};
