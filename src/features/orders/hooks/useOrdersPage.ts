import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/config/app.config';
import { ordersUsecase } from '@/features/orders/usecase/ordersUsecase';

export interface OrdersItem {
  id: string;
  name: string;
  isActive: boolean;
}

export function useOrdersPage() {
  const [items, setItems] = useState<OrdersItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(appConfig.paginationDefaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ordersUsecase.getItems(page, pageSize);
      setItems(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    items,
    isLoading,
    page,
    setPage: handlePageChange,
    pageSize,
    totalPages,
    totalItems,
    onPageSizeChange: handlePageSizeChange,
  };
}
