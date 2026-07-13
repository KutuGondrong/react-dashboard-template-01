import { resolveChartColor } from '@/config/color.tokens';
import { useLocale } from '@/context/LocaleContext';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { formatChartValue } from './chartUtils';
import type { DonutChartProps, DonutLegendLayout } from './chart.types';
import { useChartAnimationKey } from './useChartAnimationKey';

/** Fixed SVG coordinate space — visual size comes from CSS/px layout. */
const VIEWBOX_SIZE = 200;
const STROKE_WIDTH = 28;
const VIEWBOX_RADIUS = (VIEWBOX_SIZE - STROKE_WIDTH) / 2;
const VIEWBOX_CENTER = VIEWBOX_SIZE / 2;
const VIEWBOX_HOLE_DIAMETER = VIEWBOX_SIZE - STROKE_WIDTH;

/** Comfortable floor when size is dynamic; also used as side-layout threshold base. */
const DYNAMIC_RING_FLOOR = 160;
/** Center legend only when the available square is at least this large. */
const CENTER_LAYOUT_MIN = 280;
/** Side layout requires remaining width for the ring ≥ this ratio of the size target. */
const SIDE_RING_RATIO = 0.85;
const LAYOUT_GAP = 16;
const SIZE_EPSILON = 2;
const RESIZE_DEBOUNCE_MS = 50;

type MeasuredBox = { width: number; height: number };

function isNilSize(size: number | null | undefined): boolean {
  return size == null || size === 0 || Number.isNaN(size);
}

function resolveSizeTarget(size: number | null | undefined): number {
  return isNilSize(size) ? DYNAMIC_RING_FLOOR : Math.max(0, size as number);
}

function hasDefiniteHeight(el: HTMLElement): boolean {
  const { clientHeight } = el;
  if (clientHeight <= 0) return false;

  const probe = document.createElement('div');
  probe.style.cssText =
    'height:100px;width:1px;pointer-events:none;visibility:hidden;flex:none;position:relative;';
  probe.setAttribute('aria-hidden', 'true');
  el.appendChild(probe);
  const nextHeight = el.clientHeight;
  el.removeChild(probe);

  // Constrained height does not grow (much) when a taller child is inserted.
  return nextHeight < clientHeight + 50;
}

function contentBoxSize(el: HTMLElement): MeasuredBox {
  const style = getComputedStyle(el);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  return {
    width: Math.max(0, el.clientWidth - paddingX),
    height: Math.max(0, el.clientHeight - paddingY),
  };
}

function clampRingSize(
  available: number,
  sizeProp: number | null | undefined,
  containerLimit: number,
): number {
  const room = Math.max(0, Math.floor(Math.min(available, containerLimit)));
  if (isNilSize(sizeProp)) {
    // Dynamic: fill remaining container space.
    return room;
  }
  // Explicit size: use that value; shrink only when the container is smaller.
  return Math.min(room, Math.max(0, sizeProp as number));
}

function pickLegendLayout(args: {
  box: MeasuredBox;
  legend: MeasuredBox;
  definiteHeight: boolean;
  sizeProp: number | null | undefined;
}): { layout: DonutLegendLayout; ringSize: number } {
  const { box, legend, definiteHeight, sizeProp } = args;
  const sizeTarget = resolveSizeTarget(sizeProp);
  const sideMinRing = sizeTarget * SIDE_RING_RATIO;

  const tryCenter = (): { layout: DonutLegendLayout; ringSize: number } | null => {
    if (!definiteHeight) return null;
    const side = Math.min(box.width, box.height);
    if (side < CENTER_LAYOUT_MIN) return null;

    const ringSize = clampRingSize(side, sizeProp, side);
    if (ringSize < CENTER_LAYOUT_MIN) return null;

    const holePx = (VIEWBOX_HOLE_DIAMETER / VIEWBOX_SIZE) * ringSize;
    // Reserve space for total + optional center label above the legend list.
    const reservedCenterText = 52;
    if (legend.width > holePx - 8 || legend.height > holePx - reservedCenterText) {
      return null;
    }

    return { layout: 'center', ringSize };
  };

  const tryRight = (): { layout: DonutLegendLayout; ringSize: number } | null => {
    const widthForRing = box.width - LAYOUT_GAP - legend.width;
    if (widthForRing < sideMinRing) return null;

    // Auto-height: use the size target as the natural height budget (no infinite grow).
    const heightBudget = definiteHeight ? box.height : sizeTarget;
    const ringSize = clampRingSize(widthForRing, sizeProp, heightBudget);
    if (ringSize < sideMinRing) return null;

    return { layout: 'right', ringSize };
  };

  const tryBottom = (): { layout: DonutLegendLayout; ringSize: number } => {
    const heightForRing = definiteHeight
      ? Math.max(0, box.height - LAYOUT_GAP - legend.height)
      : sizeTarget;
    const ringSize = clampRingSize(box.width, sizeProp, heightForRing);
    return { layout: 'bottom', ringSize: Math.max(0, ringSize) };
  };

  if (definiteHeight) {
    return tryCenter() ?? tryRight() ?? tryBottom();
  }

  return tryRight() ?? tryBottom();
}

function LegendList({
  segments,
  className = '',
  compact = false,
  stretch = false,
}: {
  segments: Array<{ labelKey: string; label: string; color: string; percentage: number }>;
  className?: string;
  compact?: boolean;
  stretch?: boolean;
}) {
  return (
    <ul className={`${compact ? 'space-y-1' : 'space-y-2'} ${className}`.trim()}>
      {segments.map((segment) => (
        <li
          key={segment.labelKey}
          className={`flex items-center whitespace-nowrap ${
            compact ? 'justify-center gap-1.5 text-[11px] leading-tight' : 'gap-2 text-sm'
          } ${stretch ? 'w-full' : ''}`}
        >
          <span
            className={`shrink-0 rounded-full ${compact ? 'h-2 w-2' : 'h-3 w-3'}`}
            style={{ backgroundColor: segment.color }}
            aria-hidden="true"
          />
          {compact ? (
            <span className="text-gray-600 dark:text-gray-300">
              {segment.label}{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {segment.percentage.toFixed(0)}%
              </span>
            </span>
          ) : (
            <>
              <span className="text-gray-600 dark:text-gray-300">{segment.label}</span>
              <span
                className={`font-medium text-gray-900 dark:text-white ${stretch ? 'ml-auto' : ''}`}
              >
                {segment.percentage.toFixed(0)}%
              </span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export function DonutChart({
  segments,
  total,
  size = 0,
  className = '',
  animated = true,
  centerLabel,
}: DonutChartProps) {
  const { t } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const legendMeasureRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);
  const layoutRef = useRef<{ layout: DonutLegendLayout; ringSize: number }>({
    layout: 'bottom',
    ringSize: resolveSizeTarget(size),
  });

  const [layout, setLayout] = useState<DonutLegendLayout>('bottom');
  const [ringSize, setRingSize] = useState(() => resolveSizeTarget(size));

  const dataReplayToken = useMemo(
    () => `${total}:${segments.map((segment) => `${segment.labelKey}:${segment.value}`).join('|')}`,
    [segments, total],
  );
  const animationKey = useChartAnimationKey(animated, dataReplayToken);

  const circumference = 2 * Math.PI * VIEWBOX_RADIUS;
  const [animatedOffset, setAnimatedOffset] = useState(animated ? circumference : 0);

  const segmentData = segments.map((segment) => ({
    ...segment,
    color: resolveChartColor(segment.colorToken),
    percentage: total > 0 ? (segment.value / total) * 100 : 0,
    dashLength: total > 0 ? (segment.value / total) * circumference : 0,
  }));

  let cumulativeOffset = 0;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const legendEl = legendMeasureRef.current;
    if (!root) return;

    let disposed = false;

    const publish = (next: { layout: DonutLegendLayout; ringSize: number }) => {
      const prev = layoutRef.current;
      const layoutChanged = prev.layout !== next.layout;
      const sizeChanged = Math.abs(prev.ringSize - next.ringSize) > SIZE_EPSILON;
      if (!layoutChanged && !sizeChanged) return;
      layoutRef.current = next;
      if (layoutChanged) setLayout(next.layout);
      if (sizeChanged) setRingSize(next.ringSize);
    };

    const observer = new ResizeObserver(() => {
      if (debounceRef.current !== undefined) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        debounceRef.current = undefined;
        measure();
      }, RESIZE_DEBOUNCE_MS);
    });

    const measure = () => {
      if (disposed) return;

      // Disconnect while probing height so insert/remove does not re-enter the observer.
      observer.disconnect();

      const nextBox = contentBoxSize(root);
      const nextLegend: MeasuredBox = legendEl
        ? { width: legendEl.offsetWidth, height: legendEl.offsetHeight }
        : { width: 96, height: 72 };
      const nextDefinite = hasDefiniteHeight(root);

      observer.observe(root);
      if (legendEl) observer.observe(legendEl);

      const fallbackRing = resolveSizeTarget(size);
      const effectiveBox: MeasuredBox = {
        width: nextBox.width > 0 ? nextBox.width : fallbackRing + nextLegend.width + LAYOUT_GAP,
        height: nextBox.height > 0 ? nextBox.height : fallbackRing,
      };

      publish(
        pickLegendLayout({
          box: effectiveBox,
          legend: nextLegend,
          definiteHeight: nextDefinite,
          sizeProp: size,
        }),
      );
    };

    observer.observe(root);
    if (legendEl) observer.observe(legendEl);
    measure();

    return () => {
      disposed = true;
      observer.disconnect();
      if (debounceRef.current !== undefined) window.clearTimeout(debounceRef.current);
    };
  }, [size, segments, total]);

  useEffect(() => {
    if (!animated) {
      setAnimatedOffset(0);
      return;
    }

    setAnimatedOffset(circumference);
    let timer: number | undefined;
    const raf = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setAnimatedOffset(0), 50);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [animated, animationKey, circumference, segments, total]);

  if (segments.length === 0) {
    const emptySize = resolveSizeTarget(size);
    return (
      <div
        className={`flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 ${className}`}
        style={{ width: emptySize, height: emptySize }}
      >
        {t('components.common.noData')}
      </div>
    );
  }

  const visualRing = Math.max(0, ringSize);
  const centerTotalClass =
    layout === 'center'
      ? 'text-lg font-bold text-gray-900 dark:text-white'
      : 'text-2xl font-bold text-gray-900 dark:text-white';

  const ring = (
    <div className="relative shrink-0" style={{ width: visualRing, height: visualRing }}>
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        width={visualRing}
        height={visualRing}
        className="block"
        role="img"
        aria-label={t('components.common.donutChart')}
      >
        <circle
          cx={VIEWBOX_CENTER}
          cy={VIEWBOX_CENTER}
          r={VIEWBOX_RADIUS}
          fill="none"
          className="stroke-gray-100 dark:stroke-gray-800"
          strokeWidth={STROKE_WIDTH}
        />
        {segmentData.map((segment, index) => {
          const dashOffset = cumulativeOffset;
          cumulativeOffset += segment.dashLength;

          return (
            <circle
              key={segment.labelKey}
              cx={VIEWBOX_CENTER}
              cy={VIEWBOX_CENTER}
              r={VIEWBOX_RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="butt"
              strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
              strokeDashoffset={-dashOffset + (animated ? animatedOffset : 0)}
              transform={`rotate(-90 ${VIEWBOX_CENTER} ${VIEWBOX_CENTER})`}
              style={{
                transition: animated ? `stroke-dashoffset 1s ease-out ${index * 0.1}s` : undefined,
              }}
            >
              <title>
                {`${segment.label}: ${formatChartValue(segment.value)} (${segment.percentage.toFixed(1)}%)`}
              </title>
            </circle>
          );
        })}
      </svg>

      <div
        className={`absolute inset-0 flex flex-col items-center px-3 ${
          layout === 'center' ? 'justify-center gap-1 overflow-hidden' : 'justify-center'
        }`}
      >
        <span className={centerTotalClass}>{formatChartValue(total)}</span>
        {centerLabel && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</span>
        )}
        {layout === 'center' && (
          <LegendList
            segments={segmentData}
            compact
            className="mt-1 flex w-auto flex-col items-center"
          />
        )}
      </div>
    </div>
  );

  const sideOrBottomLegend =
    layout !== 'center' ? (
      <LegendList
        segments={segmentData}
        stretch={layout === 'bottom'}
        className={layout === 'bottom' ? 'w-full' : 'w-max shrink-0'}
      />
    ) : null;

  return (
    <div ref={rootRef} className={`relative min-h-0 min-w-0 overflow-hidden ${className}`.trim()}>
      {/* Off-layout measure: natural legend size without wrap/truncation */}
      <ul
        ref={legendMeasureRef}
        className="pointer-events-none invisible absolute left-0 top-0 -z-10 space-y-2"
        aria-hidden="true"
      >
        {segmentData.map((segment) => (
          <li key={segment.labelKey} className="flex items-center gap-2 whitespace-nowrap text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" />
            <span>{segment.label}</span>
            <span className="ml-auto font-medium">{segment.percentage.toFixed(0)}%</span>
          </li>
        ))}
      </ul>

      {layout === 'center' && (
        <div className="flex h-full w-full items-center justify-center">{ring}</div>
      )}

      {layout === 'right' && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex max-w-full items-center gap-4">
            {ring}
            {sideOrBottomLegend}
          </div>
        </div>
      )}

      {layout === 'bottom' && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          {ring}
          {sideOrBottomLegend}
        </div>
      )}
    </div>
  );
}
