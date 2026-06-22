import type { SelectOption } from '@/models/model.type';
import type {
  ComboBoxAccessors,
  ComboBoxAddFieldConfig,
  ComboBoxAddOptionConfig,
  ComboBoxNormalizedOption,
  ComboBoxPrimitive,
  ComboBoxValueProp,
} from './comboBox.types';
import { ComboBoxAddInputMode, ComboBoxItemKind } from './comboBox.types';

function isSelectOption(item: unknown): item is SelectOption {
  return (
    typeof item === 'object' &&
    item !== null &&
    'label' in item &&
    'value' in item &&
    typeof (item as SelectOption).label === 'string'
  );
}

function isPrimitiveItem(item: unknown): item is ComboBoxPrimitive {
  return typeof item === 'string' || typeof item === 'number';
}

/** Read nested value using dot path, e.g. `data.meta.name` */
export function getNestedValue(source: unknown, path: string): unknown {
  if (!path.trim()) return source;

  return path.split('.').reduce<unknown>((current, segment) => {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment];
  }, source);
}

/** Check nested path exists and is not undefined */
export function hasNestedPath(source: unknown, path: string): boolean {
  return getNestedValue(source, path) !== undefined;
}

/** Write value to nested path, creating intermediate objects as needed */
export function setNestedValue(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const segments = path.split('.').filter(Boolean);
  if (segments.length === 0) return;

  let current = target;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const next = current[segment];
    if (next === undefined || typeof next !== 'object' || next === null) {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }

  current[segments[segments.length - 1]] = value;
}

function toComboBoxPrimitive(value: unknown): ComboBoxPrimitive {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value === undefined || value === null) return '';
  return String(value);
}

export function createSelectOptionAccessors(): ComboBoxAccessors<SelectOption> {
  return {
    getLabel: (item) => item.label,
    getValue: (item) => item.value,
    isDisabled: (item) => Boolean(item.disabled),
  };
}

export function createComboBoxAccessors<T>(config: {
  items: T[];
  labelKey?: string;
  valueKey?: string;
  getLabel?: (item: T) => string;
  getValue?: (item: T) => ComboBoxPrimitive;
  isDisabled?: (item: T) => boolean;
}): ComboBoxAccessors<T> {
  if (config.getLabel && config.getValue) {
    return {
      getLabel: config.getLabel,
      getValue: config.getValue,
      isDisabled: config.isDisabled,
    };
  }

  const sample = config.items[0];

  if (sample !== undefined && isPrimitiveItem(sample)) {
    return {
      getLabel: (item) => String(item),
      getValue: (item) => item as ComboBoxPrimitive,
      isDisabled: config.isDisabled,
    };
  }

  if (sample !== undefined && isSelectOption(sample)) {
    return createSelectOptionAccessors() as ComboBoxAccessors<T>;
  }

  const labelKey = config.labelKey ?? 'label';
  const valueKey = config.valueKey ?? 'value';

  return {
    getLabel: (item) => String(getNestedValue(item, labelKey) ?? ''),
    getValue: (item) => toComboBoxPrimitive(getNestedValue(item, valueKey)),
    isDisabled: config.isDisabled ?? ((item) => Boolean(getNestedValue(item, 'disabled'))),
  };
}

export function resolveComboBoxItemKind(hasOptions: boolean, items: unknown[]): ComboBoxItemKind {
  if (hasOptions) return ComboBoxItemKind.Options;

  const sample = items[0];
  if (sample === undefined) return ComboBoxItemKind.Model;
  if (isPrimitiveItem(sample)) return ComboBoxItemKind.String;
  if (isSelectOption(sample)) return ComboBoxItemKind.Options;
  return ComboBoxItemKind.Model;
}

export function resolveAddInputMode(itemKind: ComboBoxItemKind): ComboBoxAddInputMode {
  switch (itemKind) {
    case ComboBoxItemKind.String:
    case ComboBoxItemKind.Options:
      return ComboBoxAddInputMode.Text;
    case ComboBoxItemKind.Model:
      return ComboBoxAddInputMode.Object;
    default:
      return ComboBoxAddInputMode.Text;
  }
}

export function resolveAddInputModeFromConfig(
  _itemKind: ComboBoxItemKind,
  config?: Pick<ComboBoxAddOptionConfig, 'inputMode' | 'dataType' | 'fields' | 'renderAdd'>,
): ComboBoxAddInputMode {
  if (config?.renderAdd) return ComboBoxAddInputMode.Fields;
  if (config?.inputMode === ComboBoxAddInputMode.Text) return ComboBoxAddInputMode.Text;
  if (config?.inputMode === ComboBoxAddInputMode.Object) return ComboBoxAddInputMode.Object;
  if (config?.dataType === 'json') return ComboBoxAddInputMode.Object;
  if (config?.dataType === 'string') return ComboBoxAddInputMode.Text;
  return ComboBoxAddInputMode.Fields;
}

export interface ComboBoxAddFieldDefaults {
  valueLabel: string;
  labelLabel: string;
  enterValue: string;
  enterLabel: string;
}

export function resolveAddFields(
  addOption: ComboBoxAddOptionConfig | undefined,
  labelKey: string | undefined,
  valueKey: string | undefined,
  itemKind: ComboBoxItemKind,
  defaults?: ComboBoxAddFieldDefaults,
): ComboBoxAddFieldConfig[] {
  if (addOption?.fields?.length) return addOption.fields;

  const labelField = addOption?.labelField ?? labelKey ?? 'label';
  const valueField = addOption?.valueField ?? valueKey ?? 'value';

  if (itemKind === ComboBoxItemKind.String) {
    return [
      {
        key: 'value',
        label: addOption?.inputLabel ?? defaults?.valueLabel ?? 'Value',
        placeholder: addOption?.placeholder ?? defaults?.enterValue ?? 'Enter value',
      },
    ];
  }

  if (itemKind === ComboBoxItemKind.Options) {
    return [
      {
        key: 'label',
        label: addOption?.inputLabel ?? defaults?.labelLabel ?? 'Label',
        placeholder: addOption?.placeholder ?? defaults?.enterLabel ?? 'Enter label',
      },
      {
        key: 'value',
        label: defaults?.valueLabel ?? 'Value',
        placeholder: defaults?.enterValue ?? 'Enter value',
      },
    ];
  }

  if (labelField === valueField) {
    return [
      {
        key: labelField,
        label: labelField,
        placeholder: addOption?.placeholder,
      },
    ];
  }

  return [
    { key: labelField, label: labelField },
    { key: valueField, label: valueField },
  ];
}

export function buildAddedItemFromFields<T>(
  values: Record<string, string>,
  fields: ComboBoxAddFieldConfig[],
  itemKind: ComboBoxItemKind,
  formatRequired?: (fieldLabel: string) => string,
): T {
  const requiredError = (fieldLabel: string) =>
    formatRequired?.(fieldLabel) ?? `${fieldLabel} is required`;

  if (itemKind === ComboBoxItemKind.String) {
    const field = fields[0];
    const raw = values[field?.key ?? 'value']?.trim() ?? '';
    if (!raw) {
      throw new Error(requiredError(field?.label ?? field?.key ?? 'Value'));
    }
    return raw as T;
  }

  if (itemKind === ComboBoxItemKind.Options && fields.length === 1) {
    const field = fields[0];
    const raw = values[field.key]?.trim() ?? '';
    if (!raw) {
      throw new Error(requiredError(field.label ?? field.key));
    }
    return { label: raw, value: raw } as T;
  }

  return buildItemFromFieldsAdd<T>(values, fields, formatRequired);
}

export function buildItemFromFieldsAdd<T>(
  values: Record<string, string>,
  fields: ComboBoxAddFieldConfig[],
  formatRequired?: (fieldLabel: string) => string,
): T {
  const item: Record<string, unknown> = {};
  const requiredError = (fieldLabel: string) =>
    formatRequired?.(fieldLabel) ?? `${fieldLabel} is required`;

  for (const field of fields) {
    const raw = values[field.key]?.trim() ?? '';
    const isRequired = field.required !== false;

    if (isRequired && !raw) {
      throw new Error(requiredError(field.label ?? field.key));
    }

    if (!raw) continue;

    if (field.type === 'number') {
      const parsed = Number(raw);
      if (Number.isNaN(parsed)) {
        throw new Error(`${field.label ?? field.key} must be a number`);
      }
      setNestedValue(item, field.key, parsed);
      continue;
    }

    setNestedValue(item, field.key, raw);
  }

  return item as T;
}

export function getFirstSelectableOption<T>(
  options: ComboBoxNormalizedOption<T>[],
): ComboBoxNormalizedOption<T> | undefined {
  return options.find((opt) => !opt.disabled);
}

export function isComboBoxValueUnset<T>(value: ComboBoxValueProp<T> | null | undefined): boolean {
  return value === undefined || value === null || value === '';
}

/** Match controlled value to a list item (supports full item or valueKey primitive) */
export function matchesComboBoxValue<T>(
  controlled: ComboBoxValueProp<T> | null | undefined,
  item: T,
  accessors: ComboBoxAccessors<T>,
): boolean {
  if (controlled === undefined || controlled === null) return false;

  if (isPrimitiveItem(controlled) && isPrimitiveItem(item as unknown)) {
    return controlled === item;
  }

  if (typeof controlled === 'string' || typeof controlled === 'number') {
    if (isSelectOption(item as unknown)) {
      return String((item as SelectOption).value) === String(controlled);
    }
    return String(accessors.getValue(item)) === String(controlled);
  }

  if (typeof controlled === 'object') {
    if (isSelectOption(controlled) && isSelectOption(item as unknown)) {
      return controlled.value === (item as SelectOption).value;
    }
    return String(accessors.getValue(controlled as T)) === String(accessors.getValue(item));
  }

  return false;
}

export function normalizeComboBoxOptions<T>(
  items: T[],
  accessors: ComboBoxAccessors<T>,
): ComboBoxNormalizedOption<T>[] {
  return items.map((item) => {
    const value = accessors.getValue(item);
    return {
      item,
      label: accessors.getLabel(item),
      value: String(value),
      disabled: accessors.isDisabled?.(item) ?? false,
    };
  });
}

/** Build searchable text from multiple field paths or custom getter */
export function getItemSearchText<T>(
  item: T,
  accessors: ComboBoxAccessors<T>,
  searchKeys?: string[],
  getSearchText?: (item: T) => string,
): string {
  if (getSearchText) return getSearchText(item).toLowerCase();

  if (searchKeys?.length) {
    return searchKeys
      .map((key) => String(getNestedValue(item, key) ?? ''))
      .join(' ')
      .toLowerCase();
  }

  return accessors.getLabel(item).toLowerCase();
}

export function buildItemFromStringAdd<T>(
  input: string,
  labelField: string,
  valueField: string,
): T {
  const item: Record<string, unknown> = {};
  setNestedValue(item, labelField, input);
  if (labelField !== valueField) {
    setNestedValue(item, valueField, input);
  }
  return item as T;
}

export function buildItemFromObjectAdd<T>(raw: string, labelField: string, valueField: string): T {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Input is empty');
  }

  const parsed: unknown = JSON.parse(trimmed);

  if (typeof parsed === 'string' || typeof parsed === 'number') {
    return parsed as T;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('JSON must be an object, string, or number');
  }

  if (!hasNestedPath(parsed, labelField)) {
    throw new Error(`Missing label field "${labelField}" in JSON`);
  }
  if (!hasNestedPath(parsed, valueField)) {
    throw new Error(`Missing value field "${valueField}" in JSON`);
  }

  return parsed as T;
}

/** @deprecated Use buildItemFromObjectAdd */
export function buildItemFromJsonAdd<T>(
  raw: string,
  labelField: string,
  valueField: string,
  _dataType?: 'string' | 'json',
): T {
  return buildItemFromObjectAdd<T>(raw, labelField, valueField);
}
