import { useMemo, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn, User } from '@/models/model.type';
import { DataTable, DataTableActionButton } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { useUsersPage } from '@/features/users/hooks/useUsersPage';
import { UserEditDrawer } from '@/features/users/components/UserEditDrawer';
import { UserDeleteDrawer } from '@/features/users/components/UserDeleteDrawer';

export function UsersTable() {
  const { t } = useLocale();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
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
        render: (user) => (
          <Badge variant={user.isActive ? 'success' : 'danger'} dot>
            {user.isActive ? t('components.common.active') : t('components.common.inactive')}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        rowSelection="checkbox"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={onPageSizeChange}
        renderActions={(user) => (
          <>
            <DataTableActionButton onClick={() => setEditingUser(user)}>
              {t('components.common.edit')}
            </DataTableActionButton>
            <DataTableActionButton onClick={() => setDeletingUser(user)} variant="danger">
              {t('components.common.delete')}
            </DataTableActionButton>
          </>
        )}
      />

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
    </>
  );
}
