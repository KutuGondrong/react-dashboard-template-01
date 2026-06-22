import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/config/app.config';
import type { User } from '@/models/model.type';
import type { ModelPayload } from '@/models/model.payload';
import { usersUsecase } from '@/features/users/usecase/usersUsecase';

export function useUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(appConfig.paginationDefaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await usersUsecase.getUsers(page, pageSize);
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setSelectedIds([]);
  }, [page, pageSize]);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const updateUser = useCallback(
    (userId: string, payload: ModelPayload<User, 'fullName' | 'email' | 'role' | 'isActive'>) => {
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...payload } : user)));
    },
    [],
  );

  const deleteUser = useCallback(
    (userId: string) => {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setSelectedIds((prev) => prev.filter((id) => id !== userId));
      setTotalItems((prevTotal) => {
        const nextTotal = Math.max(0, prevTotal - 1);
        const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
        setTotalPages(nextTotalPages);
        setPage((currentPage) => Math.min(currentPage, nextTotalPages));
        return nextTotal;
      });
    },
    [pageSize],
  );

  return {
    users,
    isLoading,
    selectedIds,
    setSelectedIds,
    page,
    setPage: handlePageChange,
    pageSize,
    totalPages,
    totalItems,
    onPageSizeChange: handlePageSizeChange,
    updateUser,
    deleteUser,
  };
}
