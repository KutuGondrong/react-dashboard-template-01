import type { FileDownloadPayload, FileDownloadResult } from '../FileManagement';
import { saveBlobAsFile, saveUrlAsFile } from './saveFile';

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return '';
  return filename.slice(dot + 1).toLowerCase();
}

function defaultMimeType(filename: string): string {
  switch (extensionOf(filename)) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv;charset=utf-8';
    case 'json':
      return 'application/json;charset=utf-8';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'txt':
      return 'text/plain;charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function isDownloadPayload(value: unknown): value is FileDownloadPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('data' in value || 'url' in value) &&
    !(value instanceof Blob) &&
    !(value instanceof ArrayBuffer)
  );
}

export function dataToBlob(
  data: NonNullable<FileDownloadPayload['data']>,
  mimeType?: string,
): Blob {
  if (data instanceof Blob) return data;
  if (data instanceof ArrayBuffer) {
    return new Blob([data], { type: mimeType ?? 'application/octet-stream' });
  }
  if (typeof data === 'string') {
    return new Blob([data], { type: mimeType ?? 'text/plain;charset=utf-8' });
  }
  return new Blob([JSON.stringify(data, null, 2)], {
    type: mimeType ?? 'application/json;charset=utf-8',
  });
}

export function resolveDownloadFile(
  result: FileDownloadResult,
  defaultFilename: string,
): { blob: Blob; filename: string } {
  if (isDownloadPayload(result)) {
    if (result.data === undefined) {
      throw new Error('DOWNLOAD_PAYLOAD_MISSING_DATA');
    }
    const filename = result.filename ?? defaultFilename;
    const mimeType = result.mimeType ?? defaultMimeType(filename);
    return { blob: dataToBlob(result.data, mimeType), filename };
  }

  if (result instanceof Blob) {
    return { blob: result, filename: defaultFilename };
  }

  if (result instanceof ArrayBuffer) {
    const mimeType = defaultMimeType(defaultFilename);
    return { blob: new Blob([result], { type: mimeType }), filename: defaultFilename };
  }

  if (typeof result === 'string') {
    return {
      blob: dataToBlob(result, defaultMimeType(defaultFilename)),
      filename: defaultFilename,
    };
  }

  return {
    blob: dataToBlob(result, 'application/json;charset=utf-8'),
    filename: defaultFilename.endsWith('.json') ? defaultFilename : `${defaultFilename}.json`,
  };
}

export async function saveDownloadResult(
  result: FileDownloadResult,
  defaultFilename: string,
): Promise<void> {
  if (isDownloadPayload(result) && result.url) {
    await saveUrlAsFile(result.url, result.filename ?? defaultFilename);
    return;
  }

  const { blob, filename } = resolveDownloadFile(result, defaultFilename);
  await saveBlobAsFile(blob, filename);
}
