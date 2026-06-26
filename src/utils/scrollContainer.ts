function isScrollableElement(element: HTMLElement): boolean {
  const { overflowY } = window.getComputedStyle(element);
  const allowsScroll = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
  return allowsScroll && element.scrollHeight > element.clientHeight + 1;
}

export function findOutermostScrollableParent(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;
  let scrollable: HTMLElement | null = null;

  while (parent && parent !== document.body) {
    if (isScrollableElement(parent)) {
      scrollable = parent;
    }
    parent = parent.parentElement;
  }

  return scrollable;
}

export function getScrollContainer(element: HTMLElement): HTMLElement {
  if (isScrollableElement(element)) return element;
  return findOutermostScrollableParent(element) ?? document.documentElement;
}

function collectScrollableElements(root: HTMLElement): HTMLElement[] {
  const scrollables: HTMLElement[] = [];

  const visit = (element: HTMLElement) => {
    if (isScrollableElement(element)) scrollables.push(element);
    for (const child of element.children) {
      if (child instanceof HTMLElement) visit(child);
    }
  };

  visit(root);
  return scrollables;
}

/** Instant scroll reset for route changes (no smooth animation). */
export function resetScrollPosition(root: HTMLElement): void {
  const scrollables = collectScrollableElements(root);
  if (root.scrollTop > 0 && !scrollables.includes(root)) {
    scrollables.unshift(root);
  }

  for (const element of scrollables) {
    element.scrollTop = 0;
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function scrollContainerToTop(scrollContainer: HTMLElement): void {
  scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });

  if (
    scrollContainer !== document.documentElement &&
    scrollContainer !== document.body &&
    document.documentElement.scrollTop > 0
  ) {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
