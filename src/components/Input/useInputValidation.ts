import { useCallback, useState, type ChangeEvent } from 'react';
import { ValidateOn, type ValidationRule } from './inputValidation';
import { validateInputValue } from './inputValidation';

interface UseInputValidationOptions {
  rules?: ValidationRule[];
  validateOn?: ValidateOn;
  initialValue?: string;
}

export function useInputValidation({
  rules = [],
  validateOn = ValidateOn.Blur,
  initialValue = '',
}: UseInputValidationOptions = {}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const validate = useCallback(
    (nextValue: string = value): string | undefined => {
      if (rules.length === 0) {
        setError(undefined);
        return undefined;
      }
      const message = validateInputValue(nextValue, rules);
      setError(message);
      return message;
    },
    [rules, value],
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      if (validateOn === ValidateOn.Change || validateOn === ValidateOn.Both || touched) {
        validate(nextValue);
      } else {
        setError(undefined);
      }
    },
    [touched, validate, validateOn],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validateOn === ValidateOn.Blur || validateOn === ValidateOn.Both || touched) {
      validate(value);
    }
  }, [touched, validate, validateOn, value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(undefined);
    setTouched(false);
  }, [initialValue]);

  const isValid = !validateInputValue(value, rules);

  return {
    value,
    error,
    touched,
    isValid,
    setValue,
    setError,
    validate,
    handleChange,
    handleBlur,
    reset,
    inputProps: {
      value,
      error,
      onChange: (event: ChangeEvent<HTMLInputElement>) => handleChange(event.target.value),
      onBlur: handleBlur,
    },
  };
}
