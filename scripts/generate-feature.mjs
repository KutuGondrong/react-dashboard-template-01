#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALID_SCOPES = ['full', 'hook', 'page'];
const ROUTES_GEN = 'src/router/featureRoutes.generated.tsx';
const MENU_GEN = 'src/layouts/sidebar/featureMenuItems.generated.tsx';
const GENERATED_FEATURE_ICON_PATH =
  'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z';

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (arg.startsWith('--name=')) args.name = arg.slice('--name='.length);
    if (arg.startsWith('--label=')) args.label = arg.slice('--label='.length);
    if (arg.startsWith('--label-id=')) args.labelId = arg.slice('--label-id='.length);
    if (arg.startsWith('--scope=')) args.scope = arg.slice('--scope='.length);
  }
  return args;
}

function parseScope(raw) {
  const scope = (raw || 'full').toLowerCase();
  if (scope === 'empty') return 'page';
  if (!VALID_SCOPES.includes(scope)) {
    throw new Error(`Invalid scope "${raw}". Use: full, hook, page (alias: empty)`);
  }
  return scope;
}

function parseName(raw) {
  const kebab = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (!kebab) {
    throw new Error('Feature name is required, e.g. products or my-feature');
  }

  const parts = kebab.split('-').filter(Boolean);
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const camel = parts[0] + parts.slice(1).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return { kebab, pascal, camel, parts };
}

function readLocaleData(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) return null;
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function detectExistingLocaleKey(kebab) {
  const found = [];
  for (const localeFile of ['src/locales/en.json', 'src/locales/id.json']) {
    const data = readLocaleData(localeFile);
    if (!data) continue;
    if (data.nav?.[kebab] !== undefined) {
      found.push(`nav.${kebab} in ${localeFile}`);
    }
    if (data[kebab] !== undefined) {
      found.push(`"${kebab}" section in ${localeFile}`);
    }
  }
  return found;
}

function patchLocales(meta, templates) {
  for (const [localeFile, labels] of [
    ['src/locales/en.json', templates.localeEn],
    ['src/locales/id.json', templates.localeId],
  ]) {
    const absolute = path.join(ROOT, localeFile);
    if (!fs.existsSync(absolute)) {
      throw new Error(`File not found: ${localeFile}`);
    }

    const data = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (!data.nav || typeof data.nav !== 'object') {
      data.nav = {};
    }

    data.nav[meta.kebab] = labels.nav;

    const existingSection =
      typeof data[meta.kebab] === 'object' && data[meta.kebab] !== null ? data[meta.kebab] : {};
    data[meta.kebab] = { ...existingSection, subtitle: labels.subtitle };

    if (data.nav.generatedFeature && Object.keys(data.nav.generatedFeature).length === 0) {
      delete data.nav.generatedFeature;
    }
    if (data.generatedFeature && Object.keys(data.generatedFeature).length === 0) {
      delete data.generatedFeature;
    }

    fs.writeFileSync(absolute, `${JSON.stringify(data, null, 2)}\n`);
  }
}

function readRootFile(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) return null;
  return fs.readFileSync(absolute, 'utf8');
}

function detectExistingFeature(meta) {
  const found = [];
  const featureRoot = path.join(ROOT, 'src/features', meta.kebab);
  const hasFolder = fs.existsSync(featureRoot);

  const routesGen = readRootFile(ROUTES_GEN);
  const hasRoute = Boolean(
    routesGen &&
      (routesGen.includes(`path: '${meta.kebab}'`) || routesGen.includes(`features/${meta.kebab}/`)),
  );

  const menuGen = readRootFile(MENU_GEN);
  const hasSidebar = Boolean(
    menuGen &&
      (menuGen.includes(`key: '${meta.kebab}'`) || menuGen.includes(`path: '/${meta.kebab}'`)),
  );

  if (hasFolder) {
    found.push(`src/features/${meta.kebab}/`);
  }
  if (hasRoute) {
    found.push(`Route /${meta.kebab} in ${ROUTES_GEN}`);
  }
  if (hasSidebar) {
    found.push(`Sidebar menu in ${MENU_GEN}`);
  }

  return [...new Set(found)];
}

function suggestFeatureNames(meta) {
  const suffixes = ['list', 'manage', 'overview', 'admin'];
  return suffixes.map((suffix) => {
    const name = `${meta.kebab}-${suffix}`;
    const label = `${meta.pascal} ${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`;
    return `make feature name=${name} label="${label}"`;
  });
}

function exitFeatureAlreadyExists(meta, found) {
  console.error('');
  console.error(`✗ Feature name "${meta.kebab}" is already in use — choose a different name.`);
  console.error('');
  console.error('  Found:');
  found.forEach((item) => console.error(`    - ${item}`));
  console.error('');
  console.error('  Locale keys use the feature name directly (nav.<name>, <name>.subtitle).');
  console.error('  Each name must be unique across features and locale files.');
  console.error('');
  console.error('  Examples:');
  suggestFeatureNames(meta).forEach((example) => console.error(`    ${example}`));
  console.error('');
  process.exit(1);
}

function writeFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) {
    return false;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

function resolveLocalBin(name) {
  const local = path.join(ROOT, 'node_modules', '.bin', name);
  return fs.existsSync(local) ? local : name;
}

function formatGeneratedFiles(relativePaths) {
  const absolutePaths = [...new Set(relativePaths)]
    .map((rel) => path.join(ROOT, rel))
    .filter((abs) => fs.existsSync(abs));

  if (absolutePaths.length === 0) {
    return false;
  }

  if (!fs.existsSync(path.join(ROOT, 'node_modules', 'prettier'))) {
    return false;
  }

  const prettier = resolveLocalBin('prettier');
  const eslint = resolveLocalBin('eslint');
  const quote = (filePath) => `"${filePath}"`;

  execSync(`${prettier} --write ${absolutePaths.map(quote).join(' ')}`, {
    cwd: ROOT,
    stdio: 'pipe',
  });

  const lintTargets = absolutePaths.filter((filePath) => /\.tsx?$/.test(filePath));
  if (lintTargets.length > 0) {
    execSync(`${eslint} ${lintTargets.map(quote).join(' ')} --fix`, {
      cwd: ROOT,
      stdio: 'pipe',
    });
  }

  return true;
}

function patchFile(filePath, transform) {
  const absolute = path.join(ROOT, filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const original = fs.readFileSync(absolute, 'utf8');
  const updated = transform(original);
  if (updated === original) {
    throw new Error(`Could not patch ${filePath} — anchor not found or already patched`);
  }
  fs.writeFileSync(absolute, updated);
}

const GENERATED_FEATURE_ICON_BLOCK = `function GeneratedFeatureIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="${GENERATED_FEATURE_ICON_PATH}"
      />
    </svg>
  );
}
`;

function ensureGeneratedFeatureIcon(content) {
  if (content.includes('function GeneratedFeatureIcon(')) {
    return content;
  }

  return content.replace(
    'export function buildGeneratedFeatureMenuItems',
    `${GENERATED_FEATURE_ICON_BLOCK}\nexport function buildGeneratedFeatureMenuItems`,
  );
}

const ROUTES_FILE_HEADER = `/**
 * AUTO-GENERATED by \`make feature\` — do not edit manually.
 * Spread into protectedChildren in AppRouter.tsx.
 */
import { lazy, Suspense, type ReactNode } from 'react';
import { SkeletonLoader } from '@/components/SkeletonLoader';

function FeatureLazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>;
}

`;

function ensureRoutesFileHeader(content) {
  if (content.includes('function FeatureLazyPage(')) {
    return content;
  }

  return ROUTES_FILE_HEADER + content.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '');
}

export function appendArrayEntry(inner, entry) {
  const trimmed = inner.trim();
  if (!trimmed) {
    return `\n${entry},\n`;
  }
  const withoutTrailingComma = trimmed.replace(/,\s*$/, '');
  const leadingWhitespace = inner.match(/^\s*/)?.[0] ?? '';
  return `${leadingWhitespace}${withoutTrailingComma},\n${entry},\n`;
}

function appendGeneratedRoute(meta) {
  patchFile(ROUTES_GEN, (content) => {
    if (content.includes(`features/${meta.kebab}/`)) {
      return content;
    }

    let updated = ensureRoutesFileHeader(content);
    const lazyDecl = `const ${meta.pascal}Page = lazy(() => import('@/features/${meta.kebab}/pages/${meta.pascal}Page'));\n\n`;
    if (!updated.includes(`const ${meta.pascal}Page = lazy`)) {
      updated = updated.replace('export const generatedFeatureRoutes', `${lazyDecl}export const generatedFeatureRoutes`);
    }

    const routeEntry = `  {
    path: '${meta.kebab}',
    element: (
      <FeatureLazyPage>
        <${meta.pascal}Page />
      </FeatureLazyPage>
    ),
  }`;

    if (updated.includes('export const generatedFeatureRoutes = [];')) {
      return updated.replace(
        'export const generatedFeatureRoutes = [];',
        `export const generatedFeatureRoutes = [\n${routeEntry},\n];`,
      );
    }

    return updated.replace(
      /(export const generatedFeatureRoutes = \[)([\s\S]*?)(\n\];)/,
      (_, open, inner, close) => `${open}${appendArrayEntry(inner, routeEntry)}${close}`,
    );
  });
}

function appendGeneratedMenuItem(meta) {
  patchFile(MENU_GEN, (content) => {
    if (content.includes(`key: '${meta.kebab}'`)) {
      return content;
    }

    let updated = ensureGeneratedFeatureIcon(content);

    const menuEntry = `    {
      key: '${meta.kebab}',
      label: t('nav.${meta.kebab}'),
      path: '/${meta.kebab}',
      icon: <GeneratedFeatureIcon />,
    }`;

    updated = updated.replace(
      'buildGeneratedFeatureMenuItems(_t:',
      'buildGeneratedFeatureMenuItems(t:',
    );

    if (updated.includes('return [];')) {
      return updated.replace('return [];', `return [\n${menuEntry},\n  ];`);
    }

    return updated.replace(
      /(export function buildGeneratedFeatureMenuItems\(t: \(key: string\) => string\): NavMenuItem\[\] \{\n  return \[)([\s\S]*?)(\n  \];\n\})/,
      (_, open, inner, close) => `${open}${appendArrayEntry(inner, menuEntry)}${close}`,
    );
  });
}

function subtitleForScope(scope, labelEn, labelId) {
  if (scope === 'page') {
    return {
      en: `Empty page scaffold for ${labelEn.toLowerCase()}: add your own components.`,
      id: `Halaman kosong untuk ${labelId.toLowerCase()}: tambahkan komponen sendiri.`,
    };
  }
  if (scope === 'hook') {
    return {
      en: `Manage ${labelEn.toLowerCase()} with table, hook, and inline mock data.`,
      id: `Kelola ${labelId.toLowerCase()} dengan table, hook, dan mock data inline.`,
    };
  }
  return {
    en: `Manage ${labelEn.toLowerCase()} with mock data, pagination, and standard page layout.`,
    id: `Kelola ${labelId.toLowerCase()} dengan mock data, pagination, dan layout halaman standar.`,
  };
}

function buildTemplates(meta, labels, scope) {
  const { kebab, pascal, camel } = meta;
  const { labelEn, labelId } = labels;
  const subtitles = subtitleForScope(scope, labelEn, labelId);

  const pageEmpty = `import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';

export default function ${pascal}Page() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.${kebab}')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('${kebab}.subtitle')}
        </Typography.Text>
      </div>
    </div>
  );
}
`;

  const pageWithTable = `import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';
import { ${pascal}Table } from '@/features/${kebab}/components/${pascal}Table';

export default function ${pascal}Page() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.${kebab}')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('${kebab}.subtitle')}
        </Typography.Text>
      </div>

      <${pascal}Table />
    </div>
  );
}
`;

  const table = `import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn } from '@/models/model.type';
import type { ${pascal}Item } from '@/features/${kebab}/hooks/use${pascal}Page';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';
import { use${pascal}Page } from '@/features/${kebab}/hooks/use${pascal}Page';

export function ${pascal}Table() {
  const { t } = useLocale();
  const { items, isLoading, page, setPage, pageSize, totalPages, totalItems, onPageSizeChange } =
    use${pascal}Page();

  const columns = useMemo<TableColumn<${pascal}Item>[]>(
    () => [
      {
        key: 'name',
        header: t('components.common.name'),
        sortable: true,
      },
      {
        key: 'isActive',
        header: t('components.common.status'),
        render: (item) => (
          <Badge variant={item.isActive ? 'success' : 'danger'} dot>
            {item.isActive ? t('components.common.active') : t('components.common.inactive')}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTableGroup>
      <DataTable unwrapped data={items} columns={columns} isLoading={isLoading} />
      <DataTableGroup.Footer>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={onPageSizeChange}
        />
      </DataTableGroup.Footer>
    </DataTableGroup>
  );
}
`;

  const hookWithUsecase = `import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/config/app.config';
import { ${camel}Usecase } from '@/features/${kebab}/usecase/${camel}Usecase';

export interface ${pascal}Item {
  id: string;
  name: string;
  isActive: boolean;
}

export function use${pascal}Page() {
  const [items, setItems] = useState<${pascal}Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(appConfig.paginationDefaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ${camel}Usecase.getItems(page, pageSize);
      setItems(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    items,
    isLoading,
    page,
    setPage: handlePageChange,
    pageSize,
    totalPages,
    totalItems,
    onPageSizeChange: handlePageSizeChange,
  };
}
`;

  const hookWithInlineMock = `import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/config/app.config';
import type { PaginatedResult } from '@/models/model.type';

export interface ${pascal}Item {
  id: string;
  name: string;
  isActive: boolean;
}

const MOCK_${pascal.toUpperCase()}_ITEMS: ${pascal}Item[] = [
  { id: '${kebab}_001', name: '${labelEn} A', isActive: true },
  { id: '${kebab}_002', name: '${labelEn} B', isActive: true },
  { id: '${kebab}_003', name: '${labelEn} C', isActive: false },
  { id: '${kebab}_004', name: '${labelEn} D', isActive: true },
  { id: '${kebab}_005', name: '${labelEn} E', isActive: true },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMockItems(page: number, pageSize: number): Promise<PaginatedResult<${pascal}Item>> {
  await delay(500);
  const start = (page - 1) * pageSize;
  const data = MOCK_${pascal.toUpperCase()}_ITEMS.slice(start, start + pageSize);
  return {
    data,
    total: MOCK_${pascal.toUpperCase()}_ITEMS.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(MOCK_${pascal.toUpperCase()}_ITEMS.length / pageSize)),
  };
}

export function use${pascal}Page() {
  const [items, setItems] = useState<${pascal}Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(appConfig.paginationDefaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchMockItems(page, pageSize);
      setItems(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    items,
    isLoading,
    page,
    setPage: handlePageChange,
    pageSize,
    totalPages,
    totalItems,
    onPageSizeChange: handlePageSizeChange,
  };
}
`;

  const usecase = `import type { PaginatedResult } from '@/models/model.type';
import type { ${pascal}Item } from '@/features/${kebab}/hooks/use${pascal}Page';

const MOCK_${pascal.toUpperCase()}_ITEMS: ${pascal}Item[] = [
  { id: '${kebab}_001', name: '${labelEn} A', isActive: true },
  { id: '${kebab}_002', name: '${labelEn} B', isActive: true },
  { id: '${kebab}_003', name: '${labelEn} C', isActive: false },
  { id: '${kebab}_004', name: '${labelEn} D', isActive: true },
  { id: '${kebab}_005', name: '${labelEn} E', isActive: true },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const ${camel}Usecase = {
  async getItems(page: number, pageSize: number): Promise<PaginatedResult<${pascal}Item>> {
    await delay(500);
    const start = (page - 1) * pageSize;
    const data = MOCK_${pascal.toUpperCase()}_ITEMS.slice(start, start + pageSize);
    return {
      data,
      total: MOCK_${pascal.toUpperCase()}_ITEMS.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(MOCK_${pascal.toUpperCase()}_ITEMS.length / pageSize)),
    };
  },
};
`;

  return {
    page: scope === 'page' ? pageEmpty : pageWithTable,
    table: scope === 'page' ? null : table,
    hook: scope === 'full' ? hookWithUsecase : scope === 'hook' ? hookWithInlineMock : null,
    usecase: scope === 'full' ? usecase : null,
    localeEn: { nav: labelEn, subtitle: subtitles.en },
    localeId: { nav: labelId, subtitle: subtitles.id },
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name) {
    console.error(
      'Usage: node scripts/generate-feature.mjs --name=<feature> [--scope=full|hook|page] [--label="Display Name"] [--label-id="Nama"]',
    );
    console.error('');
    console.error('Scopes:');
    console.error('  full  — page + table + hook + usecase (default)');
    console.error('  hook  — page + table + hook (mock data inline in hook)');
    console.error('  page  — empty page + menu wiring only (alias: empty)');
    process.exit(1);
  }

  let scope;
  try {
    scope = parseScope(args.scope);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const meta = parseName(args.name);
  const labels = {
    labelEn: args.label || meta.pascal,
    labelId: args.labelId || args.label || meta.pascal,
  };

  const existing = [
    ...new Set([...detectExistingFeature(meta), ...detectExistingLocaleKey(meta.kebab)]),
  ];
  if (existing.length > 0) {
    exitFeatureAlreadyExists(meta, existing);
  }

  const featureRoot = path.join(ROOT, 'src/features', meta.kebab);
  const templates = buildTemplates(meta, labels, scope);
  const created = [];

  writeFileIfMissing(path.join(featureRoot, 'pages', `${meta.pascal}Page.tsx`), templates.page);
  created.push(`src/features/${meta.kebab}/pages/${meta.pascal}Page.tsx`);

  if (templates.table) {
    writeFileIfMissing(path.join(featureRoot, 'components', `${meta.pascal}Table.tsx`), templates.table);
    created.push(`src/features/${meta.kebab}/components/${meta.pascal}Table.tsx`);
  }

  if (templates.hook) {
    writeFileIfMissing(path.join(featureRoot, 'hooks', `use${meta.pascal}Page.ts`), templates.hook);
    created.push(`src/features/${meta.kebab}/hooks/use${meta.pascal}Page.ts`);
  }

  if (templates.usecase) {
    writeFileIfMissing(path.join(featureRoot, 'usecase', `${meta.camel}Usecase.ts`), templates.usecase);
    created.push(`src/features/${meta.kebab}/usecase/${meta.camel}Usecase.ts`);
  }

  appendGeneratedRoute(meta);
  appendGeneratedMenuItem(meta);
  patchLocales(meta, templates);

  const touchedFiles = [
    ...created,
    ROUTES_GEN,
    MENU_GEN,
    'src/locales/en.json',
    'src/locales/id.json',
  ];
  const formatted = formatGeneratedFiles(touchedFiles);

  const scopeLabels = { full: 'full (page + table + hook + usecase)', hook: 'hook (page + table + hook)', page: 'page (empty page only)' };

  console.log(`\n✓ Feature "${meta.kebab}" generated (${scopeLabels[scope]}).\n`);
  console.log('Created:');
  created.forEach((file) => console.log(`  ${file}`));
  console.log('\nUpdated:');
  console.log(`  ${ROUTES_GEN}`);
  console.log(`  ${MENU_GEN}`);
  console.log('  src/locales/en.json');
  console.log('  src/locales/id.json');
  if (formatted) {
    console.log('\nFormatted (Prettier + ESLint --fix):');
    touchedFiles.forEach((file) => console.log(`  ${file}`));
  } else {
    console.log('\nFormat skipped (node_modules not found — run pnpm install, then make format)');
  }
  console.log('\nCustom sidebar icon (optional):');
  console.log('  1. Add your icon in src/layouts/sidebar/components/SidebarIcons.tsx');
  console.log(`  2. In ${MENU_GEN}, replace <GeneratedFeatureIcon /> for key '${meta.kebab}'`);
  console.log(`\nOpen http://localhost:5173/${meta.kebab} after make dev\n`);
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main();
}
