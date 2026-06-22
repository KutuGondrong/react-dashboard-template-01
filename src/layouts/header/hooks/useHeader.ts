import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';

export function useHeader() {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen((open) => !open);
  }, []);

  const closeProfile = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const handleSettings = useCallback(() => {
    closeProfile();
    navigate('/settings');
  }, [closeProfile, navigate]);

  const handleLogout = useCallback(() => {
    closeProfile();
    logout();
  }, [closeProfile, logout]);

  return {
    user,
    t,
    locale,
    setLocale,
    isDark: resolvedTheme === 'dark',
    toggleTheme,
    isProfileOpen,
    profileRef,
    toggleProfile,
    handleSettings,
    handleLogout,
  };
}
