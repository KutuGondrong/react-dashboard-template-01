import type { HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/components/Layout/layoutUtils';
import { Typography } from '@/components/Typography';

export type CardVariant = 'default' | 'alternate';

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
  alternate: 'border-primary-100 bg-primary-50 dark:border-gray-600 dark:bg-gray-800',
};

const CLICKABLE_CARD_CLASSES =
  'group transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: string;
  description?: string;
  children?: ReactNode;
  actionLabel?: string;
  href?: string;
  variant?: CardVariant;
  /** When true, the whole card navigates via `href`. When false, only `actionLabel` is a link. */
  clickable?: boolean;
}

function CardAction({
  label,
  href,
  isWholeCardClickable,
}: {
  label: string;
  href?: string;
  isWholeCardClickable: boolean;
}) {
  const content = (
    <>
      {label}
      <svg
        className={cn(
          'h-4 w-4 transition-transform',
          isWholeCardClickable
            ? 'group-hover:translate-x-0.5'
            : 'group-hover/action:translate-x-0.5',
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </>
  );

  if (href && !isWholeCardClickable) {
    return (
      <Link
        to={href}
        className="group/action mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        {content}
      </Link>
    );
  }

  return (
    <span className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400">
      {content}
    </span>
  );
}

function CardContent({
  title,
  description,
  children,
  actionLabel,
  actionHref,
  isWholeCardClickable,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  isWholeCardClickable: boolean;
}) {
  return (
    <>
      {title ? (
        <Typography.Text
          weight="semibold"
          className={cn(
            'w-full text-base text-gray-900 dark:text-gray-100',
            isWholeCardClickable &&
              'transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-300',
          )}
        >
          {title}
        </Typography.Text>
      ) : null}

      {children != null ? <div className="w-full">{children}</div> : null}

      {description ? (
        <Typography.Text
          color="muted"
          className={cn(
            'w-full flex-1 text-sm leading-relaxed',
            children || title ? 'mt-3' : undefined,
          )}
        >
          {description}
        </Typography.Text>
      ) : null}

      {actionLabel ? (
        <CardAction
          label={actionLabel}
          href={actionHref}
          isWholeCardClickable={isWholeCardClickable}
        />
      ) : null}
    </>
  );
}

export function Card({
  title,
  description,
  children,
  actionLabel,
  href,
  variant = 'default',
  clickable = false,
  className = '',
  ...props
}: CardProps) {
  const isWholeCardClickable = clickable && Boolean(href);
  const actionHref = href && actionLabel && !isWholeCardClickable ? href : undefined;

  const surfaceClasses = cn(
    'flex flex-col items-start rounded-xl border p-5 shadow-sm',
    VARIANT_CLASSES[variant],
    isWholeCardClickable && CLICKABLE_CARD_CLASSES,
    className,
  );

  if (isWholeCardClickable) {
    return (
      <Link to={href!} className={surfaceClasses} {...(props as object)}>
        <CardContent
          title={title}
          description={description}
          actionLabel={actionLabel}
          isWholeCardClickable
        >
          {children}
        </CardContent>
      </Link>
    );
  }

  return (
    <article className={surfaceClasses} {...props}>
      <CardContent
        title={title}
        description={description}
        actionLabel={actionLabel}
        actionHref={actionHref}
        isWholeCardClickable={false}
      >
        {children}
      </CardContent>
    </article>
  );
}
