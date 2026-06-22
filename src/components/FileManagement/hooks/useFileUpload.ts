import { useCallback, useState } from 'react';
import type { FileUploadItem } from '@/models/model.type';
import type { FileUploadHandler } from '../FileManagement';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface UseFileUploadOptions {
  /** Demo: gagal upload jika nama file mengandung "error" */
  failOnErrorFilename?: boolean;
}

/**
 * Contoh hook upload — simulasi API + progress.
 * Nanti bisa diganti ke use case → repository tanpa mengubah komponen FileUpload.
 */
export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { failOnErrorFilename = true } = options;
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback<FileUploadHandler>(
    async (item: FileUploadItem, onProgress) => {
      setIsUploading(true);

      try {
        const steps = 10;
        for (let step = 1; step <= steps; step += 1) {
          await delay(180);
          onProgress(Math.round((step / steps) * 90));
        }

        await delay(400);

        if (failOnErrorFilename && item.file.name.toLowerCase().includes('error')) {
          throw new Error('UPLOAD_FAILED');
        }

        onProgress(100);
      } finally {
        setIsUploading(false);
      }
    },
    [failOnErrorFilename],
  );

  return { uploadFile, isUploading };
}
