import {
  Children,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/components/Layout/layoutUtils';
import { getScrollContainer } from '@/utils/scrollContainer';

const DEFAULT_FILL_MIN_HEIGHT = 320;

export interface DataTableGroupProps {
  children: ReactNode;
  className?: string;
  /**
   * Flex column layout: table body grows, pagination footer stays at the bottom.
   * When content exceeds the available body height, the body scrolls.
   *
   * When `false`, the group still grows naturally with short content, but if the
   * layout would overflow the scroll viewport the table body scrolls internally
   * so pagination stays directly below the table (above the page footer).
   */
  fillHeight?: boolean;
  /** Minimum height (px) when `fillHeight` is enabled. Default: 320. */
  minHeight?: number;
}

function DataTableGroupFooter({ children }: { children: ReactNode }) {
  return (
    <div className="shrink-0 overflow-x-auto border-t border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function isDataTableGroupFooter(child: ReactNode): child is ReactElement {
  return isValidElement(child) && child.type === DataTableGroupFooter;
}

/** Card shell for {@link DataTable} (unwrapped) + {@link Pagination} footer. */
export function DataTableGroup({
  children,
  className = '',
  fillHeight = false,
  minHeight = DEFAULT_FILL_MIN_HEIGHT,
}: DataTableGroupProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [bodyMaxHeight, setBodyMaxHeight] = useState<number | undefined>();

  const shellClass =
    'overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';

  const childArray = Children.toArray(children);
  const footer = childArray.find(isDataTableGroupFooter);
  const body = childArray.filter((child) => !isDataTableGroupFooter(child));

  const isScrollable = fillHeight || bodyMaxHeight !== undefined;

  useLayoutEffect(() => {
    if (fillHeight) {
      setBodyMaxHeight(undefined);
      return;
    }

    const root = rootRef.current;
    const bodyEl = bodyRef.current;
    if (!root || !bodyEl) return;

    const measure = () => {
      const footerEl = footerRef.current;
      const scrollContainer = getScrollContainer(root);
      const containerRect = scrollContainer.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const available = containerRect.bottom - rootRect.top;
      const footerHeight = footerEl?.offsetHeight ?? 0;
      const needed = bodyEl.scrollHeight + footerHeight;

      if (needed > available + 1 && available > footerHeight) {
        setBodyMaxHeight((current) => {
          const next = Math.floor(available - footerHeight);
          return current === next ? current : next;
        });
      } else {
        setBodyMaxHeight((current) => (current === undefined ? current : undefined));
      }
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(root);
    resizeObserver.observe(bodyEl);
    if (footerRef.current) resizeObserver.observe(footerRef.current);

    const scrollContainer = getScrollContainer(root);
    let scrollRafId: number | null = null;
    const scheduleMeasureOnScroll = () => {
      if (scrollRafId !== null) return;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafId = null;
        measure();
      });
    };
    scrollContainer.addEventListener('scroll', scheduleMeasureOnScroll, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      scrollContainer.removeEventListener('scroll', scheduleMeasureOnScroll);
      window.removeEventListener('resize', measure);
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
    };
  }, [fillHeight, children]);

  const rootStyle: CSSProperties = {};
  if (fillHeight) {
    rootStyle.minHeight = `${minHeight}px`;
  }

  const bodyStyle: CSSProperties = {};
  if (bodyMaxHeight !== undefined) {
    bodyStyle.maxHeight = `${bodyMaxHeight}px`;
  }

  return (
    <div
      ref={rootRef}
      className={cn(shellClass, 'flex min-w-0 flex-col', fillHeight && 'min-h-0 flex-1', className)}
      style={Object.keys(rootStyle).length > 0 ? rootStyle : undefined}
    >
      <div
        ref={bodyRef}
        style={Object.keys(bodyStyle).length > 0 ? bodyStyle : undefined}
        className={cn(
          fillHeight && 'min-h-0 flex-1',
          'min-w-0 overflow-x-auto',
          isScrollable && 'overflow-y-auto overscroll-y-contain [overflow-anchor:none]',
        )}
      >
        {body}
      </div>
      {footer ? (
        <div ref={footerRef} className="shrink-0">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

DataTableGroup.Footer = DataTableGroupFooter;
