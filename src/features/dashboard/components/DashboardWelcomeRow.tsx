import { useLayoutEffect, useRef, useState } from 'react';
import type { User } from '@/models/model.type';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import {
  DashboardProfileCard,
  DASHBOARD_PROFILE_MIN_WIDTH_PX,
} from '@/features/dashboard/components/DashboardProfileCard';

interface DashboardWelcomeRowProps {
  title: string;
  subtitle: string;
  user?: User | null;
}

const ROW_GAP = 16;

function titleIsMultiLine(titleEl: HTMLElement): boolean {
  const styles = getComputedStyle(titleEl);
  const fontSize = parseFloat(styles.fontSize) || 24;
  const parsedLineHeight = parseFloat(styles.lineHeight);
  const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.25;
  return titleEl.scrollHeight > lineHeight * 1.35;
}

/**
 * Profile stays to the right while the welcome title is one line.
 * If the title would wrap (multi-line) beside the profile, profile moves below.
 */
export function DashboardWelcomeRow({ title, subtitle, user }: DashboardWelcomeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [stackProfile, setStackProfile] = useState(false);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const titleEl = titleRef.current;
    if (!row || !titleEl || !user) {
      setStackProfile(false);
      return;
    }

    const measure = () => {
      const containerWidth = row.clientWidth;
      if (containerWidth <= 0) return;

      const welcomeEl = titleEl.parentElement;
      const welcomeStyles = getComputedStyle(welcomeEl ?? titleEl);
      const padX = parseFloat(welcomeStyles.paddingLeft) + parseFloat(welcomeStyles.paddingRight);

      // Probe title at the width it would have if profile stayed beside it (with min width).
      const sideBySideTitleWidth = Math.max(
        0,
        containerWidth - ROW_GAP - DASHBOARD_PROFILE_MIN_WIDTH_PX - padX,
      );
      const previousMaxWidth = titleEl.style.maxWidth;
      titleEl.style.maxWidth = `${sideBySideTitleWidth}px`;
      const multiLine = titleIsMultiLine(titleEl);
      titleEl.style.maxWidth = previousMaxWidth;

      setStackProfile(multiLine);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    observer.observe(titleEl);
    return () => observer.disconnect();
  }, [title, subtitle, user]);

  if (!user) {
    return <DashboardHeader title={title} subtitle={subtitle} />;
  }

  return (
    <div
      ref={rowRef}
      className={`grid grid-cols-1 gap-4 ${
        stackProfile ? '' : 'sm:grid-cols-[minmax(0,1fr)_minmax(15rem,auto)] sm:items-stretch'
      }`}
    >
      <DashboardHeader title={title} subtitle={subtitle} titleRef={titleRef} />
      <DashboardProfileCard user={user} />
    </div>
  );
}
