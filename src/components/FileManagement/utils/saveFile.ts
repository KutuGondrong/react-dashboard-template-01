import { assetUrl } from '@/config/basePath';

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return '';
  return filename.slice(dot + 1).toLowerCase();
}

function mimeTypeForExtension(ext: string): string | undefined {
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'txt':
      return 'text/plain';
    default:
      return undefined;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Public `/…` paths must respect Vite `base` (e.g. `/react-dashboard-template-01/`). */
export function resolvePublicFileUrl(url: string): string {
  if (!url) return url;
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  const base = import.meta.env.BASE_URL || '/';
  if (url.startsWith('/') && base !== '/' && !url.startsWith(base)) {
    return assetUrl(url);
  }
  if (!url.startsWith('/')) {
    return assetUrl(url);
  }
  return url;
}

async function saveWithPicker(blob: Blob, filename: string): Promise<boolean> {
  if (!('showSaveFilePicker' in window)) return false;

  const ext = extensionOf(filename);
  const mime = mimeTypeForExtension(ext);

  const handle = await (
    window as Window & {
      showSaveFilePicker: (options?: {
        suggestedName?: string;
        types?: Array<{ description: string; accept: Record<string, string[]> }>;
      }) => Promise<FileSystemFileHandle>;
    }
  ).showSaveFilePicker({
    suggestedName: filename,
    types: mime
      ? [{ description: ext.toUpperCase(), accept: { [mime]: ext ? [`.${ext}`] : [] } }]
      : undefined,
  });

  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return true;
}

function saveWithAnchor(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.click();
  URL.revokeObjectURL(url);
}

export async function saveBlobAsFile(blob: Blob, filename: string): Promise<void> {
  try {
    const savedWithPicker = await saveWithPicker(blob, filename);
    if (savedWithPicker) return;
  } catch (error) {
    if (isAbortError(error)) return;
  }

  saveWithAnchor(blob, filename);
}

export async function saveUrlAsFile(url: string, filename: string): Promise<void> {
  const response = await fetch(resolvePublicFileUrl(url));
  if (!response.ok) {
    throw new Error('DOWNLOAD_FAILED');
  }
  const blob = await response.blob();
  await saveBlobAsFile(blob, filename);
}
