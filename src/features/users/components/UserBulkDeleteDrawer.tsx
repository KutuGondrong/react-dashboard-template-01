import { useLocale } from '@/context/LocaleContext';
import type { User } from '@/models/model.type';
import { Drawer } from '@/components/Drawer';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { useModal } from '@/components/Modal';

interface UserBulkDeleteDrawerProps {
  isOpen: boolean;
  users: User[];
  onClose: () => void;
  onDelete: () => void;
}

export function UserBulkDeleteDrawer({
  isOpen,
  users,
  onClose,
  onDelete,
}: UserBulkDeleteDrawerProps) {
  const { t } = useLocale();
  const { confirm } = useModal();

  const handleDeleteClick = async () => {
    const confirmed = await confirm({
      title: t('users.bulkDeleteTitle'),
      message: t('users.bulkDeleteMessage', { count: users.length }),
      confirmLabel: t('components.common.delete'),
      cancelLabel: t('components.common.cancel'),
      variant: 'danger',
    });

    if (confirmed) {
      onDelete();
      onClose();
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={t('users.bulkDeleteTitle')}
      description={t('users.bulkDeleteDescription', { count: users.length })}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('components.common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteClick}>
            {t('components.common.delete')}
          </Button>
        </>
      }
    >
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map((user) => (
          <li key={user.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900 dark:text-white">{user.fullName}</p>
              <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <Badge
              variant={
                user.role === 'admin' ? 'primary' : user.role === 'moderator' ? 'info' : 'default'
              }
            >
              {user.role}
            </Badge>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
