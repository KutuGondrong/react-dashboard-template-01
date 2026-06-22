export const ValidationRuleType = {
  Required: 'required',
  Email: 'email',
  MinLength: 'minLength',
  MaxLength: 'maxLength',
  Pattern: 'pattern',
  Numeric: 'numeric',
  Url: 'url',
  Custom: 'custom',
} as const;

export type ValidationRuleType = (typeof ValidationRuleType)[keyof typeof ValidationRuleType];

export type BuiltInValidationRule =
  | { type: typeof ValidationRuleType.Required; message?: string }
  | { type: typeof ValidationRuleType.Email; message?: string }
  | { type: typeof ValidationRuleType.MinLength; value: number; message?: string }
  | { type: typeof ValidationRuleType.MaxLength; value: number; message?: string }
  | { type: typeof ValidationRuleType.Pattern; value: RegExp; message?: string }
  | { type: typeof ValidationRuleType.Numeric; message?: string }
  | { type: typeof ValidationRuleType.Url; message?: string };

export type CustomValidationRule = {
  type: typeof ValidationRuleType.Custom;
  validate: (value: string) => boolean | string;
  message?: string;
};

export type ValidationRule = BuiltInValidationRule | CustomValidationRule;

export const ValidateOn = {
  Blur: 'blur',
  Change: 'change',
  Both: 'both',
} as const;

export type ValidateOn = (typeof ValidateOn)[keyof typeof ValidateOn];

/** Storybook / playground selection — maps to explicit rule lists */
export type ValidationRuleSelection =
  | 'none'
  | typeof ValidationRuleType.Required
  | typeof ValidationRuleType.Email
  | 'password'
  | 'phone'
  | 'custom';

const DEFAULT_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: 'Value is too short',
  maxLength: 'Value is too long',
  pattern: 'Invalid format',
  numeric: 'Must be a number',
  url: 'Please enter a valid URL',
  custom: 'Invalid value',
};

const PHONE_PATTERN = /^[0-9+\-\s()]{8,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/.+/i;

function isEmpty(value: string): boolean {
  return value.trim().length === 0;
}

function runRule(value: string, rule: ValidationRule): string | undefined {
  switch (rule.type) {
    case ValidationRuleType.Required:
      if (isEmpty(value)) return rule.message ?? DEFAULT_MESSAGES.required;
      return undefined;

    case ValidationRuleType.Email:
      if (isEmpty(value)) return undefined;
      if (!EMAIL_PATTERN.test(value)) return rule.message ?? DEFAULT_MESSAGES.email;
      return undefined;

    case ValidationRuleType.MinLength:
      if (isEmpty(value)) return undefined;
      if (value.length < rule.value) {
        return rule.message ?? `Minimum ${rule.value} characters`;
      }
      return undefined;

    case ValidationRuleType.MaxLength:
      if (value.length > rule.value) {
        return rule.message ?? `Maximum ${rule.value} characters`;
      }
      return undefined;

    case ValidationRuleType.Pattern:
      if (isEmpty(value)) return undefined;
      if (!rule.value.test(value)) return rule.message ?? DEFAULT_MESSAGES.pattern;
      return undefined;

    case ValidationRuleType.Numeric:
      if (isEmpty(value)) return undefined;
      if (!/^\d+$/.test(value)) return rule.message ?? DEFAULT_MESSAGES.numeric;
      return undefined;

    case ValidationRuleType.Url:
      if (isEmpty(value)) return undefined;
      if (!URL_PATTERN.test(value)) return rule.message ?? DEFAULT_MESSAGES.url;
      return undefined;

    case ValidationRuleType.Custom: {
      const result = rule.validate(value);
      if (result === true) return undefined;
      if (typeof result === 'string') return result;
      return rule.message ?? DEFAULT_MESSAGES.custom;
    }

    default:
      return undefined;
  }
}

export function validateInputValue(value: string, rules: ValidationRule[]): string | undefined {
  for (const rule of rules) {
    const error = runRule(value, rule);
    if (error) return error;
  }
  return undefined;
}

export function buildValidationRules(
  selection: ValidationRuleSelection,
  messages?: Partial<Record<string, string>>,
): ValidationRule[] {
  switch (selection) {
    case ValidationRuleType.Required:
      return [{ type: ValidationRuleType.Required, message: messages?.required }];
    case ValidationRuleType.Email:
      return [{ type: ValidationRuleType.Email, message: messages?.email }];
    case 'password':
      return [
        { type: ValidationRuleType.Required, message: messages?.required },
        { type: ValidationRuleType.MinLength, value: 6, message: messages?.minLength },
      ];
    case 'phone':
      return [
        { type: ValidationRuleType.Required, message: messages?.required },
        {
          type: ValidationRuleType.Pattern,
          value: PHONE_PATTERN,
          message: messages?.pattern,
        },
      ];
    case 'custom':
      return customValidationExample;
    case 'none':
    default:
      return [];
  }
}

/** @deprecated Use buildValidationRules with ValidationRuleType */
export function createValidationRules(
  preset: 'email' | 'password' | 'required' | 'phone',
  messages?: Partial<Record<string, string>>,
): ValidationRule[] {
  switch (preset) {
    case 'required':
      return buildValidationRules(ValidationRuleType.Required, messages);
    case 'email':
      return [
        { type: ValidationRuleType.Required, message: messages?.required },
        { type: ValidationRuleType.Email, message: messages?.email },
      ];
    case 'password':
      return buildValidationRules('password', messages);
    case 'phone':
      return buildValidationRules('phone', messages);
    default:
      return [];
  }
}

export const customValidationExample: ValidationRule[] = [
  { type: ValidationRuleType.Required, message: 'This field is required' },
  {
    type: ValidationRuleType.Custom,
    validate: (value) => value.length >= 3 || 'Minimum 3 characters',
  },
  {
    type: ValidationRuleType.Custom,
    validate: (value) => !/[!@#$%^&*(),.?":{}|<>]/.test(value) || 'No special characters allowed',
  },
  {
    type: ValidationRuleType.Custom,
    validate: (value) => {
      if (value.toLowerCase().includes('test')) return 'Word "test" is not allowed';
      return true;
    },
  },
];
