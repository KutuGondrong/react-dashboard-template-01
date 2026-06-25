type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
type BadgeSize = 'sm' | 'md';

export interface BadgeCustomColors {
  background: string;
  color: string;
  dot?: string;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  customColors?: BadgeCustomColors;
}

const variantClasses: Record<Exclude<BadgeVariant, 'custom'>, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

const dotColors: Record<Exclude<BadgeVariant, 'custom'>, string> = {
  default: 'bg-gray-500',
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

const DEFAULT_CUSTOM_COLORS: BadgeCustomColors = {
  background: '#ede9fe',
  color: '#6d28d9',
  dot: '#8b5cf6',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  customColors,
}: BadgeProps) {
  const isCustom = variant === 'custom';
  const resolvedCustom = isCustom ? { ...DEFAULT_CUSTOM_COLORS, ...customColors } : undefined;

  const badgeClassName = isCustom
    ? `inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${className}`
    : `inline-flex items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  const badgeStyle = resolvedCustom
    ? { backgroundColor: resolvedCustom.background, color: resolvedCustom.color }
    : undefined;

  const dotClassName = isCustom
    ? 'h-1.5 w-1.5 shrink-0 rounded-full'
    : `h-1.5 w-1.5 shrink-0 rounded-full ${dotColors[variant]}`;

  const dotStyle =
    isCustom && resolvedCustom
      ? { backgroundColor: resolvedCustom.dot ?? resolvedCustom.color }
      : undefined;

  return (
    <span className={badgeClassName} style={badgeStyle}>
      {dot && <span className={dotClassName} style={dotStyle} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Pill({
  children,
  active = false,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-600 text-white dark:bg-primary-500'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      } ${className}`}
    >
      {children}
    </button>
  );
}
