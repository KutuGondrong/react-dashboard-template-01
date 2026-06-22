import { useEffect, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { User } from '@/models/model.type';
import { Drawer } from '@/components/Drawer';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { ConfirmDialog } from '@/components/Modal';

interface UserDeleteDrawerProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onDelete: () => void;
}

export function UserDeleteDrawer({ isOpen, user, onClose, onDelete }: UserDeleteDrawerProps) {
  const { t } = useLocale();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={t('users.deleteTitle')}
        description={t('users.deleteDescription')}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={onClose}>
              {t('components.common.cancel')}
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              {t('components.common.delete')}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label={t('components.common.name')}
            value={user?.fullName ?? ''}
            readOnly
            debounceSeconds={0}
          />
          <Input
            label={t('components.common.email')}
            type="email"
            value={user?.email ?? ''}
            readOnly
            debounceSeconds={0}
          />
          <div>
            <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('components.common.role')}
            </p>
            {user && (
              <Badge
                variant={
                  user.role === 'admin' ? 'primary' : user.role === 'moderator' ? 'info' : 'default'
                }
              >
                {user.role}
              </Badge>
            )}
          </div>
          <div>
            <p className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('components.common.status')}
            </p>
            {user && (
              <Badge variant={user.isActive ? 'success' : 'danger'} dot>
                {user.isActive ? t('components.common.active') : t('components.common.inactive')}
              </Badge>
            )}
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title={t('users.deleteTitle')}
        message={t('users.deleteMessage', { name: user?.fullName ?? '' })}
        confirmLabel={t('components.common.delete')}
        cancelLabel={t('components.common.cancel')}
        variant="danger"
      />
    </>
  );
}
