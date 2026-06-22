import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { useLocale } from '@/context/LocaleContext';
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter';
import { AuthFormHeader } from '@/features/auth/components/AuthFormHeader';
import { createValidationRules, Input, ValidateOn } from '@/components/Input';
import { Button } from '@/components/Button';

export function LoginForm() {
  const { t } = useLocale();
  const { errors, isLoading, handleSubmit, clearFieldError } = useAuthForm('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleSubmit({ email, password });
  };

  return (
    <div className="w-full">
      <AuthFormHeader title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')} />

      <form onSubmit={onSubmit} className="space-y-4">
        {errors.credentials && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
            role="alert"
          >
            {errors.credentials}
          </div>
        )}

        <Input
          label={t('auth.emailLabel')}
          type="email"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          debounceSeconds={0}
          onChange={(e) => {
            setEmail(e.target.value);
            clearFieldError('email');
          }}
          error={errors.email}
          rules={createValidationRules('email', {
            required: t('auth.emailRequired'),
            email: t('auth.emailInvalid'),
          })}
          validateOn={ValidateOn.Blur}
          autoComplete="email"
        />

        <Input
          label={t('auth.passwordLabel')}
          type="password"
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          debounceSeconds={0}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError('password');
          }}
          error={errors.password}
          rules={createValidationRules('password', {
            required: t('auth.passwordRequired'),
            minLength: t('auth.passwordMinLength'),
          })}
          validateOn={ValidateOn.Blur}
          autoComplete="current-password"
        />

        <div className="pt-1">
          <Button type="submit" fullWidth isLoading={isLoading}>
            {t('auth.loginButton')}
          </Button>
        </div>
      </form>

      <AuthFormFooter>
        {t('auth.noAccount')}{' '}
        <Link
          to="/register"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          {t('auth.signUpLink')}
        </Link>
      </AuthFormFooter>

      <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
        <p className="font-medium text-gray-600 dark:text-gray-300">{t('auth.demoCredentialsTitle')}</p>
        <p className="mt-1 font-mono text-[11px] tracking-wide">{t('auth.demoCredentialsHint')}</p>
      </div>
    </div>
  );
}
