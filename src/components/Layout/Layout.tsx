import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn, gapStyle } from './layoutUtils';
import { useLocale } from '@/context/LocaleContext';

// ─── Divider ────────────────────────────────────────────────────────────────

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerLabelPosition = 'left' | 'center' | 'right';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  plain?: boolean;
  labelPosition?: DividerLabelPosition;
  children?: ReactNode;
}

const dividerBorderClasses: Record<DividerVariant, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

const dividerLabelPositionClasses: Record<DividerLabelPosition, string> = {
  left: 'before:flex-none after:flex-1 before:max-w-[10%]',
  center: 'before:flex-1 after:flex-1',
  right: 'before:flex-1 after:flex-none after:max-w-[10%]',
};

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  plain = false,
  labelPosition = 'center',
  children,
  className = '',
  ...rest
}: DividerProps) {
  const hasLabel = Boolean(children);
  const borderClass = dividerBorderClasses[variant];

  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn(
          'inline-block h-full min-h-[1em] align-middle',
          plain ? 'mx-0' : 'mx-3',
          'border-l border-gray-200 dark:border-gray-700',
          borderClass,
          className,
        )}
        {...rest}
      />
    );
  }

  if (hasLabel) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          'flex w-full items-center gap-3 text-sm text-gray-500 dark:text-gray-400',
          plain ? 'my-0' : 'my-4',
          dividerLabelPositionClasses[labelPosition],
          className,
        )}
        {...rest}
      >
        <span
          className={cn('h-px flex-1 border-t border-gray-200 dark:border-gray-700', borderClass)}
          aria-hidden="true"
        />
        <span className="shrink-0 px-1 font-medium">{children}</span>
        <span
          className={cn('h-px flex-1 border-t border-gray-200 dark:border-gray-700', borderClass)}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        'w-full border-t border-gray-200 dark:border-gray-700',
        borderClass,
        plain ? 'my-0' : 'my-4',
        className,
      )}
      {...rest}
    />
  );
}

// ─── Flex ───────────────────────────────────────────────────────────────────

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  justify?: FlexJustify;
  align?: FlexAlign;
  gap?: number | string;
  vertical?: boolean;
}

const flexDirectionClasses: Record<FlexDirection, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const flexWrapClasses: Record<FlexWrap, string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

const flexJustifyClasses: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const flexAlignClasses: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

export function Flex({
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap,
  vertical = false,
  className = '',
  style,
  children,
  ...rest
}: FlexProps) {
  const resolvedDirection = vertical ? 'column' : direction;

  return (
    <div
      className={cn(
        'flex',
        flexDirectionClasses[resolvedDirection],
        flexWrapClasses[wrap],
        flexJustifyClasses[justify],
        flexAlignClasses[align],
        className,
      )}
      style={{ ...gapStyle(gap), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─── Grid ───────────────────────────────────────────────────────────────────

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | string;
  rows?: number | string;
  gap?: number | string;
  minChildWidth?: string;
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: number;
  rowSpan?: number;
}

function resolveGridTemplate(
  value: number | string | undefined,
  prefix: 'columns' | 'rows',
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return prefix === 'columns'
      ? `repeat(${value}, minmax(0, 1fr))`
      : `repeat(${value}, minmax(0, 1fr))`;
  }
  return value;
}

function GridRoot({
  columns,
  rows,
  gap,
  minChildWidth,
  className = '',
  style,
  children,
  ...rest
}: GridProps) {
  const gridStyle: CSSProperties = {
    ...gapStyle(gap),
    ...style,
  };

  if (minChildWidth) {
    gridStyle.gridTemplateColumns = `repeat(auto-fill, minmax(${minChildWidth}, 1fr))`;
  } else {
    const templateColumns = resolveGridTemplate(columns, 'columns');
    const templateRows = resolveGridTemplate(rows, 'rows');
    if (templateColumns) gridStyle.gridTemplateColumns = templateColumns;
    if (templateRows) gridStyle.gridTemplateRows = templateRows;
  }

  return (
    <div className={cn('grid', className)} style={gridStyle} {...rest}>
      {children}
    </div>
  );
}

function GridItem({ colSpan, rowSpan, className = '', style, children, ...rest }: GridItemProps) {
  const itemStyle: CSSProperties = { ...style };
  if (colSpan) itemStyle.gridColumn = `span ${colSpan} / span ${colSpan}`;
  if (rowSpan) itemStyle.gridRow = `span ${rowSpan} / span ${rowSpan}`;

  return (
    <div className={className} style={itemStyle} {...rest}>
      {children}
    </div>
  );
}

export const Grid = Object.assign(GridRoot, { Item: GridItem });

// ─── Layout ─────────────────────────────────────────────────────────────────

export interface LayoutRootProps extends HTMLAttributes<HTMLDivElement> {
  hasSider?: boolean;
}

export interface LayoutSectionProps extends HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

export interface LayoutSiderProps extends HTMLAttributes<HTMLElement> {
  width?: number | string;
  collapsed?: boolean;
  collapsedWidth?: number | string;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  trigger?: ReactNode | null;
}

const LayoutContext = createContext<{ hasSider: boolean }>({ hasSider: false });

function toCssSize(value: number | string | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

function LayoutRoot({ hasSider = false, className = '', children, ...rest }: LayoutRootProps) {
  const childArray = Children.toArray(children);
  const containsSider = hasSider || childArray.some((child) => isLayoutSider(child));

  return (
    <LayoutContext.Provider value={{ hasSider: containsSider }}>
      <div
        className={cn(
          'flex min-h-[240px] w-full flex-col rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
          containsSider && 'sm:flex-row',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </LayoutContext.Provider>
  );
}

function isLayoutSider(child: ReactNode): boolean {
  return (
    isValidElement(child) && (child.type as { displayName?: string }).displayName === 'LayoutSider'
  );
}

function LayoutHeader({ sticky = false, className = '', children, ...rest }: LayoutSectionProps) {
  return (
    <header
      className={cn(
        'flex shrink-0 items-center border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100',
        sticky && 'sticky top-0 z-10',
        className,
      )}
      {...rest}
    >
      {children}
    </header>
  );
}
LayoutHeader.displayName = 'LayoutHeader';

function LayoutFooter({ sticky = false, className = '', children, ...rest }: LayoutSectionProps) {
  return (
    <footer
      className={cn(
        'flex shrink-0 items-center border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400',
        sticky && 'sticky bottom-0 z-10',
        className,
      )}
      {...rest}
    >
      {children}
    </footer>
  );
}
LayoutFooter.displayName = 'LayoutFooter';

const LayoutContent = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function LayoutContent(
  { className = '', children, ...rest },
  ref,
) {
  return (
    <main
      ref={ref}
      className={cn(
        'min-h-0 flex-1 overflow-auto p-4 text-sm text-gray-700 dark:text-gray-300',
        className,
      )}
      {...rest}
    >
      {children}
    </main>
  );
});
LayoutContent.displayName = 'LayoutContent';

function LayoutSider({
  width = 200,
  collapsed = false,
  collapsedWidth = 64,
  collapsible = false,
  onCollapse,
  trigger,
  className = '',
  style,
  children,
  ...rest
}: LayoutSiderProps) {
  const { t } = useLocale();
  const resolvedWidth = collapsed ? collapsedWidth : width;

  const handleToggle = () => {
    onCollapse?.(!collapsed);
  };

  const defaultTrigger = (
    <button
      type="button"
      onClick={handleToggle}
      className="flex w-full items-center justify-center border-t border-gray-200 py-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      aria-label={collapsed ? t('components.common.expandSidebar') : t('components.common.collapseSidebar')}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
        />
      </svg>
    </button>
  );

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col overflow-hidden border-gray-200 bg-gray-50 transition-[width] duration-200 dark:border-gray-700 dark:bg-gray-800/60',
        'border-b sm:border-b-0 sm:border-r',
        className,
      )}
      style={{ width: toCssSize(resolvedWidth, '200px'), ...style }}
      {...rest}
    >
      <div className="flex-1 overflow-auto p-3 text-sm text-gray-600 dark:text-gray-400">
        {children}
      </div>
      {collapsible && trigger !== null && (trigger ?? defaultTrigger)}
    </aside>
  );
}
LayoutSider.displayName = 'LayoutSider';

export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Footer: LayoutFooter,
  Content: LayoutContent,
  Sider: LayoutSider,
});

// ─── Masonry ────────────────────────────────────────────────────────────────

export interface MasonryProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number;
  gap?: number | string;
}

export function Masonry({
  columns = 3,
  gap = 16,
  className = '',
  style,
  children,
  ...rest
}: MasonryProps) {
  const masonryStyle: CSSProperties = {
    columnCount: columns,
    columnGap: typeof gap === 'number' ? `${gap}px` : gap,
    ...style,
  };

  const items = Children.toArray(children);

  return (
    <div className={cn('w-full', className)} style={masonryStyle} {...rest}>
      {items.map((child, index) => (
        <div
          key={isValidElement(child) && child.key != null ? child.key : index}
          className="mb-4 break-inside-avoid"
          style={{ marginBottom: typeof gap === 'number' ? `${gap}px` : gap }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// ─── Space ────────────────────────────────────────────────────────────────────

export type SpaceDirection = 'horizontal' | 'vertical';
export type SpaceSize = 'sm' | 'md' | 'lg';
export type SpaceAlign = 'start' | 'center' | 'end' | 'baseline';

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  direction?: SpaceDirection;
  size?: SpaceSize | number;
  wrap?: boolean;
  align?: SpaceAlign;
  split?: ReactNode;
}

const spaceSizeMap: Record<SpaceSize, number> = {
  sm: 8,
  md: 16,
  lg: 24,
};

const spaceAlignClasses: Record<SpaceAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
};

export function Space({
  direction = 'horizontal',
  size = 'md',
  wrap = false,
  align = 'center',
  split,
  className = '',
  children,
  ...rest
}: SpaceProps) {
  const gapPx = typeof size === 'number' ? size : spaceSizeMap[size];
  const childArray = Children.toArray(children).filter((child) => child != null);

  if (childArray.length === 0) {
    return null;
  }

  const isVertical = direction === 'vertical';

  return (
    <div
      className={cn(
        'inline-flex',
        isVertical ? 'flex-col' : 'flex-row',
        wrap && !isVertical && 'flex-wrap',
        spaceAlignClasses[align],
        className,
      )}
      style={split ? undefined : gapStyle(gapPx)}
      {...rest}
    >
      {childArray.map((child, index) => {
        const key = isValidElement(child) && child.key != null ? child.key : index;

        return (
          <div
            key={key}
            className={cn(
              'inline-flex',
              isVertical ? 'flex-col' : 'flex-row',
              spaceAlignClasses[align],
            )}
            style={
              split && index > 0
                ? isVertical
                  ? { marginTop: gapPx }
                  : { marginLeft: gapPx }
                : undefined
            }
          >
            {split && index > 0 && (
              <span
                className={cn(
                  'inline-flex shrink-0 text-gray-300 dark:text-gray-600',
                  isVertical ? 'mb-1' : 'mr-1',
                )}
                aria-hidden="true"
              >
                {split}
              </span>
            )}
            {child}
          </div>
        );
      })}
    </div>
  );
}

// ─── Splitter ─────────────────────────────────────────────────────────────────

export type SplitterDirection = 'horizontal' | 'vertical';

export interface SplitterProps extends HTMLAttributes<HTMLDivElement> {
  direction?: SplitterDirection;
  onResize?: (sizes: number[]) => void;
}

export interface SplitterPanelProps extends HTMLAttributes<HTMLDivElement> {
  defaultSize?: number | string;
  min?: number;
  max?: number;
  collapsible?: boolean;
}

interface SplitterPanelInternalProps extends SplitterPanelProps {
  index: number;
}

interface SplitterContextValue {
  direction: SplitterDirection;
  sizes: number[];
  setSize: (index: number, size: number) => void;
  startDrag: (index: number, startPos: number) => void;
  panelCount: number;
}

const SplitterContext = createContext<SplitterContextValue | null>(null);

function parsePanelSize(value: number | string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (typeof value === 'number') return value;
  const trimmed = value.trim();
  if (trimmed.endsWith('%')) return Number.parseFloat(trimmed);
  if (trimmed.endsWith('px')) return Number.parseFloat(trimmed);
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function SplitterRoot({
  direction = 'horizontal',
  onResize,
  className = '',
  children,
  ...rest
}: SplitterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panels = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<SplitterPanelProps>[];
  const panelCount = panels.length;

  const defaultSizes = useMemo(() => {
    if (panelCount === 0) return [];
    const equal = 100 / panelCount;
    return panels.map((panel, index) =>
      parsePanelSize(panel.props.defaultSize, index === panelCount - 1 ? equal : equal),
    );
  }, [panelCount, panels]);

  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const dragState = useRef<{ index: number; startPos: number; startSizes: number[] } | null>(null);

  useEffect(() => {
    setSizes(defaultSizes);
  }, [defaultSizes]);

  const notifyResize = useCallback(
    (nextSizes: number[]) => {
      onResize?.(nextSizes);
    },
    [onResize],
  );

  const setSize = useCallback(
    (index: number, size: number) => {
      setSizes((prev) => {
        const next = [...prev];
        next[index] = size;
        notifyResize(next);
        return next;
      });
    },
    [notifyResize],
  );

  const startDrag = useCallback(
    (index: number, startPos: number) => {
      dragState.current = { index, startPos, startSizes: [...sizes] };
    },
    [sizes],
  );

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!dragState.current || !containerRef.current) return;

      const { index, startPos, startSizes } = dragState.current;
      const rect = containerRef.current.getBoundingClientRect();
      const total = direction === 'horizontal' ? rect.width : rect.height;
      const currentPos = direction === 'horizontal' ? event.clientX : event.clientY;
      const startPosPx = direction === 'horizontal' ? startPos : startPos;
      const deltaPx = currentPos - startPosPx;
      const deltaPercent = (deltaPx / total) * 100;

      const leftIndex = index;
      const rightIndex = index + 1;
      if (rightIndex >= startSizes.length) return;

      const leftPanel = panels[leftIndex]?.props;
      const rightPanel = panels[rightIndex]?.props;

      let nextLeft = startSizes[leftIndex] + deltaPercent;
      let nextRight = startSizes[rightIndex] - deltaPercent;

      const leftMin = leftPanel?.min ?? 10;
      const leftMax = leftPanel?.max ?? 90;
      const rightMin = rightPanel?.min ?? 10;
      const rightMax = rightPanel?.max ?? 90;

      if (nextLeft < leftMin) {
        nextRight -= leftMin - nextLeft;
        nextLeft = leftMin;
      }
      if (nextRight < rightMin) {
        nextLeft -= rightMin - nextRight;
        nextRight = rightMin;
      }
      if (nextLeft > leftMax) {
        nextRight += nextLeft - leftMax;
        nextLeft = leftMax;
      }
      if (nextRight > rightMax) {
        nextLeft += nextRight - rightMax;
        nextRight = rightMax;
      }

      setSizes((prev) => {
        const next = [...prev];
        next[leftIndex] = nextLeft;
        next[rightIndex] = nextRight;
        notifyResize(next);
        return next;
      });
    };

    const handleUp = () => {
      dragState.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [direction, notifyResize, panels]);

  const contextValue: SplitterContextValue = {
    direction,
    sizes,
    setSize,
    startDrag,
    panelCount,
  };

  return (
    <SplitterContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn(
          'flex h-64 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          className,
        )}
        {...rest}
      >
        {panels.map((panel, index) => (
          <SplitterPanelInternal key={panel.key ?? index} index={index} {...panel.props}>
            {panel.props.children}
          </SplitterPanelInternal>
        ))}
      </div>
    </SplitterContext.Provider>
  );
}

function SplitterPanelInternal({
  index,
  min: _min,
  max: _max,
  collapsible: _collapsible,
  defaultSize: _defaultSize,
  className = '',
  children,
  ...rest
}: SplitterPanelInternalProps) {
  const ctx = useContext(SplitterContext);
  if (!ctx) return null;

  const { direction, sizes, startDrag, panelCount } = ctx;
  const size = sizes[index] ?? 100 / panelCount;
  const isLast = index === panelCount - 1;

  const handleMouseDown = (event: ReactMouseEvent) => {
    event.preventDefault();
    const pos = direction === 'horizontal' ? event.clientX : event.clientY;
    startDrag(index, pos);
  };

  return (
    <>
      <div
        className={cn('min-h-0 min-w-0 overflow-auto', className)}
        style={{
          flexBasis: `${size}%`,
          flexGrow: 0,
          flexShrink: 0,
        }}
        {...rest}
      >
        {children}
      </div>
      {!isLast && (
        <div
          role="separator"
          aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
          onMouseDown={handleMouseDown}
          className={cn(
            'group relative z-10 shrink-0 bg-gray-200 transition-colors hover:bg-primary-400 dark:bg-gray-700 dark:hover:bg-primary-500',
            direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
          )}
        >
          <div
            className={cn(
              'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-500',
              direction === 'horizontal' ? 'h-8 w-1' : 'h-1 w-8',
            )}
          />
        </div>
      )}
    </>
  );
}

function SplitterPanel(_props: SplitterPanelProps) {
  return null;
}
SplitterPanel.displayName = 'SplitterPanel';

export const Splitter = Object.assign(SplitterRoot, { Panel: SplitterPanel });

export const LAYOUT_COMPONENT_MAP = {
  divider: 'Divider',
  flex: 'Flex',
  grid: 'Grid',
  layout: 'Layout',
  masonry: 'Masonry',
  space: 'Space',
  splitter: 'Splitter',
} as const;

export type LayoutComponentKey = keyof typeof LAYOUT_COMPONENT_MAP;
