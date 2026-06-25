import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useLocale } from '@/context/LocaleContext';
import { scrollContainerToTop } from '@/utils/scrollContainer';

const SCROLL_THRESHOLD = 400;

function getScrollTargets(scrollContainer: HTMLElement): HTMLElement[] {
  const targets = [scrollContainer];
  if (scrollContainer !== document.documentElement && scrollContainer !== document.body) {
    targets.push(document.documentElement);
  }
  return targets;
}

export function ScrollToTop({ scrollContainer }: { scrollContainer: HTMLElement }) {
  const { t } = useLocale();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = getScrollTargets(scrollContainer);

    const updateVisible = () => {
      const scrolled = targets.some((target) => target.scrollTop > SCROLL_THRESHOLD);
      setVisible(scrolled);
    };

    updateVisible();

    for (const target of targets) {
      target.addEventListener('scroll', updateVisible, { passive: true });
    }

    const resizeObserver = new ResizeObserver(updateVisible);
    resizeObserver.observe(scrollContainer);
    for (const child of scrollContainer.children) {
      resizeObserver.observe(child);
    }

    return () => {
      for (const target of targets) {
        target.removeEventListener('scroll', updateVisible);
      }
      resizeObserver.disconnect();
    };
  }, [scrollContainer, location.pathname]);

  if (!visible) return null;

  return createPortal(
    <button
      type="button"
      onClick={() => scrollContainerToTop(scrollContainer)}
      aria-label={t('components.common.scrollToTop')}
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-colors hover:bg-gray-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-primary-400 dark:focus:ring-offset-gray-950"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>,
    document.body,
  );
}
