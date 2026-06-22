import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/context/LocaleContext';

export interface NavMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  /** When true, NavLink only matches the exact path (not nested routes). */
  end?: boolean;
  onClick?: () => void;
  children?: NavMenuItem[];
  /** Shows a yellow DEV badge next to the label (for dev-only sections like Storybook). */
  devBadge?: boolean;
  /**
   * `independent` — only this parent toggles; siblings stay as-is.
   * `all` — opening also expands every descendant level.
   */
  expandScope?: 'independent' | 'all';
  /** Seed fully expanded once when this branch is first opened; user collapse persists after. */
  defaultExpanded?: boolean;
  /** Close flyout after leaf/action child click when sidebar is collapsed. Overrides menu default. */
  flyoutDismissOnAction?: boolean;
  /**
   * When the item has `children`, controls the parent row click target.
   * `expand` — whole row toggles the subtree (default).
   * `navigate` — label/icon follow `path`; chevron toggles expand (requires `path`).
   */
  parentClick?: 'expand' | 'navigate';
}

export interface NavMenuProps {
  items: NavMenuItem[];
  collapsed?: boolean;
  className?: string;
  /** Shows a button to collapse/expand the menu (icons-only mode). */
  collapsible?: boolean;
  /** Position of the collapse trigger button. */
  collapseTriggerPosition?: 'top' | 'bottom';
  onCollapse?: (collapsed: boolean) => void;
  /** Default expanded (`always`) or collapsed (`collapsible`). Both modes can still be toggled. */
  childrenMode?: 'collapsible' | 'always';
  /** Connector lines between parent and child items. */
  childConnector?: 'none' | 'tree';
  /** Default expand scope for items without their own `expandScope`. */
  defaultExpandScope?: 'independent' | 'all';
  /** Close flyout after leaf/action child click in collapsed sidebar. Default true. */
  flyoutDismissOnAction?: boolean;
  /** Overrides router pathname (e.g. isolated storybook preview). Pair with `onNavigate`. */
  pathname?: string;
  /** Handles path selection without react-router navigation. Pair with `pathname`. */
  onNavigate?: (path: string) => void;
  /** When false (default), scrollbar is hidden but scrolling still works. */
  showScrollbar?: boolean;
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
      onAfterNavigate={() => dismissFlyoutIfNeeded(ctx, item)}
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
        onClick={onToggle}
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

/** px-3 padding — aligns vertical guide with the left edge of the parent icon / row content. */
function treeChildrenMargin() {
  return 'ml-3';
}

const TREE_BRANCH_W = 12; // w-3
/** Upward stub on first child — extends into mt-2 gap so the parent link is visible. */
const TREE_UPWARD_STUB_H = 8;

function NavMenuChildren({
  items,
  ctx,
  branchActive = false,
}: {
  items: NavMenuItem[];
  ctx: ItemContext;
  /** When true, show the upward stub linking the first child to its parent (active route in this branch). */
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
                {/* horizontal branch: starts at vertical edge, goes right only */}
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
    if (hasChildren) ctx.onToggle(item.key);
    item.onClick?.();
    if (!hasChildren) dismissFlyoutIfNeeded(ctx, item);
  };

  if (!hasChildren && item.path && !item.onClick) {
    return <NavMenuLink item={item} ctx={ctx} />;
  }

  if (isNavigateParent(item) && !ctx.collapsed && !ctx.inFlyout) {
    return (
      <NavMenuParentNavigateRow
        item={item}
        ctx={ctx}
        expanded={isOpen}
        onToggle={() => {
          if (hasChildren) ctx.onToggle(item.key);
        }}
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

function NavMenuFlyout({ item, ctx }: { item: NavMenuItem; ctx: ItemContext }) {
  return (
    <div
      className="absolute left-full top-0 z-[100] ml-2 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      role="menu"
    >
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <NavMenuFlyoutDismissButton onClick={() => ctx.onFlyoutToggle(null)} />
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {item.label}
          {item.devBadge && <DevBadge />}
        </span>
      </div>
      <div className="space-y-1 p-1.5 pt-2">
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
  const hasChildren = Boolean(item.children?.length);
  const isFlyoutOpen = ctx.flyoutKey === item.key;

  return (
    <div className={ctx.collapsed && hasChildren ? 'relative' : undefined}>
      <NavMenuNodeContent item={item} ctx={ctx} />
      {ctx.collapsed && hasChildren && isFlyoutOpen && <NavMenuFlyout item={item} ctx={ctx} />}
      <NavMenuNodeSubtree item={item} ctx={ctx} />
    </div>
  );
}

function NavMenuCollapseTrigger({
  collapsed,
  position,
  onToggle,
}: {
  collapsed: boolean;
  position: 'top' | 'bottom';
  onToggle: () => void;
}) {
  const { t } = useLocale();
  const menuToggleLabel = collapsed
    ? t('components.common.expandMenu')
    : t('components.common.collapseMenu');

  if (position === 'top') {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-3 z-30 flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 shadow-md transition-colors hover:bg-slate-50 hover:text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:hover:text-slate-200"
        aria-label={menuToggleLabel}
      >
        <svg
          className="h-3.5 w-3.5"
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
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center border-t border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300',
        collapsed ? 'justify-center px-2 py-2' : 'justify-end px-3 py-2',
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
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
        />
      </svg>
    </button>
  );
}

function getInitialOpenKeys(
  items: NavMenuItem[],
  pathname: string,
  childrenMode: 'collapsible' | 'always',
): Set<string> {
  if (childrenMode === 'always') {
    return new Set(collectDescendantKeysWithChildren(items));
  }
  return new Set(findOpenKeysForPath(items, pathname));
}

export function NavMenu({
  items,
  collapsed = false,
  className,
  collapsible = false,
  collapseTriggerPosition = 'top',
  onCollapse,
  childrenMode = 'collapsible',
  childConnector = 'tree',
  defaultExpandScope = 'independent',
  flyoutDismissOnAction = true,
  pathname: pathnameProp,
  onNavigate,
  showScrollbar = false,
}: NavMenuProps) {
  const { t } = useLocale();
  const { pathname: routerPathname } = useLocation();
  const pathname = pathnameProp ?? routerPathname;
  const defaultExpandedSeededRef = useRef<Set<string>>(new Set());

  const [openKeys, setOpenKeys] = useState<Set<string>>(() =>
    getInitialOpenKeys(items, pathname, childrenMode),
  );
  const [flyoutKey, setFlyoutKey] = useState<string | null>(null);

  useEffect(() => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      for (const key of findOpenKeysForPath(items, pathname)) next.add(key);
      applyDefaultExpandedKeysOnce(items, pathname, next, defaultExpandedSeededRef.current);
      return next;
    });
  }, [pathname, items]);

  useEffect(() => {
    if (!collapsed) setFlyoutKey(null);
  }, [collapsed]);

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
  };

  const handleCollapseToggle = () => onCollapse?.(!collapsed);

  const menuNav = (
    <nav
      className={cn(
        'relative flex-1 space-y-1.5',
        collapsed ? 'overflow-visible p-2' : 'overflow-auto p-4',
        !collapsed && !showScrollbar && 'scrollbar-hide',
        !collapsible && className,
      )}
      aria-label={t('components.common.navigation')}
    >
      {items.map((item) => (
        <div key={item.key}>
          <NavMenuNode item={item} ctx={ctx} />
        </div>
      ))}
    </nav>
  );

  if (!collapsible) {
    return menuNav;
  }

  return (
    <div
      className={cn('relative flex h-full flex-col overflow-visible', className)}
    >
      {collapsible && collapseTriggerPosition === 'top' && (
        <NavMenuCollapseTrigger
          collapsed={collapsed}
          position="top"
          onToggle={handleCollapseToggle}
        />
      )}
      {menuNav}
      {collapsible && collapseTriggerPosition === 'bottom' && (
        <NavMenuCollapseTrigger
          collapsed={collapsed}
          position="bottom"
          onToggle={handleCollapseToggle}
        />
      )}
    </div>
  );
}
