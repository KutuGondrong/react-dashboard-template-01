import { useHeader } from '@/layouts/header/hooks/useHeader';
import { HeaderLogo } from '@/layouts/header/components/HeaderLogo';
import { MobileMenuButton } from '@/layouts/header/components/MobileMenuButton';
import { LocaleToggle } from '@/layouts/header/components/LocaleToggle';
import { ThemeToggleButton } from '@/layouts/header/components/ThemeToggleButton';
import { ProfileMenu } from '@/layouts/header/components/ProfileMenu';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMobileNavOpen?: boolean;
}

export function Header({ onMenuToggle, isMobileNavOpen = false }: HeaderProps) {
  const {
    user,
    t,
    locale,
    setLocale,
    isDark,
    toggleTheme,
    isProfileOpen,
    profileRef,
    toggleProfile,
    handleSettings,
    handleLogout,
  } = useHeader();

  return (
    <div className="flex h-14 w-full items-center justify-between gap-2 lg:h-12">
      <div className="flex min-w-0 flex-1 items-center gap-1 lg:gap-2">
        {onMenuToggle && (
          <MobileMenuButton
            isOpen={isMobileNavOpen}
            onClick={onMenuToggle}
            label={t('components.common.openMenu')}
          />
        )}
        <HeaderLogo />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 lg:flex">
          <LocaleToggle locale={locale} onChange={setLocale} showLabels />

          <ThemeToggleButton
            isDark={isDark}
            label={isDark ? t('components.common.lightMode') : t('components.common.darkMode')}
            onToggle={toggleTheme}
          />
        </div>

        {user && (
          <ProfileMenu
            user={user}
            isOpen={isProfileOpen}
            profileRef={profileRef}
            settingsLabel={t('components.common.settings')}
            logoutLabel={t('components.common.logout')}
            onToggle={toggleProfile}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}
