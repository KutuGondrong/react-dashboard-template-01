import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { ValidationError } from '@/datasource/network/apiRepository';
import type { LoginCredentials, RegisterCredentials } from '@/models/model.type';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  credentials?: string;
}

export function useAuthForm(mode: 'login' | 'register') {
  const { login, register, isLoading } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const [errors, setErrors] = useState<FormErrors>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const validateLogin = useCallback(
    (credentials: LoginCredentials): FormErrors => {
      const newErrors: FormErrors = {};
      if (!credentials.email.trim()) {
        newErrors.email = t('auth.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
        newErrors.email = t('auth.emailInvalid');
      }
      if (!credentials.password) {
        newErrors.password = t('auth.passwordRequired');
      }
      return newErrors;
    },
    [t],
  );

  const validateRegister = useCallback(
    (credentials: RegisterCredentials): FormErrors => {
      const loginErrors = validateLogin(credentials);
      const newErrors: FormErrors = { ...loginErrors };
      if (credentials.password.length < 6) {
        newErrors.password = t('auth.passwordMinLength');
      }
      if (!credentials.confirmPassword) {
        newErrors.confirmPassword = t('auth.confirmPasswordRequired');
      } else if (credentials.password !== credentials.confirmPassword) {
        newErrors.confirmPassword = t('auth.passwordMismatch');
      }
      return newErrors;
    },
    [t, validateLogin],
  );

  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      const validationErrors = validateLogin(credentials);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }

      setErrors({});
      try {
        await login(credentials);
        navigate(from, { replace: true });
        return true;
      } catch (error) {
        if (error instanceof ValidationError) {
          if (error.field === 'credentials') {
            setErrors({ credentials: t('auth.invalidCredentials') });
          } else {
            setErrors({ [error.field]: error.message });
          }
        } else {
          setErrors({ credentials: t('components.common.error') });
        }
        return false;
      }
    },
    [validateLogin, login, navigate, from, t],
  );

  const handleRegister = useCallback(
    async (credentials: RegisterCredentials) => {
      const validationErrors = validateRegister(credentials);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }

      setErrors({});
      try {
        await register(credentials);
        navigate('/dashboard', { replace: true });
        return true;
      } catch (error) {
        if (error instanceof ValidationError) {
          setErrors({ [error.field]: error.message });
        } else {
          setErrors({ credentials: t('components.common.error') });
        }
        return false;
      }
    },
    [validateRegister, register, navigate, t],
  );

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  return {
    errors,
    isLoading,
    handleSubmit: (mode === 'login' ? handleLogin : handleRegister) as (
      credentials: LoginCredentials | RegisterCredentials,
    ) => Promise<boolean>,
    clearFieldError,
  };
}
