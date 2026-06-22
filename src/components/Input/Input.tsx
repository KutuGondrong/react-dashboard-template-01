import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { ValidateOn, type ValidationRule, validateInputValue } from './inputValidation';

/** Default debounce delay when `debounceSeconds` is omitted but debouncing is enabled via storybook/docs */
export const INPUT_DEFAULT_DEBOUNCE_SECONDS = 0.3;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  floatingLabel?: boolean;
  rules?: ValidationRule[];
  validateOn?: ValidateOn;
  value?: string;
  /** Debounce parent `onChange` — omit for immediate callback */
  debounceSeconds?: number;
}

function ErrorHintBlock({
  error,
  hint,
  errorId,
  hintId,
  spacing = 'mt-1',
}: {
  error?: string;
  hint?: string;
  errorId: string;
  hintId: string;
  spacing?: string;
}) {
  return (
    <div className="min-h-[1.25rem]">
      {error && (
        <p
          id={errorId}
          className={`${spacing} text-xs text-red-600 dark:text-red-400`}
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className={`${spacing} text-xs text-gray-500 dark:text-gray-400`}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  error: externalError,
  hint,
  leftIcon,
  rightIcon,
  floatingLabel = false,
  rules,
  validateOn = ValidateOn.Blur,
  className = '',
  id: externalId,
  value: controlledValue,
  defaultValue,
  onChange,
  onBlur,
  placeholder,
  debounceSeconds = INPUT_DEFAULT_DEBOUNCE_SECONDS,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(
    () => () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    },
    [],
  );

  const emitChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, nextValue: string) => {
      const handler = onChangeRef.current;
      if (!handler) return;

      if (debounceSeconds === undefined || debounceSeconds <= 0) {
        handler(event);
        return;
      }

      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        handler({
          ...event,
          target: { ...event.target, value: nextValue },
          currentTarget: { ...event.currentTarget, value: nextValue },
        });
      }, debounceSeconds * 1000);
    },
    [debounceSeconds],
  );

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const currentValue = isControlled ? controlledValue : uncontrolledValue;
  const displayError = externalError ?? internalError;

  const runValidation = useCallback(
    (value: string) => {
      if (!rules?.length) {
        setInternalError(undefined);
        return undefined;
      }
      const message = validateInputValue(value, rules);
      setInternalError(message);
      return message;
    },
    [rules],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (!isControlled) setUncontrolledValue(nextValue);

    if (
      rules?.length &&
      (validateOn === ValidateOn.Change || validateOn === ValidateOn.Both || touched)
    ) {
      runValidation(nextValue);
    } else if (!externalError) {
      setInternalError(undefined);
    }

    emitChange(event, nextValue);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (rules?.length && (validateOn === ValidateOn.Blur || validateOn === ValidateOn.Both)) {
      runValidation(event.target.value);
    }
    onBlur?.(event);
  };

  const stateClasses = displayError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600';

  const baseInputClasses =
    'block w-full rounded-lg border bg-white text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 read-only:cursor-default read-only:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:read-only:bg-gray-800/60';

  if (floatingLabel && label) {
    const hasLeftIcon = Boolean(leftIcon);
    const hasRightIcon = Boolean(rightIcon);
    const floatedLabelClasses = displayError
      ? 'text-red-600 dark:text-red-400'
      : 'text-primary-600 dark:text-primary-400';

    return (
      <div className="relative w-full">
        <div className="relative">
          {hasLeftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </span>
          )}

          <input
            id={id}
            value={currentValue}
            placeholder=" "
            aria-invalid={!!displayError}
            aria-describedby={displayError ? errorId : hint ? hintId : undefined}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`peer ${baseInputClasses} ${stateClasses} h-[3.25rem] pb-2 pt-6 placeholder:text-transparent ${hasLeftIcon ? 'pl-10' : 'px-3'} ${hasRightIcon ? 'pr-10' : hasLeftIcon ? 'pr-3' : ''} ${className}`}
            {...props}
          />

          <label
            htmlFor={id}
            className={`pointer-events-none absolute z-10 max-w-[calc(100%-1.5rem)] truncate transition-all duration-200 ease-out ${
              hasLeftIcon ? 'left-10' : 'left-3'
            } top-1/2 -translate-y-1/2 bg-transparent text-sm text-gray-500 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:px-1 peer-focus:text-xs peer-focus:font-medium ${floatedLabelClasses} peer-focus:bg-white peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-gray-700 dark:text-gray-400 dark:peer-focus:bg-gray-800 dark:peer-[:not(:placeholder-shown)]:bg-gray-800 dark:peer-[:not(:placeholder-shown)]:text-gray-200 ${hasLeftIcon ? 'peer-focus:-ml-1 peer-[:not(:placeholder-shown)]:-ml-1' : 'peer-focus:-ml-px peer-[:not(:placeholder-shown)]:-ml-px'}`}
          >
            {label}
          </label>

          {hasRightIcon && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>

        <ErrorHintBlock
          error={displayError}
          hint={hint}
          errorId={errorId}
          hintId={hintId}
          spacing="mt-1.5"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          value={currentValue}
          placeholder={placeholder}
          aria-invalid={!!displayError}
          aria-describedby={displayError ? errorId : hint ? hintId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${baseInputClasses} px-3 py-2.5 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${stateClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </span>
        )}
      </div>
      <ErrorHintBlock error={displayError} hint={hint} errorId={errorId} hintId={hintId} />
    </div>
  );
}

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value'
> {
  label?: string;
  error?: string;
  hint?: string;
  rules?: ValidationRule[];
  validateOn?: ValidateOn;
  value?: string;
}

export function Textarea({
  label,
  error: externalError,
  hint,
  rules,
  validateOn = ValidateOn.Blur,
  className = '',
  id: externalId,
  value: controlledValue,
  defaultValue,
  onChange,
  onBlur,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ''));
  const [internalError, setInternalError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const currentValue = isControlled ? controlledValue : uncontrolledValue;
  const displayError = externalError ?? internalError;

  const runValidation = useCallback(
    (value: string) => {
      if (!rules?.length) {
        setInternalError(undefined);
        return undefined;
      }
      const message = validateInputValue(value, rules);
      setInternalError(message);
      return message;
    },
    [rules],
  );

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    if (!isControlled) setUncontrolledValue(nextValue);

    if (
      rules?.length &&
      (validateOn === ValidateOn.Change || validateOn === ValidateOn.Both || touched)
    ) {
      runValidation(nextValue);
    } else if (!externalError) {
      setInternalError(undefined);
    }

    onChange?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setTouched(true);
    if (rules?.length && (validateOn === ValidateOn.Blur || validateOn === ValidateOn.Both)) {
      runValidation(event.target.value);
    }
    onBlur?.(event);
  };

  const stateClasses = displayError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={currentValue}
        aria-invalid={!!displayError}
        aria-describedby={displayError ? errorId : undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 ${stateClasses} ${className}`}
        {...props}
      />
      <ErrorHintBlock error={displayError} hint={hint} errorId={errorId} hintId={`${id}-hint`} />
    </div>
  );
}
