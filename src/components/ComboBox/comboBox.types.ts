import type { ReactNode } from 'react';
import type { SelectOption } from '@/models/model.type';

export type ComboBoxPrimitive = string | number;

export type ComboBoxChangeValue<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends SelectOption
      ? SelectOption
      : T;

export type ComboBoxValueProp<T> = T extends SelectOption
  ? ComboBoxChangeValue<T> | SelectOption['value']
  : T extends string | number
    ? T
    : ComboBoxChangeValue<T> | ComboBoxPrimitive;

export enum ComboBoxItemKind {
  Options = 'options',
  String = 'string',
  Model = 'model',
}

export enum ComboBoxAddInputMode {
  Text = 'text',
  Object = 'object',
  Fields = 'fields',
}

export type ComboBoxAddDataType = 'string' | 'json';

export interface ComboBoxSelectEvent<T> {
  item: T;
  index: number;
}

export interface ComboBoxAddFieldConfig {
  key: string;

  label?: string;
  placeholder?: string;
  type?: 'text' | 'number';

  required?: boolean;
}

export interface ComboBoxAddRenderContext {
  values: Record<string, string>;
  setValue: (key: string, value: string) => void;
  error?: string;
  setError: (error?: string) => void;
  submit: () => void;
  reset: () => void;
  addButtonLabel: string;
  fields?: ComboBoxAddFieldConfig[];
  onAdd: (item: unknown) => void;
}

export interface ComboBoxAddOptionConfig<T = unknown> {
  enabled?: boolean;

  inputMode?: ComboBoxAddInputMode;

  dataType?: ComboBoxAddDataType;

  labelField?: string;

  valueField?: string;

  sectionLabel?: string;

  addButtonLabel?: string;

  fields?: ComboBoxAddFieldConfig[];

  inputLabel?: string;

  placeholder?: string;

  renderAdd?: (context: ComboBoxAddRenderContext) => ReactNode;
  onAdd: (item: T) => void;
}

export interface ComboBoxAccessors<T> {
  getLabel: (item: T) => string;
  getValue: (item: T) => ComboBoxPrimitive;
  isDisabled?: (item: T) => boolean;
}

export interface ComboBoxNormalizedOption<T> {
  item: T;
  label: string;
  value: string;
  disabled: boolean;
}

export interface ComboBoxProps<T = SelectOption> {
  options?: SelectOption[];
  items?: T[];

  value?: ComboBoxValueProp<T>;

  defaultValue?: ComboBoxValueProp<T>;
  onChange?: (value: ComboBoxChangeValue<T>) => void;

  onSelect?: (item: T, index: number) => void;
  labelKey?: string;
  valueKey?: string;
  getLabel?: (item: T) => string;
  getValue?: (item: T) => ComboBoxPrimitive;

  renderLabel?: (item: T) => ReactNode;

  renderSelectedLabel?: (item: T) => ReactNode;

  searchKeys?: string[];

  getSearchText?: (item: T) => string;
  isDisabled?: (item: T) => boolean;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  addOption?: ComboBoxAddOptionConfig<T>;
}
