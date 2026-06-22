import type { SupportedLocale } from '@/config/app.config';

const LOCALE_OPTIONS: { value: SupportedLocale; flag: string; label: string }[] = [
  { value: 'en', flag: '🇬🇧', label: 'EN' },
  { value: 'id', flag: '🇮🇩', label: 'ID' },
];

export function LocaleToggle({
  locale,
  onChange,
  showLabels = false,
  compact = false,
}: {
  locale: SupportedLocale;
  onChange: (locale: SupportedLocale) => void;
  showLabels?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 ${
        compact ? 'p-0.5' : 'p-1'
      }`}
      role="group"
      aria-label="Language"
    >
      {LOCALE_OPTIONS.map((option) => {
        const isActive = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            aria-current={isActive ? 'true' : undefined}
            aria-label={option.label}
            className={`flex items-center justify-center gap-1 rounded-md font-semibold transition-all ${
              compact ? 'h-8 w-8 text-base' : 'px-2 py-1.5 text-xs sm:min-w-[3.25rem] sm:px-2.5'
            } ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-600 dark:bg-primary-500 dark:ring-primary-500'
                : 'text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-gray-200'
            }`}
          >
            <span aria-hidden="true">{option.flag}</span>
            {!compact && (
              <span className={showLabels ? 'inline' : 'hidden sm:inline'}>{option.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
