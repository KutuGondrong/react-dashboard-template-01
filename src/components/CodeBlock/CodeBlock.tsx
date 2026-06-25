import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/components/Layout/layoutUtils';
import { useLocale } from '@/context/LocaleContext';

export type CodeBlockVariant = 'inline' | 'accordion';

export interface CodeBlockProps {
  code: string;
  variant?: CodeBlockVariant;
  /** Inline: show first N lines with expand toggle when code is longer. */
  previewLines?: number;
  defaultExpanded?: boolean;
  /** Accordion: header title (required when variant is accordion). */
  title?: string;
  /** Accordion: helper text shown when collapsed (hidden after expand). */
  hint?: string;
  defaultOpen?: boolean;
  compact?: boolean;
  className?: string;
}

function ChevronIcon({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      className={cn(
        'h-4 w-4 shrink-0 transition-transform duration-200',
        expanded && 'rotate-180',
        className,
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/** Trim trailing empty lines so a 2-line snippet is not counted as 3. */
function getCodeLines(code: string): string[] {
  const lines = code.split('\n');
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

function CopyButton({
  copied,
  onCopy,
  className,
}: {
  copied: boolean;
  onCopy: () => void;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        'rounded-md bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white',
        className,
      )}
    >
      {copied ? t('components.common.copied') : t('components.common.copy')}
    </button>
  );
}

function InlineCodeBlock({
  code,
  previewLines,
  defaultExpanded = false,
  className,
}: Pick<CodeBlockProps, 'code' | 'previewLines' | 'defaultExpanded' | 'className'>) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const lines = getCodeLines(code);
  const isCollapsible = previewLines != null && lines.length > previewLines;
  const displayedCode = isCollapsible && !expanded ? lines.slice(0, previewLines).join('\n') : code;
  const toggleLabel = expanded
    ? t('components.common.codeBlockCollapse')
    : t('components.common.codeBlockExpand');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'relative w-full min-w-0 rounded-lg border border-gray-200 bg-gray-950 dark:border-gray-700',
        className,
      )}
    >
      {isCollapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label={toggleLabel}
          title={toggleLabel}
          className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        >
          <ChevronIcon expanded={expanded} />
        </button>
      ) : null}
      <CopyButton copied={copied} onCopy={handleCopy} className="absolute right-2 top-2 z-10" />
      <div className="relative min-w-0">
        <pre
          className={cn(
            'max-w-full overflow-x-auto whitespace-pre p-4 pt-10 font-mono text-xs leading-relaxed text-gray-100',
            isCollapsible && !expanded && 'pb-2',
          )}
        >
          <code className="block whitespace-pre">{displayedCode}</code>
        </pre>
        {isCollapsible && !expanded ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-gray-950 to-transparent"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
}

function AccordionCodeBlock({
  code,
  title,
  hint,
  defaultOpen = false,
  compact = false,
  className,
}: Pick<CodeBlockProps, 'code' | 'title' | 'hint' | 'defaultOpen' | 'compact' | 'className'>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  const resizePre = useCallback(() => {
    const el = preRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resizePre();
    const el = preRef.current;
    if (!el?.parentElement) return;
    const observer = new ResizeObserver(() => resizePre());
    observer.observe(el.parentElement);
    return () => observer.disconnect();
  }, [code, isOpen, resizePre]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'w-full min-w-0 rounded-lg border border-gray-200 dark:border-gray-700',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'flex w-full min-w-0 items-center justify-between gap-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300',
          compact ? 'px-3 py-2' : 'px-4 py-3',
        )}
        aria-expanded={isOpen}
      >
        <span className="min-w-0 truncate">{title}</span>
        <ChevronIcon expanded={isOpen} />
      </button>

      {hint && !isOpen ? (
        <p
          className={cn(
            'text-xs text-gray-500 dark:text-gray-400',
            compact ? 'px-3 pb-2' : 'px-4 pb-3',
          )}
        >
          {hint}
        </p>
      ) : null}

      {isOpen ? (
        <div className="w-full min-w-0 border-t border-gray-200 dark:border-gray-700">
          <div
            className={cn(
              'flex items-center justify-end gap-3',
              compact ? 'px-3 pt-2' : 'px-4 pt-3',
            )}
          >
            <CopyButton
              copied={copied}
              onCopy={handleCopy}
              className="shrink-0 bg-gray-700 hover:bg-gray-600"
            />
          </div>
          <div className={cn('min-w-0', compact ? 'p-3 pt-0' : 'p-4')}>
            <pre
              ref={preRef}
              className="w-full min-w-0 max-w-full overflow-x-auto whitespace-pre rounded-lg bg-gray-900 p-4 font-mono text-xs leading-relaxed text-green-400"
            >
              <code className="block whitespace-pre">{code}</code>
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CodeBlock({
  code,
  variant = 'inline',
  previewLines,
  defaultExpanded = false,
  title = '',
  hint,
  defaultOpen = false,
  compact = false,
  className,
}: CodeBlockProps) {
  if (variant === 'accordion') {
    return (
      <AccordionCodeBlock
        code={code}
        title={title}
        hint={hint}
        defaultOpen={defaultOpen}
        compact={compact}
        className={className}
      />
    );
  }

  return (
    <InlineCodeBlock
      code={code}
      previewLines={previewLines}
      defaultExpanded={defaultExpanded}
      className={className}
    />
  );
}
