import { useCallback, useState } from 'react';
import type { FileDownloadHandler } from '../FileManagement';
import { createMockDownloadHandler } from '../utils/mockDownloadHandler';
import type { MockApiOutcome } from '../utils/mockUploadHandler';

export interface UseFileDownloadOptions {
  mockOutcome?: MockApiOutcome;
}

export function useFileDownload(options: UseFileDownloadOptions = {}) {
  const { mockOutcome = 'random' } = options;
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = useCallback<FileDownloadHandler>(
    async (filename) => {
      setIsDownloading(true);
      try {
        return await createMockDownloadHandler(mockOutcome)(filename);
      } finally {
        setIsDownloading(false);
      }
    },
    [mockOutcome],
  );

  return { downloadFile, isDownloading };
}

export type { MockApiOutcome };
