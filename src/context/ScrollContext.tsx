import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { isScrollToTopEnabled } from '@/config/scrollToTop';
import { ScrollToTop } from '@/components/ScrollToTop/ScrollToTop';
import { getScrollContainer, resetScrollPosition } from '@/utils/scrollContainer';

interface ScrollContextValue {
  scrollContainerRef: (node: HTMLElement | null) => void;
  scrollAnchorRef: (node: HTMLElement | null) => void;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  const modeRef = useRef<'direct' | 'anchor'>('direct');
  const anchorRef = useRef<HTMLElement | null>(null);
  const previousPathnameRef = useRef<string | null>(null);

  const scrollContainerRef = useCallback((node: HTMLElement | null) => {
    modeRef.current = 'direct';
    anchorRef.current = null;
    setScrollContainer(node);
  }, []);

  const scrollAnchorRef = useCallback((node: HTMLElement | null) => {
    modeRef.current = 'anchor';
    anchorRef.current = node;
    setScrollContainer(node ? getScrollContainer(node) : null);
  }, []);

  useEffect(() => {
    if (modeRef.current !== 'anchor' || !anchorRef.current) return;
    setScrollContainer(getScrollContainer(anchorRef.current));
  }, [location.pathname]);

  useEffect(() => {
    if (!scrollContainer) return;

    const isNavigation =
      previousPathnameRef.current !== null && previousPathnameRef.current !== location.pathname;
    previousPathnameRef.current = location.pathname;

    if (!isNavigation || location.hash) return;

    resetScrollPosition(scrollContainer);
  }, [location.pathname, location.hash, scrollContainer]);

  const value = useMemo(
    () => ({ scrollContainerRef, scrollAnchorRef }),
    [scrollContainerRef, scrollAnchorRef],
  );

  return (
    <ScrollContext.Provider value={value}>
      {children}
      {isScrollToTopEnabled && scrollContainer && <ScrollToTop scrollContainer={scrollContainer} />}
    </ScrollContext.Provider>
  );
}

function useScrollContext(): ScrollContextValue {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('Scroll components must be used within a ScrollProvider');
  }
  return context;
}

export function useScrollContainerRef(): ScrollContextValue['scrollContainerRef'] {
  return useScrollContext().scrollContainerRef;
}

export function useScrollAnchorRef(): ScrollContextValue['scrollAnchorRef'] {
  return useScrollContext().scrollAnchorRef;
}
