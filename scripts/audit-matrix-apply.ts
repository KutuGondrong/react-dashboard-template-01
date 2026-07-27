import { buildComponentRegistry } from '../src/features/storybook/config/componentRegistry';
import { THEME_ONLY_MATRIX } from '../src/features/storybook/types/storybook.types';
import { parseComponentCode } from '../src/features/storybook/utils/codeGenerator';
import { resolveStorybookApplyDefinition } from '../src/features/storybook/utils/resolveStorybookApplyDefinition';
import { generateSingleStateCode } from '../src/features/storybook/utils/stateMatrixCodeGenerator';
import { generateFileUploadCode } from '../src/features/storybook/utils/fileUploadCodeGenerator';
import { generateFileDownloadCode } from '../src/features/storybook/utils/fileDownloadCodeGenerator';
import { generateCodeBlockCode } from '../src/features/storybook/utils/codeBlockCodeGenerator';
import { unwrapPlaygroundCodeAsFunction } from '../src/features/storybook/utils/playgroundCodeAsFunction';

const registry = buildComponentRegistry();
const slice = ['fileupload', 'filedownload', 'codeblock']
  .map((id) => registry.find((d) => d.id === id))
  .filter((d): d is NonNullable<typeof d> => Boolean(d));
const buttonDef = registry.find((d) => d.id === 'button')!;

type Issue = { kind: string; id: string; state: string; detail: string };
const issues: Issue[] = [];
let checked = 0;

for (const def of slice) {
  const states = def.matrixStates ?? THEME_ONLY_MATRIX;
  for (const { state } of states) {
    checked += 1;
    const code = generateSingleStateCode(def, state);
    const resolved = resolveStorybookApplyDefinition(code, def);
    const parsed = resolved ? parseComponentCode(code, resolved) : null;
    if (!resolved || resolved.id !== def.id || !parsed) {
      issues.push({
        kind: 'apply',
        id: def.id,
        state,
        detail: `resolved=${resolved?.id ?? 'null'} parse=${Boolean(parsed)}`,
      });
      continue;
    }
    const foreign = resolveStorybookApplyDefinition(code, buttonDef);
    if (!foreign || foreign.id !== def.id) {
      issues.push({
        kind: 'cross',
        id: def.id,
        state,
        detail: `foreign=${foreign?.id ?? 'null'}`,
      });
    }
  }
}

// Playground generate (unwrapped) must still Apply on own page
const playgroundChecks: Array<{ id: string; code: string }> = [
  { id: 'fileupload', code: unwrapPlaygroundCodeAsFunction(generateFileUploadCode({})) },
  { id: 'filedownload', code: unwrapPlaygroundCodeAsFunction(generateFileDownloadCode({})) },
  { id: 'codeblock', code: unwrapPlaygroundCodeAsFunction(generateCodeBlockCode({})) },
];

for (const { id, code } of playgroundChecks) {
  const def = registry.find((d) => d.id === id)!;
  const resolved = resolveStorybookApplyDefinition(code, def);
  const parsed = resolved ? parseComponentCode(code, resolved) : null;
  if (!resolved || resolved.id !== id || !parsed) {
    issues.push({
      kind: 'playground',
      id,
      state: 'defaults',
      detail: `resolved=${resolved?.id ?? 'null'} parse=${Boolean(parsed)} head=${code.slice(0, 80).replace(/\n/g, '↵')}`,
    });
  }
}

console.log(JSON.stringify({ range: slice.map((d) => d.id), checked, issues }, null, 2));
if (issues.length) process.exitCode = 1;
