import type { FileDownloadHandler } from '../FileManagement';
import { createSampleBlob } from './downloadSampleFiles';
import type { MockApiOutcome } from './mockUploadHandler';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldFailDownload(outcome: MockApiOutcome): boolean {
  if (outcome === 'failure') return true;
  if (outcome === 'success') return false;
  return Math.random() < 0.5;
}

const MOCK_PRESIGNED_URLS: Record<string, string> = {
  'report.pdf': '/samples/report.pdf',
  'data.csv': '/samples/data.csv',
  'readme.txt': '/samples/readme.txt',
};

function resolveMockPresignedUrl(filename: string): string {
  return MOCK_PRESIGNED_URLS[filename] ?? '/samples/readme.txt';
}

export function createMockDownloadHandler(outcome: MockApiOutcome): FileDownloadHandler {
  return async (filename) => {
    await delay(1800);
    if (shouldFailDownload(outcome)) {
      throw new Error('DOWNLOAD_FAILED');
    }
    return createSampleBlob(filename);
  };
}

export function createMockPresignedDownloadHandler(outcome: MockApiOutcome): FileDownloadHandler {
  return async (filename) => {
    await delay(1200);
    if (shouldFailDownload(outcome)) {
      throw new Error('DOWNLOAD_FAILED');
    }

    const downloadUrl = resolveMockPresignedUrl(filename);
    return { url: downloadUrl, filename };
  };
}

function getMockDownloadOutcomeLines(outcome: MockApiOutcome): string[] {
  const failRandom = [
    `  // mockOutcome: ${outcome}`,
    `  if (Math.random() < 0.5) {`,
    `    throw new Error('DOWNLOAD_FAILED');`,
    `  }`,
  ];
  const failOnly = [`  // mockOutcome: failure`, `  throw new Error('DOWNLOAD_FAILED');`];
  const returnBlob = [`  return createSampleBlob(filename);`];

  if (outcome === 'failure') {
    return [`  await new Promise((resolve) => setTimeout(resolve, 1800));`, ...failOnly];
  }
  if (outcome === 'random') {
    return [
      `  await new Promise((resolve) => setTimeout(resolve, 1800));`,
      ...failRandom,
      '',
      ...returnBlob,
    ];
  }
  return [
    `  await new Promise((resolve) => setTimeout(resolve, 1800));`,
    `  // mockOutcome: success`,
    ...returnBlob,
  ];
}

function getMockPresignedOutcomeLines(outcome: MockApiOutcome): string[] {
  const failRandom = [
    `  // mockOutcome: ${outcome}`,
    `  if (Math.random() < 0.5) {`,
    `    throw new Error('DOWNLOAD_FAILED');`,
    `  }`,
  ];
  const failOnly = [`  // mockOutcome: failure`, `  throw new Error('DOWNLOAD_FAILED');`];
  const returnLink = [
    `  return {`,
    `    url: meta.downloadUrl,`,
    `    filename: meta.filename ?? filename,`,
    `  };`,
  ];
  const fetchLink = [
    `  const metaResponse = await fetch(\`/api/files/\${encodeURIComponent(filename)}/download-url\`);`,
    `  if (!metaResponse.ok) throw new Error('DOWNLOAD_FAILED');`,
    `  const meta = await metaResponse.json() as { downloadUrl: string; filename?: string };`,
    '',
  ];

  if (outcome === 'failure') {
    return [`  await new Promise((resolve) => setTimeout(resolve, 1200));`, ...failOnly];
  }
  if (outcome === 'random') {
    return [
      `  await new Promise((resolve) => setTimeout(resolve, 1200));`,
      `  const meta = { downloadUrl: '/samples/report.pdf', filename };`,
      ...failRandom,
      '',
      ...returnLink,
    ];
  }
  return [...fetchLink, `  // mockOutcome: success`, ...returnLink];
}

export function buildMockDownloadHandlerCodeLines(outcome: MockApiOutcome): string[] {
  return [
    'const downloadFile: FileDownloadHandler = async (filename) => {',
    ...getMockDownloadOutcomeLines(outcome),
    '};',
  ];
}

export function buildMockPresignedDownloadHandlerCodeLines(outcome: MockApiOutcome): string[] {
  return [
    'const downloadFile: FileDownloadHandler = async (filename) => {',
    ...getMockPresignedOutcomeLines(outcome),
    '};',
  ];
}

export function buildMockDownloadExampleLines(
  outcome: MockApiOutcome,
  fileDownloadPropLines: string[],
): string[] {
  const propBlock =
    fileDownloadPropLines.length === 0
      ? ['    <FileDownload onDownload={downloadFile} />']
      : ['    <FileDownload', ...fileDownloadPropLines, '    />'];

  return [
    `import { FileDownload, createSampleBlob } from '@/components/FileManagement';`,
    `import type { FileDownloadHandler } from '@/components/FileManagement';`,
    '',
    ...buildMockDownloadHandlerCodeLines(outcome),
    '',
    'export function FileDownloadExample() {',
    '  return (',
    ...propBlock,
    '  );',
    '}',
  ];
}

export function buildMockPresignedDownloadExampleLines(
  outcome: MockApiOutcome,
  fileDownloadPropLines: string[],
): string[] {
  const propBlock =
    fileDownloadPropLines.length === 0
      ? ['    <FileDownload onDownload={downloadFile} />']
      : ['    <FileDownload', ...fileDownloadPropLines, '    />'];

  return [
    `import { FileDownload } from '@/components/FileManagement';`,
    `import type { FileDownloadHandler } from '@/components/FileManagement';`,
    '',
    ...buildMockPresignedDownloadHandlerCodeLines(outcome),
    '',
    'export function FileDownloadExample() {',
    '  return (',
    ...propBlock,
    '  );',
    '}',
  ];
}

export function buildUrlDownloadExampleLines(fileDownloadPropLines: string[]): string[] {
  const propBlock = ['    <FileDownload', ...fileDownloadPropLines, '    />'];

  return [
    `import { FileDownload } from '@/components/FileManagement';`,
    '',
    'export function FileDownloadExample() {',
    '  return (',
    ...propBlock,
    '  );',
    '}',
  ];
}
