import { useCallback, useEffect, useId, useMemo, useRef, useState, type DragEvent } from 'react';
import { saveUrlAsFile } from './utils/saveFile';
import { saveDownloadResult } from './utils/downloadData';
import { cn } from '@/components/Layout/layoutUtils';
import { appConfig } from '@/config/app.config';
import { useLocale } from '@/context/LocaleContext';
import type { FileUploadItem } from '@/models/model.type';
import { Button } from '@/components/Button';

export type FileUploadHandler = (
  item: FileUploadItem,
  onProgress?: (progress: number) => void,
) => Promise<void>;

export interface FileUploadMessages {
  dragDrop?: string;
  browse?: string;
  dropHere?: string;
  maxSize?: string;
  pending?: string;
  uploading?: string;
  uploadingIndeterminate?: string;
  success?: string;
  error?: string;
  fileTooLarge?: string;
  removeFile?: string;
  disabled?: string;
}

export type FileUploadDemoState = 'none' | 'pending' | 'uploading' | 'success' | 'error';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  disabled?: boolean;
  /** Preview status file contoh di storybook / dokumentasi */
  demoState?: FileUploadDemoState;
  demoFileName?: string;
  demoProgress?: number;
  demoErrorMessage?: string;
  /** Sembunyikan drop zone (berguna untuk preview status file saja di storybook) */
  showDropZone?: boolean;
  /** Simulasikan drag-over untuk preview storybook */
  demoDragOver?: boolean;
  /** Teks drop zone — kosongkan untuk pakai default locale */
  dragDrop?: string;
  browse?: string;
  dropHere?: string;
  /** Teks bantu di bawah drop zone — kosongkan untuk default locale (biasanya max size) */
  hint?: string;
  disabledLabel?: string;
  messages?: FileUploadMessages;
  onFilesSelected?: (files: FileUploadItem[]) => void;
  onUpload?: FileUploadHandler;
  onUploadSuccess?: (item: FileUploadItem) => void;
  onUploadError?: (item: FileUploadItem, error: string) => void;
  className?: string;
}

function generateId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileStatusIcon({ status }: { status: FileUploadItem['status'] }) {
  if (status === 'uploading') {
    return (
      <svg className="h-5 w-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    );
  }

  if (status === 'success') {
    return (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (status === 'error') {
    return (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function itemBorderClass(status: FileUploadItem['status']): string {
  switch (status) {
    case 'uploading':
      return 'border-primary-300 dark:border-primary-700';
    case 'success':
      return 'border-green-300 dark:border-green-800';
    case 'error':
      return 'border-red-300 dark:border-red-800';
    default:
      return 'border-gray-200 dark:border-gray-700';
  }
}

function statusBadgeClass(status: FileUploadItem['status']): string {
  switch (status) {
    case 'uploading':
      return 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300';
    case 'success':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    case 'error':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  }
}

function createDemoFile(name: string): File {
  return new File(['demo'], name, { type: 'application/pdf' });
}

function createDemoItem(
  demoState: Exclude<FileUploadDemoState, 'none'>,
  demoFileName: string,
  demoProgress: number,
  demoErrorMessage: string | undefined,
  defaultError: string,
): FileUploadItem {
  const base: FileUploadItem = {
    id: 'demo-file',
    file: createDemoFile(demoFileName),
    progress: demoState === 'success' ? 100 : demoProgress,
    status: demoState === 'uploading' ? 'uploading' : demoState,
    reportsProgress: demoState === 'uploading' ? true : undefined,
  };

  if (demoState === 'error') {
    return { ...base, error: demoErrorMessage ?? defaultError };
  }

  return base;
}

export function FileUpload({
  accept,
  multiple = false,
  maxSizeMb = appConfig.maxFileSizeMb,
  disabled = false,
  demoState = 'none',
  demoFileName = 'document.pdf',
  demoProgress = 65,
  demoErrorMessage,
  showDropZone = true,
  demoDragOver = false,
  dragDrop,
  browse,
  dropHere,
  hint,
  disabledLabel,
  messages,
  onFilesSelected,
  onUpload,
  onUploadSuccess,
  onUploadError,
  className = '',
}: FileUploadProps) {
  const { t } = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<FileUploadItem[]>([]);
  const dragActive = demoDragOver || isDragging;

  const labels = useMemo(
    () => ({
      dragDrop:
        dragDrop?.trim() || messages?.dragDrop || t('components.common.fileUpload.dragDrop'),
      browse: browse?.trim() || messages?.browse || t('components.common.fileUpload.browse'),
      dropHere:
        dropHere?.trim() || messages?.dropHere || t('components.common.fileUpload.dropHere'),
      maxSize:
        hint?.trim() ||
        messages?.maxSize ||
        t('components.common.fileUpload.maxSize', { size: maxSizeMb }),
      pending: messages?.pending ?? t('components.common.fileUpload.pending'),
      success: messages?.success ?? t('components.common.fileUpload.success'),
      error: messages?.error ?? t('components.common.fileUpload.error'),
      fileTooLarge:
        messages?.fileTooLarge ??
        t('components.common.fileUpload.fileTooLarge', { size: maxSizeMb }),
      removeFile: messages?.removeFile ?? t('components.common.fileUpload.removeFile'),
      disabled:
        disabledLabel?.trim() || messages?.disabled || t('components.common.fileUpload.disabled'),
    }),
    [browse, disabledLabel, dragDrop, dropHere, hint, maxSizeMb, messages, t],
  );

  const maxBytes = maxSizeMb * 1024 * 1024;

  const displayItems = useMemo(() => {
    if (demoState !== 'none') {
      return [
        createDemoItem(demoState, demoFileName, demoProgress, demoErrorMessage, labels.error),
      ];
    }
    return items;
  }, [demoState, demoFileName, demoProgress, demoErrorMessage, items, labels.error]);

  const getStatusLabel = useCallback(
    (item: FileUploadItem): string => {
      switch (item.status) {
        case 'uploading':
          if (!item.reportsProgress) {
            return (
              messages?.uploadingIndeterminate ??
              t('components.common.fileUpload.uploadingIndeterminate')
            );
          }
          return (
            messages?.uploading?.replace('{{progress}}', String(item.progress)) ??
            t('components.common.fileUpload.uploading', { progress: item.progress })
          );
        case 'success':
          return labels.success;
        case 'error':
          return item.error ?? labels.error;
        case 'pending':
          return labels.pending;
        default:
          return labels.pending;
      }
    },
    [labels, messages?.uploading, messages?.uploadingIndeterminate, t],
  );

  const startUpload = useCallback(
    async (item: FileUploadItem) => {
      if (!onUpload) return;

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: 'uploading' as const, progress: 0, reportsProgress: false }
            : i,
        ),
      );

      try {
        await onUpload(item, (progress) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, progress, status: 'uploading' as const, reportsProgress: true }
                : i,
            ),
          );
        });

        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'success' as const, progress: 100 } : i,
          ),
        );
        onUploadSuccess?.(item);
      } catch {
        const errorMessage = labels.error;
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: 'error' as const, error: errorMessage } : i,
          ),
        );
        onUploadError?.(item, errorMessage);
      }
    },
    [labels.error, onUpload, onUploadError, onUploadSuccess],
  );

  const processFiles = useCallback(
    (fileList: FileList) => {
      if (disabled || demoState !== 'none') return;

      const newItems: FileUploadItem[] = [];

      Array.from(fileList).forEach((file) => {
        if (file.size > maxBytes) {
          newItems.push({
            id: generateId(),
            file,
            progress: 0,
            status: 'error',
            error: labels.fileTooLarge,
          });
        } else {
          newItems.push({
            id: generateId(),
            file,
            progress: 0,
            status: 'pending',
          });
        }
      });

      setItems((prev) => [...prev, ...newItems]);
      onFilesSelected?.(newItems);

      if (onUpload) {
        newItems
          .filter((item) => item.status === 'pending')
          .forEach((item) => {
            void startUpload(item);
          });
      }
    },
    [demoState, disabled, labels.fileTooLarge, maxBytes, onFilesSelected, onUpload, startUpload],
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    if (demoState !== 'none') return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={className}>
      {showDropZone && (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
            disabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
              : `cursor-pointer ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500'
                }`
          }`}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <svg
              className={`h-10 w-10 ${disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="space-y-1">
              {disabled ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">{labels.disabled}</p>
              ) : dragActive ? (
                <p className="text-sm leading-relaxed text-primary-600 dark:text-primary-400">
                  {labels.dropHere}
                </p>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {labels.dragDrop}
                  </p>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {labels.browse}
                  </p>
                </>
              )}
              {!disabled && !dragActive && (
                <p className="text-xs text-gray-400">{labels.maxSize}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {displayItems.length > 0 && (
        <ul className={`space-y-2 ${showDropZone ? 'mt-4' : ''}`}>
          {displayItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-4 rounded-lg border bg-white p-3 dark:bg-gray-800 ${itemBorderClass(item.status)}`}
            >
              <FileStatusIcon status={item.status} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {item.file.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass(item.status)}`}
                  >
                    {getStatusLabel(item)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                {item.status === 'uploading' && item.reportsProgress && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === 'uploading' && !item.reportsProgress && (
                  <div
                    className="mt-1.5 h-1.5 w-full animate-shimmer rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
                    aria-hidden
                  />
                )}
                {item.status === 'error' && item.error && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{item.error}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="shrink-0 text-gray-400 hover:text-red-500"
                aria-label={labels.removeFile}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TruncatedLabel({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const checkTruncation = () => {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    };

    checkTruncation();
    const observer = new ResizeObserver(checkTruncation);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div className="group/truncate relative min-w-0">
      <p ref={ref} className={cn('truncate', className)} title={isTruncated ? text : undefined}>
        {text}
      </p>
      {isTruncated && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 hidden max-w-[16rem] break-all rounded-md bg-gray-900 px-2 py-1 text-xs font-normal leading-snug text-white shadow-md group-hover/truncate:block dark:bg-gray-700"
        >
          {text}
        </span>
      )}
    </div>
  );
}

export interface FileDownloadPayload {
  /** File bytes — komponen konversi lalu simpan. */
  data?: Blob | ArrayBuffer | string | Record<string, unknown> | unknown[];
  /** URL sementara / presigned dari API — komponen fetch lalu simpan. */
  url?: string;
  filename?: string;
  mimeType?: string;
}

export type FileDownloadResult =
  | FileDownloadPayload
  | Blob
  | ArrayBuffer
  | string
  | Record<string, unknown>
  | unknown[];

export type FileDownloadHandler = (filename: string) => Promise<FileDownloadResult>;

export type FileDownloadDemoState = 'none' | 'downloading' | 'success' | 'error';

export interface FileDownloadProps {
  filename: string;
  /** Link file statis — unduh langsung tanpa onDownload. */
  url?: string;
  size?: string;
  /** Ambil data dari API; return Blob, { url }, atau { data, mimeType } — komponen yang simpan. */
  onDownload?: FileDownloadHandler;
  /** Preview status contoh di storybook / dokumentasi */
  demoState?: FileDownloadDemoState;
  demoErrorMessage?: string;
  className?: string;
}

export function FileDownload({
  filename,
  url,
  size,
  onDownload,
  demoState = 'none',
  demoErrorMessage,
  className = '',
}: FileDownloadProps) {
  const { t } = useLocale();
  const [liveState, setLiveState] = useState<'idle' | 'downloading' | 'error'>('idle');
  const [liveError, setLiveError] = useState<string | undefined>();

  const isSnapshot = demoState !== 'none';
  const isDownloading = isSnapshot ? demoState === 'downloading' : liveState === 'downloading';
  const isError = isSnapshot ? demoState === 'error' : liveState === 'error';
  const defaultError = t('components.common.fileDownload.error');
  const errorMessage = isSnapshot
    ? (demoErrorMessage ?? t('components.common.fileDownload.failed'))
    : (liveError ?? defaultError);

  const runDownload = async () => {
    if (onDownload) {
      const result = await onDownload(filename);
      await saveDownloadResult(result, filename);
      return;
    }

    if (url) {
      await saveUrlAsFile(url, filename);
    }
  };

  const handleDownload = async () => {
    if (isSnapshot) {
      await runDownload();
      return;
    }

    if (!onDownload && !url) return;

    setLiveState('downloading');
    setLiveError(undefined);
    try {
      await runDownload();
      setLiveState('idle');
    } catch {
      setLiveError(defaultError);
      setLiveState('error');
    }
  };

  const borderClass = isError
    ? 'border-red-300 dark:border-red-800'
    : isDownloading
      ? 'border-primary-300 dark:border-primary-700'
      : 'border-gray-200 dark:border-gray-700';

  const subtitle = isDownloading
    ? t('components.common.fileDownload.downloading')
    : isError
      ? errorMessage
      : size;

  const subtitleClass = isError
    ? 'text-xs text-red-600 dark:text-red-400'
    : 'text-xs text-gray-500';

  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-sm items-center gap-3 rounded-lg border bg-white p-4 dark:bg-gray-800',
        borderClass,
        isError && 'opacity-80',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <svg
            className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <TruncatedLabel
            text={filename}
            className="text-sm font-medium text-gray-900 dark:text-white"
          />
          {subtitle && <TruncatedLabel text={subtitle} className={subtitleClass} />}
        </div>
      </div>
      {isDownloading ? (
        <div
          className="ml-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"
          role="status"
          aria-label={t('components.common.fileDownload.downloading')}
        />
      ) : (
        <Button variant="outline" size="sm" className="ml-1 shrink-0" onClick={handleDownload}>
          {t('components.common.download')}
        </Button>
      )}
    </div>
  );
}
