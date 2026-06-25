import { useState, type ButtonHTMLAttributes } from 'react';
import { useLocale } from '@/context/LocaleContext';

type ToggleSize = 'sm' | 'md';
type ToggleLabelPosition = 'left' | 'right';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ToggleSize;
  label?: string;
  labelPosition?: ToggleLabelPosition;
}

const trackSizeClasses: Record<ToggleSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
};

const thumbSizeClasses: Record<ToggleSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
};

const thumbOnTranslateClasses: Record<ToggleSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
};

export function Toggle({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  labelPosition = 'right',
  className = '',
  'aria-label': ariaLabel,
  ...props
}: ToggleProps) {
  const { t } = useLocale();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  const resolvedAriaLabel = ariaLabel ?? label ?? t('components.common.toggle');

  const handleToggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  const switchButton = (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={label ? undefined : resolvedAriaLabel}
      disabled={disabled}
      onClick={handleToggle}
      className={`relative shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900 ${
        isChecked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
      } ${trackSizeClasses[size]} ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 top-0.5 rounded-full bg-white transition-transform ${
          thumbSizeClasses[size]
        } ${isChecked ? thumbOnTranslateClasses[size] : 'translate-x-0'}`}
      />
    </button>
  );

  if (!label) {
    return switchButton;
  }

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : ''}`}
    >
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      {switchButton}
    </label>
  );
}
