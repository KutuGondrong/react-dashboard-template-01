import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'label'
  | 'overline';

export type TypographyColor = 'default' | 'muted' | 'primary' | 'success' | 'danger' | 'warning';
export type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TypographyAlign = 'left' | 'center' | 'right';
export type TypographyLevel = 1 | 2 | 3 | 4;
export type TypographyComponent = 'title' | 'text' | 'paragraph' | 'caption' | 'label' | 'overline';

export interface TypographySharedProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  color?: TypographyColor;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  truncate?: boolean;
  as?: ElementType;
  children: ReactNode;
}

export interface TypographyTitleProps extends TypographySharedProps {
  level?: TypographyLevel;
}

const variantClasses: Record<TypographyVariant, string> = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-3xl font-semibold tracking-tight',
  h3: 'text-2xl font-semibold',
  h4: 'text-xl font-semibold',
  body: 'text-base font-normal',
  bodySm: 'text-sm font-normal',
  caption: 'text-xs font-normal',
  label: 'text-sm font-medium',
  overline: 'text-xs font-semibold uppercase tracking-wider',
};

const defaultElement: Record<TypographyVariant, ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  bodySm: 'span',
  caption: 'span',
  label: 'label',
  overline: 'span',
};

const colorClasses: Record<TypographyColor, string> = {
  default: 'text-gray-900 dark:text-gray-100',
  muted: 'text-gray-500 dark:text-gray-400',
  primary: 'text-primary-600 dark:text-primary-400',
  success: 'text-green-600 dark:text-green-400',
  danger: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

const weightClasses: Record<TypographyWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignClasses: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function TypographyBase({
  variant,
  color = 'default',
  weight,
  align = 'left',
  truncate = false,
  as,
  className = '',
  children,
  ...rest
}: TypographySharedProps & { variant: TypographyVariant }) {
  const Component = as ?? defaultElement[variant];

  return createElement(
    Component,
    {
      ...rest,
      className: [
        variantClasses[variant],
        colorClasses[color],
        weight ? weightClasses[weight] : '',
        alignClasses[align],
        truncate ? 'truncate' : '',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    },
    children,
  );
}

function Title({ level = 1, as, ...props }: TypographyTitleProps) {
  const variant = `h${level}` as TypographyVariant;
  return <TypographyBase variant={variant} as={as ?? (`h${level}` as ElementType)} {...props} />;
}

function Text(props: TypographySharedProps) {
  return <TypographyBase variant="bodySm" as={props.as ?? 'span'} {...props} />;
}

function Paragraph(props: TypographySharedProps) {
  return <TypographyBase variant="body" as={props.as ?? 'p'} {...props} />;
}

function Caption(props: TypographySharedProps) {
  return <TypographyBase variant="caption" as={props.as ?? 'span'} {...props} />;
}

function Label(props: TypographySharedProps) {
  return <TypographyBase variant="label" as={props.as ?? 'label'} {...props} />;
}

function Overline(props: TypographySharedProps) {
  return <TypographyBase variant="overline" as={props.as ?? 'span'} {...props} />;
}

export const Typography = {
  Title,
  Text,
  Paragraph,
  Caption,
  Label,
  Overline,
};

export const TYPOGRAPHY_COMPONENT_MAP = {
  title: 'Title',
  text: 'Text',
  paragraph: 'Paragraph',
  caption: 'Caption',
  label: 'Label',
  overline: 'Overline',
} as const;
