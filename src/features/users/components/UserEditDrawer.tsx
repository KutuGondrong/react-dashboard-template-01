import { useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { SelectOption, User, UserRole } from '@/models/model.type';
import type { ModelPayload } from '@/models/model.payload';
import { Drawer } from '@/components/Drawer';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ComboBox } from '@/components/ComboBox';
import { ConfirmDialog } from '@/components/Modal';

interface UserEditDrawerProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (payload: ModelPayload<User, 'fullName' | 'email' | 'role' | 'isActive'>) => void;
}

export function UserEditDrawer({ isOpen, user, onClose, onSave }: UserEditDrawerProps) {
  const { t } = useLocale();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isActive, setIsActive] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFullName(user.fullName);
      setEmail(user.email);
      setRole(user.role);
      setIsActive(user.isActive);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowSaveConfirm(false);
    }
  }, [isOpen]);

  const roleOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'admin', label: 'Admin' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'user', label: t('dashboard.charts.user') },
    ],
    [t],
  );

  const statusOptions = useMemo<SelectOption[]>(
    () => [
      { value: 'true', label: t('components.common.active') },
      { value: 'false', label: t('components.common.inactive') },
    ],
    [t],
  );

  const handleSaveConfirm = () => {
    onSave({ fullName, email, role, isActive });
    setShowSaveConfirm(false);
    onClose();
  };

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={t('users.editTitle')}
        description={t('users.editDescription')}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={onClose}>
              {t('components.common.cancel')}
            </Button>
            <Button onClick={() => setShowSaveConfirm(true)}>{t('components.common.save')}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label={t('components.common.name')}
            value={fullName}
            debounceSeconds={0}
            onChange={(event) => setFullName(event.target.value)}
          />
          <Input
            label={t('components.common.email')}
            type="email"
            value={email}
            debounceSeconds={0}
            onChange={(event) => setEmail(event.target.value)}
          />
          <ComboBox
            label={t('components.common.role')}
            options={roleOptions}
            value={role}
            onChange={(option) => setRole(option.value as UserRole)}
            searchable={false}
          />
          <ComboBox
            label={t('components.common.status')}
            options={statusOptions}
            value={String(isActive)}
            onChange={(option) => setIsActive(option.value === 'true')}
            searchable={false}
          />
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSaveConfirm}
        title={t('users.saveTitle')}
        message={t('users.saveMessage', { name: user?.fullName ?? '' })}
        confirmLabel={t('components.common.save')}
        cancelLabel={t('components.common.cancel')}
        variant="primary"
      />
    </>
  );
}
