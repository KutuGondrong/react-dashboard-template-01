import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthForm } from '@/features/auth/hooks/useAuthForm';
import { useLocale } from '@/context/LocaleContext';
import { AuthFormFooter } from '@/features/auth/components/AuthFormFooter';
import { AuthFormHeader } from '@/features/auth/components/AuthFormHeader';
import { createValidationRules, Input, ValidationRuleType, ValidateOn } from '@/components/Input';
import { Button } from '@/components/Button';

export function RegisterForm() {
  const { t } = useLocale();
  const { errors, isLoading, handleSubmit, clearFieldError } = useAuthForm('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await handleSubmit({ email, password, confirmPassword });
  };

  return (
    <div className="w-full">
      <AuthFormHeader title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')} />

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
          autoComplete="new-password"
        />

        <Input
          label={t('auth.confirmPasswordLabel')}
          type="password"
          placeholder={t('auth.confirmPasswordPlaceholder')}
          value={confirmPassword}
          debounceSeconds={0}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearFieldError('confirmPassword');
          }}
          error={errors.confirmPassword}
          rules={[
            { type: ValidationRuleType.Required, message: t('auth.confirmPasswordRequired') },
            {
              type: ValidationRuleType.Custom,
              validate: (value) => value === password || t('auth.passwordMismatch'),
            },
          ]}
          validateOn={ValidateOn.Blur}
          autoComplete="new-password"
        />

        <div className="pt-1">
          <Button type="submit" fullWidth isLoading={isLoading}>
            {t('auth.registerButton')}
          </Button>
        </div>
      </form>

      <AuthFormFooter>
        {t('auth.hasAccount')}{' '}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          {t('auth.signInLink')}
        </Link>
      </AuthFormFooter>
    </div>
  );
}
