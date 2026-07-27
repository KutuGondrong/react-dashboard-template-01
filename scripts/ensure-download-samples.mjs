import fs from 'fs';
import path from 'path';

/** File contoh FileDownload — harus ada di public/samples/ di template & app hasil generate. */
export const DOWNLOAD_SAMPLE_FILES = ['report.pdf', 'data.csv', 'readme.txt'];

export function resolveTemplateSamplesDir(root) {
  return path.join(root, 'scripts', 'template', 'samples');
}

export function resolvePublicSamplesDir(root) {
  return path.join(root, 'public', 'samples');
}

/**
 * Salin sample unduhan ke public/samples/ di output.
 * Sumber: scripts/template/samples/ (canonical), fallback public/samples/ di creator.
 */
export function ensureDownloadSamples(root, outputDir) {
  const canonicalDir = resolveTemplateSamplesDir(root);
  const fallbackDir = resolvePublicSamplesDir(root);
  const destDir = path.join(outputDir, 'public', 'samples');

  fs.mkdirSync(destDir, { recursive: true });

  const missing = [];

  for (const file of DOWNLOAD_SAMPLE_FILES) {
    const canonical = path.join(canonicalDir, file);
    const fallback = path.join(fallbackDir, file);
    const src = fs.existsSync(canonical) ? canonical : fallback;
    const dest = path.join(destDir, file);

    if (!fs.existsSync(src)) {
      missing.push(file);
      continue;
    }

    fs.copyFileSync(src, dest);
  }

  if (missing.length > 0) {
    throw new Error(
      `Download sample files missing (required for FileDownload demo):\n` +
        missing.map((f) => `  - ${f}`).join('\n') +
        `\n\nAdd them under scripts/template/samples/ or public/samples/ in the creator repo.`,
    );
  }

  return destDir;
}
