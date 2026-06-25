import { saveBlobAsFile } from './saveFile';

const SAMPLE_TXT = `Sample file — demo download
Generated for FileDownload storybook / mock API testing.
`;

const SAMPLE_CSV = `name,email,role
Jane Smith,jane@example.com,Admin
John Doe,john@example.com,Editor
Ayu Lestari,ayu@example.com,Viewer
`;

const SAMPLE_JSON = JSON.stringify(
  {
    id: 'demo-001',
    title: 'Sample Report',
    generatedAt: '2026-01-01T00:00:00.000Z',
    note: 'Demo JSON file from mock download handler.',
  },
  null,
  2,
);

const SAMPLE_PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 51>>stream
BT /F1 18 Tf 36 96 Td (Sample Report) Tj ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000101 00000 n 
0000000242 00000 n 
0000000342 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
409
%%EOF`;

const SAMPLE_PNG_BYTES = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
);

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return 'txt';
  return filename.slice(dot + 1).toLowerCase();
}

export function createSampleBlob(filename: string): Blob {
  const ext = extensionOf(filename);

  switch (ext) {
    case 'pdf':
      return new Blob([SAMPLE_PDF], { type: 'application/pdf' });
    case 'csv':
      return new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8' });
    case 'json':
      return new Blob([SAMPLE_JSON], { type: 'application/json;charset=utf-8' });
    case 'png':
      return new Blob([SAMPLE_PNG_BYTES], { type: 'image/png' });
    case 'jpg':
    case 'jpeg':
      return new Blob([SAMPLE_PNG_BYTES], { type: 'image/jpeg' });
    default:
      return new Blob([SAMPLE_TXT], { type: 'text/plain;charset=utf-8' });
  }
}

/** Shortcut storybook / test — fetch blob lalu simpan. */
export async function triggerSampleDownload(filename: string): Promise<void> {
  await saveBlobAsFile(createSampleBlob(filename), filename);
}
