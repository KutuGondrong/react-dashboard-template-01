import type { PaginatedResult } from '@/models/model.type';
import type { OrdersItem } from '@/features/orders/hooks/useOrdersPage';

const MOCK_ORDERS_COUNT = 50;

function buildMockOrdersItems(count: number): OrdersItem[] {
  return Array.from({ length: count }, (_, index) => {
    const num = index + 1;
    return {
      id: `orders_${String(num).padStart(3, '0')}`,
      name: `Orders ${num}`,
      isActive: index % 4 !== 0,
    };
  });
}

const MOCK_ORDERS_ITEMS: OrdersItem[] = buildMockOrdersItems(MOCK_ORDERS_COUNT);

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
