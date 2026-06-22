import { useCallback, useId, useMemo, useRef, useState, type DragEvent } from 'react';
import { appConfig } from '@/config/app.config';
import { useLocale } from '@/context/LocaleContext';
import type { FileUploadItem } from '@/models/model.type';
import { Button } from '@/components/Button';

export type FileUploadHandler = (
  item: FileUploadItem,
  onProgress: (progress: number) => void,
) => Promise<void>;

export interface FileUploadMessages {
  dragDrop?: string;
  dropHere?: string;
  maxSize?: string;
  pending?: string;
  uploading?: string;
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

  const labels = useMemo(
    () => ({
      dragDrop: messages?.dragDrop ?? t('components.common.fileUpload.dragDrop'),
      dropHere: messages?.dropHere ?? t('components.common.fileUpload.dropHere'),
      maxSize: messages?.maxSize ?? t('components.common.fileUpload.maxSize', { size: maxSizeMb }),
      pending: messages?.pending ?? t('components.common.fileUpload.pending'),
      success: messages?.success ?? t('components.common.fileUpload.success'),
      error: messages?.error ?? t('components.common.fileUpload.error'),
      fileTooLarge:
        messages?.fileTooLarge ??
        t('components.common.fileUpload.fileTooLarge', { size: maxSizeMb }),
      removeFile: messages?.removeFile ?? t('components.common.fileUpload.removeFile'),
      disabled: messages?.disabled ?? t('components.common.fileUpload.disabled'),
    }),
    [messages, maxSizeMb, t],
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
    [labels, messages?.uploading, t],
  );

  const startUpload = useCallback(
    async (item: FileUploadItem) => {
      if (!onUpload) return;

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: 'uploading' as const, progress: 0 } : i,
        ),
      );

      try {
        await onUpload(item, (progress) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, progress, status: 'uploading' as const } : i,
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

  const dropZoneText = isDragging ? labels.dropHere : labels.dragDrop;

  return (
    <div className={className}>
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
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          disabled
            ? 'cursor-not-allowed border-gray-200 opacity-50 dark:border-gray-700'
            : `cursor-pointer ${
                isDragging
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
        <svg
          className="mx-auto mb-3 h-10 w-10 text-gray-400"
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {disabled ? labels.disabled : dropZoneText}
        </p>
        {!disabled && <p className="mt-1 text-xs text-gray-400">{labels.maxSize}</p>}
      </div>

      {displayItems.length > 0 && (
        <ul className="mt-4 space-y-2">
          {displayItems.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-gray-800 ${itemBorderClass(item.status)}`}
            >
              <FileStatusIcon status={item.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
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
                {item.status === 'uploading' && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
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

export interface FileDownloadProps {
  filename: string;
  url?: string;
  size?: string;
  onDownload?: () => void;
  className?: string;
}

export function FileDownload({
  filename,
  url,
  size,
  onDownload,
  className = '',
}: FileDownloadProps) {
  const { t } = useLocale();

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    }
  };

  return (
    <div
      className={`flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <svg
            className="h-5 w-5 text-primary-600 dark:text-primary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{filename}</p>
          {size && <p className="text-xs text-gray-500">{size}</p>}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        {t('components.common.download')}
      </Button>
    </div>
  );
}
