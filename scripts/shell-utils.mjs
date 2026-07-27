import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/** True when a make/shell value must be quoted (spaces or shell metacharacters). */
export function needsShellQuotes(value) {
  return /[^\w@%/+=.,:-]/.test(value);
}

/** Quote a value for make/shell assignment, e.g. name="my alerts". */
export function quoteShellValue(value) {
  if (!needsShellQuotes(value)) {
    return value;
  }
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Format `key=value` for make targets, quoting value when needed. */
export function formatMakeArg(key, value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return `${key}=${quoteShellValue(trimmed)}`;
}

export function resolveLocalBin(root, name) {
  const local = path.join(root, 'node_modules', '.bin', name);
  return fs.existsSync(local) ? local : name;
}

/** Run a local bin (prettier/eslint) with paths that may contain spaces. */
export function runLocalBin(root, binName, args) {
  const bin = resolveLocalBin(root, binName);
  execFileSync(bin, args, { cwd: root, stdio: 'pipe' });
}
