import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { SelectOption } from '@/models/model.type';
import type {
  ComboBoxChangeValue,
  ComboBoxProps,
  ComboBoxValueProp,
  ComboBoxAddOptionConfig,
} from './comboBox.types';
import {
  buildAddedItemFromFields,
  createComboBoxAccessors,
  createSelectOptionAccessors,
  matchesComboBoxValue,
  normalizeComboBoxOptions,
  getItemSearchText,
  resolveAddFields,
  resolveComboBoxItemKind,
} from './comboBoxUtils';

export function ComboBox(
  props: ComboBoxProps<SelectOption> & { options: SelectOption[]; items?: never },
): JSX.Element;
export function ComboBox<T>(props: ComboBoxProps<T> & { items: T[]; options?: never }): JSX.Element;
export function ComboBox<T = SelectOption>(props: ComboBoxProps<T>): JSX.Element;
export function ComboBox<T = SelectOption>(props: ComboBoxProps<T>) {
  const {
    options,
    items,
    value,
    defaultValue,
    onChange,
    onSelect,
    labelKey,
    valueKey,
    getLabel,
    getValue,
    renderLabel,
    renderSelectedLabel,
    searchKeys,
    getSearchText,
    isDisabled,
    label,
    placeholder,
    error,
    disabled = false,
    searchable = false,
    className = '',
    addOption,
  } = props;

  const { t } = useLocale();
  const resolvedPlaceholder = placeholder ?? t('components.common.selectOption');
  const formatFieldRequired = useCallback(
    (field: string) => t('components.common.fieldRequired', { field }),
    [t],
  );
  const addFieldDefaults = useMemo(
    () => ({
      valueLabel: t('components.common.fieldValue'),
      labelLabel: t('components.common.fieldLabel'),
      enterValue: t('components.common.enterValue'),
      enterLabel: t('components.common.enterLabel'),
    }),
    [t],
  );

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<ComboBoxValueProp<T> | undefined>(
    defaultValue,
  );

  const id = useId();
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [addFieldValues, setAddFieldValues] = useState<Record<string, string>>({});
  const [addError, setAddError] = useState<string | undefined>();

  const sourceItems = useMemo(() => {
    if (options) return options as unknown as T[];
    return items ?? [];
  }, [options, items]);

  const accessors = useMemo(
    () =>
      options
        ? (createSelectOptionAccessors() as ReturnType<typeof createComboBoxAccessors<T>>)
        : createComboBoxAccessors({
            items: sourceItems,
            labelKey,
            valueKey,
            getLabel,
            getValue,
            isDisabled,
          }),
    [options, sourceItems, labelKey, valueKey, getLabel, getValue, isDisabled],
  );

  const normalizedOptions = useMemo(
    () => normalizeComboBoxOptions(sourceItems, accessors),
    [sourceItems, accessors],
  );

  const effectiveValue = isControlled ? value : internalValue;

  const selectedOption = useMemo(
    () =>
      normalizedOptions.find((opt) => matchesComboBoxValue(effectiveValue, opt.item, accessors)),
    [effectiveValue, normalizedOptions, accessors],
  );
  const selectedKey = selectedOption?.value;

  const emitSelect = useCallback(
    (option: (typeof normalizedOptions)[number]) => {
      const index = sourceItems.findIndex(
        (item) => String(accessors.getValue(item)) === option.value,
      );
      if (!isControlled) {
        setInternalValue(option.item as ComboBoxValueProp<T>);
      }
      onChange?.(option.item as ComboBoxChangeValue<T>);
      onSelect?.(option.item, index >= 0 ? index : 0);
    },
    [accessors, isControlled, onChange, onSelect, sourceItems],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable) return normalizedOptions;
    const query = search.toLowerCase();
    return normalizedOptions.filter((opt) =>
      getItemSearchText(opt.item, accessors, searchKeys, getSearchText).includes(query),
    );
  }, [searchable, normalizedOptions, search, accessors, searchKeys, getSearchText]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setHighlightedIndex(0);
    setAddFieldValues({});
    setAddError(undefined);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  const handleSelect = (option: (typeof normalizedOptions)[number]) => {
    if (option.disabled) return;
    emitSelect(option);
    close();
  };

  const setAddFieldValue = useCallback((key: string, value: string) => {
    setAddFieldValues((prev) => ({ ...prev, [key]: value }));
    setAddError(undefined);
  }, []);

  const resetAddForm = useCallback(() => {
    setAddFieldValues({});
    setAddError(undefined);
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        inputRef.current?.blur();
        break;
    }
  };

  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-600';

  const showAddRow = Boolean(addOption?.enabled && addOption.onAdd);

  const itemKind = useMemo(
    () => resolveComboBoxItemKind(Boolean(options), sourceItems),
    [options, sourceItems],
  );

  const addFields = useMemo(
    () =>
      resolveAddFields(
        addOption as ComboBoxAddOptionConfig | undefined,
        labelKey,
        valueKey,
        itemKind,
        addFieldDefaults,
      ),
    [addOption, labelKey, valueKey, itemKind, addFieldDefaults],
  );

  const addButtonLabel = addOption?.addButtonLabel ?? t('components.common.add');

  const handleContextAdd = useCallback(
    (item: unknown) => {
      addOption?.onAdd(item as T);
      resetAddForm();
    },
    [addOption, resetAddForm],
  );

  const handleAddOption = useCallback(() => {
    if (!addOption?.onAdd) return;

    try {
      const newItem = buildAddedItemFromFields<T>(
        addFieldValues,
        addFields,
        itemKind,
        formatFieldRequired,
      );
      handleContextAdd(newItem);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t('components.common.invalidInput'));
    }
  }, [addOption, addFieldValues, addFields, itemKind, handleContextAdd, formatFieldRequired, t]);

  const addRenderContext = useMemo(
    () => ({
      values: addFieldValues,
      setValue: setAddFieldValue,
      error: addError,
      setError: setAddError,
      submit: handleAddOption,
      reset: resetAddForm,
      addButtonLabel,
      fields: addFields,
      onAdd: handleContextAdd,
    }),
    [
      addFieldValues,
      setAddFieldValue,
      addError,
      handleAddOption,
      resetAddForm,
      addButtonLabel,
      addFields,
      handleContextAdd,
    ],
  );

  const addInputClassName =
    'block w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100';

  const renderDefaultAddForm = () => {
    if (addOption?.renderAdd) {
      return addOption.renderAdd(addRenderContext);
    }

    return (
      <>
        {addFields.map((field) => (
          <div key={field.key} className="mb-2">
            {field.label && (
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                {field.label}
              </label>
            )}
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={addFieldValues[field.key] ?? ''}
              placeholder={field.placeholder}
              onChange={(e) => setAddFieldValue(field.key, e.target.value)}
              className={addInputClassName}
            />
          </div>
        ))}
        {addError && <p className="mb-1 text-xs text-red-600 dark:text-red-400">{addError}</p>}
        <button
          type="button"
          onClick={handleAddOption}
          className="w-full rounded-md bg-primary-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
        >
          {addButtonLabel}
        </button>
      </>
    );
  };

  const closedDisplay = useMemo(() => {
    if (!selectedOption || isOpen) return null;

    if (renderSelectedLabel) {
      const content = renderSelectedLabel(selectedOption.item);
      if (typeof content === 'string' || typeof content === 'number') {
        return { kind: 'text' as const, text: String(content) };
      }
      return { kind: 'overlay' as const, node: content };
    }

    return { kind: 'text' as const, text: selectedOption.label };
  }, [selectedOption, isOpen, renderSelectedLabel]);

  const showCustomClosed = closedDisplay?.kind === 'overlay';
  const closedText =
    closedDisplay?.kind === 'text' ? closedDisplay.text : (selectedOption?.label ?? '');

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {showCustomClosed && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center px-3 py-1.5 pr-9"
            aria-hidden="true"
          >
            {closedDisplay!.node}
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          autoComplete="off"
          readOnly={!searchable}
          value={isOpen && searchable ? search : showCustomClosed ? '' : closedText}
          placeholder={showCustomClosed ? undefined : resolvedPlaceholder}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={`block w-full cursor-pointer rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 ${showCustomClosed ? 'h-10' : ''} ${stateClasses}`}
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">
              {t('components.common.noOptionsFound')}
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === selectedKey}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`cursor-pointer px-3 py-1.5 text-sm transition-colors ${
                  option.disabled
                    ? 'cursor-not-allowed text-gray-400'
                    : highlightedIndex === index
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : option.value === selectedKey
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {renderLabel ? renderLabel(option.item) : option.label}
              </li>
            ))
          )}

          {showAddRow && (
            <li className="border-t border-gray-200 p-2 dark:border-gray-700">
              {addOption?.sectionLabel && (
                <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {addOption.sectionLabel}
                </p>
              )}
              {renderDefaultAddForm()}
            </li>
          )}
        </ul>
      )}

      <div className="min-h-[1.25rem]">
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export type { ComboBoxProps, ComboBoxSelectEvent } from './comboBox.types';
export type {
  ComboBoxAddOptionConfig,
  ComboBoxAddFieldConfig,
  ComboBoxAddRenderContext,
  ComboBoxAddDataType,
  ComboBoxAccessors,
  ComboBoxChangeValue,
  ComboBoxNormalizedOption,
  ComboBoxPrimitive,
  ComboBoxValueProp,
} from './comboBox.types';
export {
  createComboBoxAccessors,
  createSelectOptionAccessors,
  normalizeComboBoxOptions,
  buildItemFromFieldsAdd,
  buildAddedItemFromFields,
  buildItemFromJsonAdd,
  getNestedValue,
  hasNestedPath,
  setNestedValue,
  matchesComboBoxValue,
  resolveComboBoxItemKind,
  resolveAddFields,
  getItemSearchText,
} from './comboBoxUtils';
