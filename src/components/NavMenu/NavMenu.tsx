import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Drawer } from '@/components/Drawer';
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/context/LocaleContext';

export interface NavMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  end?: boolean;
  onClick?: () => void;
  children?: NavMenuItem[];
  devBadge?: boolean;
  expandScope?: 'independent' | 'all';
  defaultExpanded?: boolean;
  flyoutDismissOnAction?: boolean;
  parentClick?: 'expand' | 'navigate';
}

export type NavMenuScrollControls = 'top' | 'bottom' | 'all' | 'none';

export interface NavMenuProps {
  items: NavMenuItem[];
  collapsed?: boolean;
  className?: string;
  collapsible?: boolean;
  collapseTriggerPosition?: 'top-peek' | 'top' | 'center' | 'bottom';
  onCollapse?: (collapsed: boolean) => void;
  childrenMode?: 'collapsible' | 'always';
  childConnector?: 'none' | 'tree';
  defaultExpandScope?: 'independent' | 'all';
  flyoutDismissOnAction?: boolean;
  pathname?: string;
  onNavigate?: (path: string) => void;
  showScrollbar?: boolean;
  scrollControls?: NavMenuScrollControls;
  embedded?: boolean;
  onMenuDismiss?: () => void;
  initialOpenKeys?: string[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  mobileTitle?: string;
  mobileInitialOpenKeys?: string[];
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-90')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function DevBadge() {
  return (
    <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
      DEV
    </span>
  );
}

function collectPaths(items: NavMenuItem[]): string[] {
  const paths: string[] = [];
  for (const item of items) {
    if (item.path) paths.push(item.path);
    if (item.children) paths.push(...collectPaths(item.children));
  }
  return paths;
}

function findOpenKeysForPath(items: NavMenuItem[], pathname: string): string[] {
  const keys: string[] = [];

  for (const item of items) {
    if (!item.children?.length) continue;

    const childPaths = collectPaths(item.children);
    const isActive =
      childPaths.some((path) => pathname.startsWith(path)) ||
      (item.path && pathname.startsWith(item.path));

    if (isActive) keys.push(item.key);
    keys.push(...findOpenKeysForPath(item.children, pathname));
  }

  return keys;
}

function isItemActive(item: NavMenuItem, pathname: string): boolean {
  if (item.path && pathname.startsWith(item.path)) return true;
  if (item.children) return item.children.some((child) => isItemActive(child, pathname));
  return false;
}

function findItemByKey(items: NavMenuItem[], key: string): NavMenuItem | null {
  for (const item of items) {
    if (item.key === key) return item;
    if (item.children) {
      const found = findItemByKey(item.children, key);
      if (found) return found;
    }
  }
  return null;
}

function collectDescendantKeysWithChildren(items: NavMenuItem[]): string[] {
  const keys: string[] = [];
  for (const item of items) {
    if (!item.children?.length) continue;
    keys.push(item.key);
    keys.push(...collectDescendantKeysWithChildren(item.children));
  }
  return keys;
}

function getExpandScope(
  item: NavMenuItem | null | undefined,
  defaultExpandScope: 'independent' | 'all',
): 'independent' | 'all' {
  return item?.expandScope ?? defaultExpandScope;
}

function seedDefaultExpandedSubtree(
  item: NavMenuItem,
  openKeys: Set<string>,
  seededKeys: Set<string>,
) {
  if (!item.defaultExpanded || !item.children?.length || seededKeys.has(item.key)) return;
  seededKeys.add(item.key);
  openKeys.add(item.key);
  for (const key of collectDescendantKeysWithChildren(item.children)) {
    openKeys.add(key);
  }
}

function applyDefaultExpandedKeysOnce(
  items: NavMenuItem[],
  pathname: string,
  openKeys: Set<string>,
  seededKeys: Set<string>,
) {
  for (const item of items) {
    if (item.defaultExpanded && item.children?.length && isItemActive(item, pathname)) {
      seedDefaultExpandedSubtree(item, openKeys, seededKeys);
    }
    if (item.children?.length) {
      applyDefaultExpandedKeysOnce(item.children, pathname, openKeys, seededKeys);
    }
  }
}

const rowBase = 'flex w-full items-center rounded-lg text-sm font-medium transition-colors';
const rowDefault = 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';
const rowActive = 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';
const childDefault =
  'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200';
const childActive =
  'bg-primary-50 font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300';

interface ItemContext {
  collapsed: boolean;
  depth: number;
  pathname: string;
  openKeys: Set<string>;
  onToggle: (key: string) => void;
  flyoutKey: string | null;
  onFlyoutToggle: (key: string | null) => void;
  childConnector: 'none' | 'tree';
  inFlyout?: boolean;
  flyoutDismissOnAction: boolean;
  onNavigate?: (path: string) => void;
  onMenuDismiss?: () => void;
}

function isNavPathActive(path: string, pathname: string, end?: boolean): boolean {
  if (end) return pathname === path;
  return pathname === path || (path !== '/' && pathname.startsWith(`${path}/`));
}

function NavMenuPathTarget({
  path,
  end,
  title,
  onAfterNavigate,
  className,
  children,
  ctx,
}: {
  path: string;
  end?: boolean;
  title?: string;
  onAfterNavigate?: () => void;
  className: string | ((isActive: boolean) => string);
  children: ReactNode;
  ctx: ItemContext;
}) {
  if (ctx.onNavigate) {
    const isActive = isNavPathActive(path, ctx.pathname, end);
    const resolvedClass = typeof className === 'function' ? className(isActive) : className;

    return (
      <button
        type="button"
        title={title}
        onClick={() => {
          ctx.onNavigate!(path);
          onAfterNavigate?.();
        }}
        className={resolvedClass}
      >
        {children}
      </button>
    );
  }

  return (
    <NavLink
      to={path}
      end={end}
      title={title}
      onClick={() => onAfterNavigate?.()}
      className={({ isActive }) =>
        typeof className === 'function' ? className(isActive) : className
      }
    >
      {children}
    </NavLink>
  );
}

function getFlyoutDismissOnAction(item: NavMenuItem, menuDefault: boolean): boolean {
  return item.flyoutDismissOnAction ?? menuDefault;
}

function dismissFlyoutIfNeeded(ctx: ItemContext, item: NavMenuItem) {
  if (!ctx.inFlyout) return;
  if (getFlyoutDismissOnAction(item, ctx.flyoutDismissOnAction)) {
    ctx.onFlyoutToggle(null);
  }
}

function handleLeafMenuAction(ctx: ItemContext, item: NavMenuItem) {
  dismissFlyoutIfNeeded(ctx, item);
  ctx.onMenuDismiss?.();
}

function rowPadding(depth: number, collapsed: boolean) {
  if (collapsed) return 'justify-center px-2 py-2.5';
  if (depth > 0) return 'gap-2 px-3 py-2';
  return 'gap-3 px-3 py-2.5';
}

function NavMenuIcon({ icon }: { icon?: ReactNode }) {
  if (!icon) return null;
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
      {icon}
    </span>
  );
}

function NavMenuLink({ item, ctx }: { item: NavMenuItem; ctx: ItemContext }) {
  const isChild = ctx.depth > 0;

  return (
    <NavMenuPathTarget
      path={item.path!}
      end={item.end}
      title={ctx.collapsed ? item.label : undefined}
      onAfterNavigate={() => handleLeafMenuAction(ctx, item)}
      ctx={ctx}
      className={(isActive) =>
        cn(
          rowBase,
          rowPadding(ctx.depth, ctx.collapsed),
          isChild ? (isActive ? childActive : childDefault) : isActive ? rowActive : rowDefault,
        )
      }
    >
      <NavMenuIcon icon={item.icon} />
      {!ctx.collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.devBadge && <DevBadge />}
        </>
      )}
    </NavMenuPathTarget>
  );
}

function isNavigateParent(item: NavMenuItem): boolean {
  return (
    Boolean(item.children?.length) &&
    (item.parentClick ?? 'expand') === 'navigate' &&
    Boolean(item.path)
  );
}

function NavMenuParentNavigateRow({
  item,
  ctx,
  expanded,
  onToggle,
}: {
  item: NavMenuItem;
  ctx: ItemContext;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const isActive = isItemActive(item, ctx.pathname);

  return (
    <div
      className={cn(
        rowBase,
        rowPadding(ctx.depth, ctx.collapsed),
        'gap-1',
        isActive ? rowActive : rowDefault,
      )}
    >
      <NavMenuPathTarget
        path={item.path!}
        end={item.end}
        onAfterNavigate={() => item.onClick?.()}
        ctx={ctx}
        className={(linkActive) =>
          cn(
            'flex min-w-0 flex-1 items-center gap-3 truncate',
            linkActive ? 'text-primary-700 dark:text-primary-300' : '',
          )
        }
      >
        <NavMenuIcon icon={item.icon} />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.devBadge && <DevBadge />}
      </NavMenuPathTarget>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggle();
        }}
        aria-expanded={expanded}
        aria-label={`${expanded ? t('components.common.collapse') : t('components.common.expand')} ${item.label}`}
        className="flex shrink-0 items-center justify-center rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <ChevronIcon expanded={expanded} />
      </button>
    </div>
  );
}

function NavMenuParentExpandRow({
  item,
  ctx,
  expanded,
  onMainClick,
  onToggle,
}: {
  item: NavMenuItem;
  ctx: ItemContext;
  expanded: boolean;
  onMainClick: () => void;
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const isActive = isItemActive(item, ctx.pathname);

  return (
    <div
      className={cn(
        rowBase,
        rowPadding(ctx.depth, ctx.collapsed),
        'gap-1',
        ctx.depth > 0 && !isActive ? childDefault : isActive ? rowActive : rowDefault,
      )}
    >
      <button
        type="button"
        onClick={onMainClick}
        className="flex min-w-0 flex-1 items-center gap-3 truncate text-left"
      >
        <NavMenuIcon icon={item.icon} />
        <span className="flex-1 truncate">{item.label}</span>
        {item.devBadge && <DevBadge />}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggle();
        }}
        aria-expanded={expanded}
        aria-label={`${expanded ? t('components.common.collapse') : t('components.common.expand')} ${item.label}`}
        className="flex shrink-0 items-center justify-center rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <ChevronIcon expanded={expanded} />
      </button>
    </div>
  );
}

function NavMenuButton({
  item,
  ctx,
  expanded,
  onClick,
}: {
  item: NavMenuItem;
  ctx: ItemContext;
  expanded?: boolean;
  onClick: () => void;
}) {
  const isActive = isItemActive(item, ctx.pathname);
  const showChevron = Boolean(item.children?.length) && !ctx.collapsed;

  return (
    <button
      type="button"
      onClick={onClick}
      title={ctx.collapsed ? item.label : undefined}
      className={cn(
        rowBase,
        rowPadding(ctx.depth, ctx.collapsed),
        ctx.depth > 0 && !isActive ? childDefault : isActive ? rowActive : rowDefault,
      )}
    >
      <NavMenuIcon icon={item.icon} />
      {!ctx.collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.devBadge && <DevBadge />}
          {showChevron && <ChevronIcon expanded={expanded ?? false} />}
        </>
      )}
    </button>
  );
}

function treeChildrenMargin() {
  return 'ml-3';
}

const TREE_BRANCH_W = 12;

const TREE_UPWARD_STUB_H = 8;

function NavMenuChildren({
  items,
  ctx,
  branchActive = false,
}: {
  items: NavMenuItem[];
  ctx: ItemContext;

  branchActive?: boolean;
}) {
  const childCtx = { ...ctx, depth: ctx.depth + 1 };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [trunkTop, setTrunkTop] = useState<number | null>(null);
  const [trunkHeight, setTrunkHeight] = useState<number | null>(null);

  const measureTrunk = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rows = wrapper.querySelectorAll('[data-nav-tree-row]');
    if (!rows.length) {
      setTrunkTop(null);
      setTrunkHeight(null);
      return;
    }

    const wrapperTop = wrapper.getBoundingClientRect().top;
    const firstRow = rows[0] as HTMLElement;
    const lastRow = rows[rows.length - 1] as HTMLElement;
    const firstMid =
      firstRow.getBoundingClientRect().top + firstRow.getBoundingClientRect().height / 2;
    const lastMid =
      lastRow.getBoundingClientRect().top + lastRow.getBoundingClientRect().height / 2;

    setTrunkTop(firstMid - wrapperTop);
    setTrunkHeight(lastMid - firstMid);
  }, []);

  useEffect(() => {
    measureTrunk();
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(measureTrunk);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [measureTrunk, items, ctx.openKeys]);

  if (ctx.childConnector === 'none') {
    return (
      <div className="ml-3 mt-2 space-y-1">
        {items.map((child) => (
          <NavMenuNode key={child.key} item={child} ctx={childCtx} />
        ))}
      </div>
    );
  }

  const showVerticalTrunk = trunkHeight != null && trunkHeight > 0;
  const showUpwardConnector = trunkTop != null && branchActive;

  return (
    <div ref={wrapperRef} className={cn('relative mt-2 overflow-visible', treeChildrenMargin())}>
      {showUpwardConnector && (
        <span
          className="pointer-events-none absolute left-0 w-px bg-gray-200 dark:bg-gray-700"
          style={{ top: -TREE_UPWARD_STUB_H, height: trunkTop + TREE_UPWARD_STUB_H }}
          aria-hidden
        />
      )}
      {showVerticalTrunk && (
        <span
          className="pointer-events-none absolute left-0 w-px bg-gray-200 dark:bg-gray-700"
          style={{ top: trunkTop ?? 0, height: trunkHeight ?? 0 }}
          aria-hidden
        />
      )}

      <ul className="list-none space-y-1">
        {items.map((child) => (
          <li key={child.key}>
            <div className="flex">
              <div
                className="pointer-events-none relative shrink-0"
                style={{ width: TREE_BRANCH_W }}
              >
                {}
                <span
                  className="absolute left-0 top-1/2 h-px w-3 bg-gray-200 dark:bg-gray-700"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1" data-nav-tree-row>
                <NavMenuNodeContent item={child} ctx={childCtx} />
              </div>
            </div>
            <NavMenuNodeSubtree item={child} ctx={childCtx} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavMenuNodeContent({ item, ctx }: { item: NavMenuItem; ctx: ItemContext }) {
  const hasChildren = Boolean(item.children?.length);
  const isOpen = ctx.openKeys.has(item.key);
  const isFlyoutOpen = ctx.flyoutKey === item.key;

  const handleClick = () => {
    if (ctx.collapsed && hasChildren && !ctx.inFlyout) {
      if (isFlyoutOpen) {
        ctx.onFlyoutToggle(null);
      } else {
        ctx.onFlyoutToggle(item.key);
        item.onClick?.();
      }
      return;
    }
    if (hasChildren) {
      ctx.onToggle(item.key);
      item.onClick?.();
      return;
    }
    item.onClick?.();
    handleLeafMenuAction(ctx, item);
  };

  if (!hasChildren && item.path && !item.onClick) {
    return <NavMenuLink item={item} ctx={ctx} />;
  }

  if (hasChildren && !ctx.collapsed) {
    const toggleOnly = () => {
      ctx.onToggle(item.key);
    };

    if (isNavigateParent(item)) {
      return (
        <NavMenuParentNavigateRow item={item} ctx={ctx} expanded={isOpen} onToggle={toggleOnly} />
      );
    }

    return (
      <NavMenuParentExpandRow
        item={item}
        ctx={ctx}
        expanded={isOpen}
        onMainClick={handleClick}
        onToggle={toggleOnly}
      />
    );
  }

  return <NavMenuButton item={item} ctx={ctx} expanded={isOpen} onClick={handleClick} />;
}

function NavMenuNodeSubtree({ item, ctx }: { item: NavMenuItem; ctx: ItemContext }) {
  const hasChildren = Boolean(item.children?.length);
  const isOpen = ctx.openKeys.has(item.key);
  const showChildren = !ctx.collapsed && hasChildren && isOpen;

  if (!showChildren) return null;

  return (
    <NavMenuChildren
      items={item.children!}
      ctx={ctx}
      branchActive={isItemActive(item, ctx.pathname)}
    />
  );
}

function NavMenuFlyoutDismissButton({ onClick }: { onClick: () => void }) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      aria-label={t('components.common.closeSubmenu')}
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

const FLYOUT_VIEWPORT_MARGIN = 16;
const FLYOUT_MIN_HEIGHT = 120;

function NavMenuFlyout({
  item,
  ctx,
  anchorRef,
}: {
  item: NavMenuItem;
  ctx: ItemContext;
  anchorRef: RefObject<HTMLElement | null>;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<{ top: number; maxHeight?: number }>({ top: 0 });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const anchor = anchorRef.current;
    if (!panel || !anchor) return;

    const syncPanelBounds = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const margin = FLYOUT_VIEWPORT_MARGIN;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - margin - anchorRect.top;

      panel.style.maxHeight = '';
      panel.style.top = '0px';

      const naturalHeight = panel.getBoundingClientRect().height;

      if (naturalHeight <= spaceBelow) {
        setPanelStyle({ top: 0 });
        return;
      }

      setPanelStyle({
        top: 0,
        maxHeight: Math.max(FLYOUT_MIN_HEIGHT, spaceBelow),
      });
    };

    syncPanelBounds();
    window.addEventListener('resize', syncPanelBounds);
    return () => window.removeEventListener('resize', syncPanelBounds);
  }, [anchorRef, item.key, item.children?.length]);

  const onFlyoutToggle = ctx.onFlyoutToggle;

  useEffect(() => {
    const dismiss = () => onFlyoutToggle(null);

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      // Flyout is rendered inside the anchor wrapper, so this covers trigger + panel.
      if (anchorRef.current?.contains(target)) return;
      dismiss();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorRef, onFlyoutToggle]);

  return (
    <div
      ref={panelRef}
      style={{
        top: panelStyle.top,
        ...(panelStyle.maxHeight != null ? { maxHeight: panelStyle.maxHeight } : undefined),
      }}
      className="absolute left-full top-0 z-[100] ml-2 flex min-w-[180px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      role="menu"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <NavMenuFlyoutDismissButton onClick={() => ctx.onFlyoutToggle(null)} />
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {item.label}
          {item.devBadge && <DevBadge />}
        </span>
      </div>
      <div className="scrollbar-hide min-h-0 space-y-1 overflow-y-auto overscroll-contain p-1.5 pt-2">
        {item.children!.map((child) => (
          <NavMenuNode
            key={child.key}
            item={child}
            ctx={{ ...ctx, depth: ctx.depth + 1, collapsed: false, inFlyout: true }}
          />
        ))}
      </div>
    </div>
  );
}

function NavMenuNode({ item, ctx }: { item: NavMenuItem; ctx: ItemContext }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const hasChildren = Boolean(item.children?.length);
  const isFlyoutOpen = ctx.flyoutKey === item.key;

  return (
    <div>
      <div ref={anchorRef} className={ctx.collapsed && hasChildren ? 'relative' : undefined}>
        <NavMenuNodeContent item={item} ctx={ctx} />
        {ctx.collapsed && hasChildren && isFlyoutOpen && (
          <NavMenuFlyout item={item} ctx={ctx} anchorRef={anchorRef} />
        )}
      </div>
      <NavMenuNodeSubtree item={item} ctx={ctx} />
    </div>
  );
}

const NAV_SECTION_THRESHOLD = 8;
const SCROLL_EDGE_THRESHOLD = 4;

interface NavMenuScrollState {
  canScroll: boolean;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

function getNavMenuScrollState(nav: HTMLElement | null, collapsed: boolean): NavMenuScrollState {
  if (!nav || collapsed) {
    return { canScroll: false, canScrollUp: false, canScrollDown: false };
  }

  const { scrollTop, scrollHeight, clientHeight } = nav;
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
  const canScroll = maxScrollTop > SCROLL_EDGE_THRESHOLD;

  return {
    canScroll,
    canScrollUp: canScroll && scrollTop > SCROLL_EDGE_THRESHOLD,
    canScrollDown: canScroll && scrollTop < maxScrollTop - SCROLL_EDGE_THRESHOLD,
  };
}

function afterNavScroll(nav: HTMLElement, onComplete: () => void) {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onComplete();
  };

  nav.addEventListener('scrollend', finish, { once: true });
  window.setTimeout(finish, 450);
}

function scrollNavMenuSection(nav: HTMLElement, direction: 'up' | 'down', onComplete?: () => void) {
  const sections = Array.from(nav.querySelectorAll<HTMLElement>('[data-nav-section]'));
  if (!sections.length) return;

  const navTop = nav.getBoundingClientRect().top;
  const maxScrollTop = Math.max(0, nav.scrollHeight - nav.clientHeight);

  const scrollTo = (top: number) => {
    const nextTop = Math.max(0, Math.min(top, maxScrollTop));
    nav.scrollTo({ top: nextTop, behavior: 'smooth' });
    if (onComplete) afterNavScroll(nav, onComplete);
  };

  if (direction === 'down') {
    const next = sections.find(
      (section) => section.getBoundingClientRect().top > navTop + NAV_SECTION_THRESHOLD,
    );

    if (next) {
      const top =
        nav.scrollTop + next.getBoundingClientRect().top - nav.getBoundingClientRect().top;
      scrollTo(top);
      return;
    }

    scrollTo(maxScrollTop);
    return;
  }

  const previous = [...sections]
    .reverse()
    .find((section) => section.getBoundingClientRect().top < navTop - NAV_SECTION_THRESHOLD);

  if (!previous) {
    scrollTo(0);
    return;
  }

  if (previous === sections[0]) {
    scrollTo(0);
    return;
  }

  const top =
    nav.scrollTop + previous.getBoundingClientRect().top - nav.getBoundingClientRect().top;
  scrollTo(top);
}

const ARROW_STROKE = {
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

function NavScrollUpIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" aria-hidden="true">
      <path {...ARROW_STROKE} d="M4.5 11 8 5.5 11.5 11" />
    </svg>
  );
}

function NavScrollDownIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" aria-hidden="true">
      <path {...ARROW_STROKE} d="M4.5 5 8 10.5 11.5 5" />
    </svg>
  );
}

function NavMenuScrollButton({
  direction,
  onClick,
}: {
  direction: 'up' | 'down';
  onClick: () => void;
}) {
  const { t } = useLocale();
  const label =
    direction === 'up' ? t('components.common.navScrollUp') : t('components.common.navScrollDown');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300/80 bg-transparent text-gray-500 transition-[transform,background-color,color] duration-200 ease-out hover:scale-105 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700 active:scale-100 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    >
      {direction === 'up' ? <NavScrollUpIcon /> : <NavScrollDownIcon />}
    </button>
  );
}

function NavMenuCollapseTrigger({
  collapsed,
  position,
  onToggle,
}: {
  collapsed: boolean;
  position: 'top-peek' | 'top' | 'center' | 'bottom';
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const menuToggleLabel = collapsed
    ? t('components.common.expandMenu')
    : t('components.common.collapseMenu');

  const chevronPath = collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7';

  const peekButtonClass =
    'absolute -right-3 z-30 flex w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-md transition-colors hover:bg-slate-50 hover:text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:hover:text-slate-200';

  if (position === 'top-peek') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(peekButtonClass, 'top-3 h-6')}
        aria-label={menuToggleLabel}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={chevronPath} />
        </svg>
      </button>
    );
  }

  if (position === 'center') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={cn(peekButtonClass, 'top-1/2 h-10 -translate-y-1/2')}
        aria-label={menuToggleLabel}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={chevronPath} />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full shrink-0 items-center text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300',
        position === 'top'
          ? 'border-b border-gray-200 dark:border-gray-700'
          : 'border-t border-gray-200 dark:border-gray-700',
        'justify-center px-2 py-2',
      )}
      aria-label={menuToggleLabel}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={chevronPath} />
      </svg>
    </button>
  );
}

function getInitialOpenKeys(
  items: NavMenuItem[],
  pathname: string,
  childrenMode: 'collapsible' | 'always',
  initialOpenKeys: string[] = [],
): Set<string> {
  if (childrenMode === 'always') {
    return new Set(collectDescendantKeysWithChildren(items));
  }
  return new Set([...findOpenKeysForPath(items, pathname), ...initialOpenKeys]);
}

const DEFAULT_MOBILE_INITIAL_OPEN_KEYS = ['documentation', 'components'];
const EMPTY_INITIAL_OPEN_KEYS: string[] = [];

export function NavMenu({
  items,
  collapsed: collapsedProp = false,
  className,
  collapsible = false,
  collapseTriggerPosition = 'top-peek',
  onCollapse,
  childrenMode = 'collapsible',
  childConnector = 'tree',
  defaultExpandScope = 'independent',
  flyoutDismissOnAction = true,
  pathname: pathnameProp,
  onNavigate,
  showScrollbar = false,
  scrollControls = 'all',
  embedded = false,
  onMenuDismiss,
  initialOpenKeys = EMPTY_INITIAL_OPEN_KEYS,
  mobileOpen = false,
  onMobileClose,
  mobileTitle,
  mobileInitialOpenKeys = DEFAULT_MOBILE_INITIAL_OPEN_KEYS,
}: NavMenuProps) {
  const { t } = useLocale();
  const { pathname: routerPathname } = useLocation();
  const pathname = pathnameProp ?? routerPathname;
  const defaultExpandedSeededRef = useRef<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);
  const isCollapseControlled = onCollapse !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(collapsedProp);
  const [scrollState, setScrollState] = useState<NavMenuScrollState>(() =>
    getNavMenuScrollState(null, collapsedProp),
  );

  const [openKeys, setOpenKeys] = useState<Set<string>>(() => {
    const next = getInitialOpenKeys(items, pathname, childrenMode, initialOpenKeys);
    applyDefaultExpandedKeysOnce(items, pathname, next, defaultExpandedSeededRef.current);
    return next;
  });
  const [flyoutKey, setFlyoutKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isCollapseControlled) {
      setInternalCollapsed(collapsedProp);
    }
  }, [collapsedProp, isCollapseControlled]);

  const collapsed = collapsible
    ? isCollapseControlled
      ? collapsedProp
      : internalCollapsed
    : collapsedProp;

  useEffect(() => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      for (const key of findOpenKeysForPath(items, pathname)) next.add(key);
      for (const key of initialOpenKeys) next.add(key);
      applyDefaultExpandedKeysOnce(items, pathname, next, defaultExpandedSeededRef.current);
      if (next.size === prev.size && [...next].every((key) => prev.has(key))) {
        return prev;
      }
      return next;
    });
  }, [pathname, items, initialOpenKeys]);

  useEffect(() => {
    if (!collapsed) setFlyoutKey(null);
  }, [collapsed]);

  const refreshScrollState = useCallback(() => {
    setScrollState(getNavMenuScrollState(navRef.current, collapsed));
  }, [collapsed]);

  useEffect(() => {
    refreshScrollState();
  }, [refreshScrollState, items, openKeys, collapsed]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => refreshScrollState();
    nav.addEventListener('scroll', handleScroll, { passive: true });
    nav.addEventListener('scrollend', handleScroll);

    const observer = new ResizeObserver(handleScroll);
    observer.observe(nav);
    for (const section of nav.querySelectorAll('[data-nav-section]')) {
      observer.observe(section);
    }

    return () => {
      nav.removeEventListener('scroll', handleScroll);
      nav.removeEventListener('scrollend', handleScroll);
      observer.disconnect();
    };
  }, [refreshScrollState, items, openKeys, collapsed]);

  const onToggle = useCallback(
    (key: string) => {
      const item = findItemByKey(items, key);
      const scope = getExpandScope(item, defaultExpandScope);

      setOpenKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
          if (scope === 'all' && item?.children) {
            for (const descendantKey of collectDescendantKeysWithChildren(item.children)) {
              next.delete(descendantKey);
            }
          }
        } else {
          next.add(key);
          if (item) seedDefaultExpandedSubtree(item, next, defaultExpandedSeededRef.current);
          if (scope === 'all' && item?.children) {
            for (const descendantKey of collectDescendantKeysWithChildren(item.children)) {
              next.add(descendantKey);
            }
          }
        }
        return next;
      });
    },
    [items, defaultExpandScope],
  );

  const onFlyoutToggle = useCallback((key: string | null) => {
    setFlyoutKey(key);
  }, []);

  const ctx: ItemContext = {
    collapsed,
    depth: 0,
    pathname,
    openKeys,
    onToggle,
    flyoutKey,
    onFlyoutToggle,
    childConnector,
    flyoutDismissOnAction,
    onNavigate,
    onMenuDismiss,
  };

  const handleCollapseToggle = () => {
    const next = !collapsed;
    if (!isCollapseControlled) {
      setInternalCollapsed(next);
    }
    onCollapse?.(next);
  };

  const scrollControlsEnabled = scrollControls !== 'none';
  const showSectionScrollControls = !collapsed && scrollState.canScroll && scrollControlsEnabled;
  const showScrollUp =
    showSectionScrollControls &&
    scrollState.canScrollUp &&
    (scrollControls === 'top' || scrollControls === 'all');
  const showScrollDown =
    showSectionScrollControls &&
    scrollState.canScrollDown &&
    (scrollControls === 'bottom' || scrollControls === 'all');

  const navScrollPadding = collapsed
    ? 'px-2 pt-2 pb-6'
    : cn(
        embedded ? 'px-0' : 'px-4',
        showSectionScrollControls
          ? 'py-2'
          : cn(
              embedded ? 'pt-1 pb-4' : 'pt-4',
              !embedded && (collapseTriggerPosition === 'bottom' ? 'pb-6' : 'pb-10'),
            ),
      );

  const scrollUp = () => {
    const nav = navRef.current;
    if (nav) scrollNavMenuSection(nav, 'up', refreshScrollState);
  };

  const scrollDown = () => {
    const nav = navRef.current;
    if (nav) scrollNavMenuSection(nav, 'down', refreshScrollState);
  };

  const scrollUpButton = showScrollUp ? (
    <div className={cn('w-full shrink-0', embedded ? 'pt-1' : 'pl-2 pt-1')}>
      <NavMenuScrollButton direction="up" onClick={scrollUp} />
    </div>
  ) : null;

  const scrollDownButton = showScrollDown ? (
    <div className={cn('w-full shrink-0', embedded ? 'pb-1' : 'pb-1 pl-2')}>
      <NavMenuScrollButton direction="down" onClick={scrollDown} />
    </div>
  ) : null;

  const menuNav = (
    <nav
      ref={navRef}
      className={cn(
        'relative min-h-0 flex-1 space-y-1.5',
        collapsed ? 'overflow-visible' : 'overflow-auto',
        navScrollPadding,
        !collapsed && !showScrollbar && 'scrollbar-hide',
      )}
      aria-label={t('components.common.navigation')}
    >
      {items.map((item) => (
        <div key={item.key} data-nav-section>
          <NavMenuNode item={item} ctx={ctx} />
        </div>
      ))}
    </nav>
  );

  const mobileDrawer = onMobileClose ? (
    <Drawer
      id="mobile-nav-drawer"
      isOpen={mobileOpen}
      onClose={onMobileClose}
      title={mobileTitle ?? t('components.common.menu')}
      placement="left"
      size="sm"
      contentClassName="!flex !min-h-0 !flex-col !overflow-hidden !px-3 !py-3"
      className="lg:hidden"
    >
      <NavMenu
        items={items}
        collapsible={false}
        embedded
        childConnector={childConnector}
        childrenMode={childrenMode}
        defaultExpandScope={defaultExpandScope}
        flyoutDismissOnAction={flyoutDismissOnAction}
        pathname={pathnameProp}
        onNavigate={onNavigate}
        showScrollbar={showScrollbar}
        scrollControls={scrollControls}
        initialOpenKeys={mobileInitialOpenKeys}
        onMenuDismiss={onMobileClose}
        className="min-h-0 flex-1"
      />
    </Drawer>
  ) : null;

  if (!collapsible) {
    const panel = (
      <div
        className={cn(
          'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-visible',
          className,
        )}
      >
        {scrollUpButton}
        {menuNav}
        {scrollDownButton}
      </div>
    );
    if (!mobileDrawer) return panel;
    return (
      <>
        {panel}
        {mobileDrawer}
      </>
    );
  }

  const panel = (
    <div
      className={cn(
        'relative flex h-full min-h-0 w-full flex-1 flex-col overflow-visible',
        className,
      )}
    >
      {collapseTriggerPosition === 'top' && (
        <NavMenuCollapseTrigger
          collapsed={collapsed}
          position="top"
          onToggle={handleCollapseToggle}
        />
      )}
      {scrollUpButton}
      {menuNav}
      {scrollDownButton}
      {collapseTriggerPosition === 'bottom' && (
        <NavMenuCollapseTrigger
          collapsed={collapsed}
          position="bottom"
          onToggle={handleCollapseToggle}
        />
      )}
      {(collapseTriggerPosition === 'top-peek' || collapseTriggerPosition === 'center') && (
        <NavMenuCollapseTrigger
          collapsed={collapsed}
          position={collapseTriggerPosition}
          onToggle={handleCollapseToggle}
        />
      )}
    </div>
  );

  if (!mobileDrawer) return panel;

  return (
    <>
      {panel}
      {mobileDrawer}
    </>
  );
}
