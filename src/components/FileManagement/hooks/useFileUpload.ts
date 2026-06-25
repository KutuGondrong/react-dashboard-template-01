import { useCallback, useState } from 'react';
import type { FileUploadHandler } from '../FileManagement';
import {
  createMockUploadHandler,
  type MockApiOutcome,
  type MockUploadOptions,
} from '../utils/mockUploadHandler';

export interface UseFileUploadOptions extends MockUploadOptions {
  mockOutcome?: MockApiOutcome;
}

/**
 * Contoh hook upload — simulasi API + progress.
 * Nanti bisa diganti ke use case → repository tanpa mengubah komponen FileUpload.
 */
export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { mockOutcome = 'random', reportProgress = true } = options;
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback<FileUploadHandler>(
    async (item, onProgress) => {
      setIsUploading(true);
      try {
        await createMockUploadHandler(mockOutcome, { reportProgress })(item, onProgress);
      } finally {
        setIsUploading(false);
      }
    },
    [mockOutcome, reportProgress],
  );

  return { uploadFile, isUploading };
}

export type { MockApiOutcome, MockUploadOptions };
