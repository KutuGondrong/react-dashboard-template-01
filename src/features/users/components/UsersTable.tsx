import { useMemo, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn, User } from '@/models/model.type';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { useUsersPage } from '@/features/users/hooks/useUsersPage';
import { UserEditDrawer } from '@/features/users/components/UserEditDrawer';
import { UserDeleteDrawer } from '@/features/users/components/UserDeleteDrawer';
import { UserBulkDeleteDrawer } from '@/features/users/components/UserBulkDeleteDrawer';

export function UsersTable() {
  const { t } = useLocale();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const {
    users,
    isLoading,
    selectedIds,
    setSelectedIds,
    page,
    setPage,
    pageSize,
    totalPages,
    totalItems,
    onPageSizeChange,
    updateUser,
    deleteUser,
    deleteUsers,
  } = useUsersPage();

  const columns = useMemo<TableColumn<User>[]>(
    () => [
      {
        key: 'fullName',
        header: t('components.common.name'),
        sortable: true,
        render: (user) => (
          <div className="flex items-center gap-3">
            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
            <span>{user.fullName}</span>
          </div>
        ),
      },
      {
        key: 'email',
        header: t('components.common.email'),
        sortable: true,
      },
      {
        key: 'role',
        header: t('components.common.role'),
        render: (user) => (
          <Badge
            variant={
              user.role === 'admin' ? 'primary' : user.role === 'moderator' ? 'info' : 'default'
            }
          >
            {user.role}
          </Badge>
        ),
      },
      {
        key: 'isActive',
        header: t('components.common.status'),
        transform: (value) =>
          value ? (
            <Badge variant="success" dot>
              {t('components.common.active')}
            </Badge>
          ) : (
            <Badge variant="danger" dot>
              {t('components.common.inactive')}
            </Badge>
          ),
      },
      {
        key: 'actions',
        header: t('components.common.actions'),
        render: (user) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
              {t('components.common.edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeletingUser(user)}>
              {t('components.common.delete')}
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  return (
    <>
      <DataTableGroup>
        <DataTable
          unwrapped
          data={users}
          columns={columns}
          isLoading={isLoading}
          rowSelection="checkbox"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          renderSelectionActions={({ selectedIds: ids }) => (
            <Button variant="danger" size="sm" onClick={() => setBulkDeleteOpen(true)}>
              {t('components.common.delete')} ({ids.length})
            </Button>
          )}
        />
        <DataTableGroup.Footer>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={onPageSizeChange}
          />
        </DataTableGroup.Footer>
      </DataTableGroup>

      <UserEditDrawer
        isOpen={editingUser !== null}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={(payload) => {
          if (editingUser) updateUser(editingUser.id, payload);
        }}
      />

      <UserDeleteDrawer
        isOpen={deletingUser !== null}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onDelete={() => {
          if (deletingUser) deleteUser(deletingUser.id);
        }}
      />

      <UserBulkDeleteDrawer
        isOpen={bulkDeleteOpen}
        users={users.filter((user) => selectedIds.includes(user.id))}
        onClose={() => setBulkDeleteOpen(false)}
        onDelete={() => deleteUsers(selectedIds)}
      />
    </>
  );
}
