import type { FileUploadItem } from '@/models/model.type';
import type { FileUploadHandler } from '../FileManagement';

export type MockApiOutcome = 'random' | 'success' | 'failure';

export interface MockUploadOptions {
  /** Panggil onProgress selama upload — false = API tanpa progress (hanya status uploading) */
  reportProgress?: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runMockUploadProgress(onProgress: (progress: number) => void): Promise<void> {
  const steps = 10;
  for (let step = 1; step <= steps; step += 1) {
    await delay(150);
    onProgress(Math.round((step / steps) * 90));
  }
  await delay(300);
}

function shouldFailUpload(outcome: MockApiOutcome): boolean {
  if (outcome === 'failure') return true;
  if (outcome === 'success') return false;
  return Math.random() < 0.5;
}

/** Simulasi hit API upload — ganti dengan fetch/axios ke endpoint asli. */
export function createMockUploadHandler(
  outcome: MockApiOutcome,
  options: MockUploadOptions = {},
): FileUploadHandler {
  const { reportProgress = true } = options;

  if (!reportProgress) {
    return async () => {
      await delay(1800);
      if (shouldFailUpload(outcome)) {
        throw new Error('UPLOAD_FAILED');
      }
    };
  }

  return async (_item: FileUploadItem, onProgress) => {
    if (onProgress) {
      await runMockUploadProgress(onProgress);
    } else {
      await delay(1800);
    }

    if (shouldFailUpload(outcome)) {
      throw new Error('UPLOAD_FAILED');
    }

    onProgress?.(100);
  };
}

export function buildMockUploadProgressHelperLines(): string[] {
  return [
    '/**',
    ' * Opsional: FileUpload menyediakan onProgress sebagai argumen ke-2 onUpload.',
    ' * Panggil onProgress(0–100) bila API mengembalikan progress → progress bar terisi.',
    ' * Abaikan onProgress bila API tidak punya progress → hanya status "uploading".',
    ' */',
    'async function reportUploadProgress(',
    '  onProgress: (progress: number) => void,',
    '): Promise<void> {',
    '  const steps = 10;',
    '  for (let step = 1; step <= steps; step += 1) {',
    '    await new Promise((resolve) => setTimeout(resolve, 150));',
    '    onProgress(Math.round((step / steps) * 90));',
    '  }',
    '  await new Promise((resolve) => setTimeout(resolve, 300));',
    '}',
  ];
}

function getMockUploadOutcomeLines(outcome: MockApiOutcome, withProgress: boolean): string[] {
  const failRandom = [
    `  // mockOutcome: ${outcome}`,
    `  if (Math.random() < 0.5) {`,
    `    throw new Error('UPLOAD_FAILED');`,
    `  }`,
  ];
  const failOnly = [`  // mockOutcome: failure`, `  throw new Error('UPLOAD_FAILED');`];

  if (!withProgress) {
    if (outcome === 'failure') {
      return [
        `  // reportProgress: false — API tanpa progress`,
        `  await new Promise((resolve) => setTimeout(resolve, 1800));`,
        ...failOnly,
      ];
    }
    if (outcome === 'random') {
      return [
        `  // reportProgress: false — API tanpa progress`,
        `  await new Promise((resolve) => setTimeout(resolve, 1800));`,
        ...failRandom,
      ];
    }
    return [
      `  // reportProgress: false — API tanpa progress`,
      `  await new Promise((resolve) => setTimeout(resolve, 1800));`,
      `  // mockOutcome: success`,
    ];
  }

  if (outcome === 'failure') {
    return [`  await reportUploadProgress(onProgress!);`, ...failOnly];
  }
  if (outcome === 'random') {
    return [
      `  await reportUploadProgress(onProgress!);`,
      '',
      ...failRandom,
      '',
      `  onProgress!(100);`,
    ];
  }
  return [
    `  await reportUploadProgress(onProgress!);`,
    `  // mockOutcome: success`,
    `  onProgress!(100);`,
  ];
}

export function buildMockUploadHandlerCodeLines(
  outcome: MockApiOutcome,
  options: MockUploadOptions = {},
): string[] {
  const { reportProgress = true } = options;

  if (!reportProgress) {
    return [
      'const uploadFile: FileUploadHandler = async (item) => {',
      ...getMockUploadOutcomeLines(outcome, false),
      '};',
    ];
  }

  return [
    'const uploadFile: FileUploadHandler = async (item, onProgress) => {',
    ...getMockUploadOutcomeLines(outcome, true),
    '};',
  ];
}

export function buildMockUploadExampleLines(
  outcome: MockApiOutcome,
  fileUploadPropLines: string[],
  options: MockUploadOptions = {},
): string[] {
  const { reportProgress = true } = options;
  const propBlock =
    fileUploadPropLines.length === 0
      ? ['    <FileUpload onUpload={uploadFile} />']
      : ['    <FileUpload', ...fileUploadPropLines, '    />'];

  const helperLines = reportProgress ? [...buildMockUploadProgressHelperLines(), ''] : [];

  return [
    `import { FileUpload } from '@/components/FileManagement';`,
    `import type { FileUploadHandler } from '@/components/FileManagement';`,
    '',
    ...helperLines,
    ...buildMockUploadHandlerCodeLines(outcome, options),
    '',
    'export function FileUploadExample() {',
    '  return (',
    ...propBlock,
    '  );',
    '}',
  ];
}
