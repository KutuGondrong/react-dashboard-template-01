import type { PaginatedResult } from '@/models/model.type';
import type { InventoryItem } from '@/features/inventory/hooks/useInventoryPage';

const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inventory_001', name: 'Inventory A', isActive: true },
  { id: 'inventory_002', name: 'Inventory B', isActive: true },
  { id: 'inventory_003', name: 'Inventory C', isActive: false },
  { id: 'inventory_004', name: 'Inventory D', isActive: true },
  { id: 'inventory_005', name: 'Inventory E', isActive: true },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const inventoryUsecase = {
  async getItems(page: number, pageSize: number): Promise<PaginatedResult<InventoryItem>> {
    await delay(500);
    const start = (page - 1) * pageSize;
    const data = MOCK_INVENTORY_ITEMS.slice(start, start + pageSize);
    return {
      data,
      total: MOCK_INVENTORY_ITEMS.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(MOCK_INVENTORY_ITEMS.length / pageSize)),
    };
  },
};
