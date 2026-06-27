#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALID_SCOPES = ['full', 'hook', 'page'];
const ROUTES_FILE = 'src/router/featureRoutes.tsx';
const MENU_FILE = 'src/layouts/sidebar/featureMenuItems.tsx';
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

function splitNameParts(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const normalized = trimmed.replace(/[\s_]+/g, '-');
  if (normalized.includes('-')) {
    return normalized
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '')
      .split('-')
      .filter(Boolean);
  }

  const camelParts = trimmed.replace(/[^a-zA-Z0-9]/g, '').match(/[A-Z]?[a-z0-9]+/g);
  if (camelParts?.length) {
    return camelParts.map((part) => part.toLowerCase());
  }

  return [];
}

function parseName(raw) {
  const parts = splitNameParts(raw);

  if (parts.length === 0) {
    throw new Error('Feature name is required, e.g. products, my-feature, or multiWord');
  }

  const kebab = parts.join('-');
  const pascal = parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const camel = parts[0] + parts.slice(1).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return { kebab, pascal, camel, parts };
}

function readLocaleData(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) return null;
  return JSON.parse(fs.readFileSync(absolute, 'utf8'));
}

function detectExistingLocaleKey(key) {
  const found = [];
  for (const localeFile of ['src/locales/en.json', 'src/locales/id.json']) {
    const data = readLocaleData(localeFile);
    if (!data) continue;
    if (data.nav?.[key] !== undefined) {
      found.push(`nav.${key} in ${localeFile}`);
    }
    if (data[key] !== undefined) {
      found.push(`"${key}" section in ${localeFile}`);
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

    data.nav[meta.camel] = labels.nav;

    const existingSection =
      typeof data[meta.camel] === 'object' && data[meta.camel] !== null ? data[meta.camel] : {};
    data[meta.camel] = { ...existingSection, subtitle: labels.subtitle };

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
  const featureRoot = path.join(ROOT, 'src/features', meta.camel);
  const hasFolder = fs.existsSync(featureRoot);

  const routesGen = readRootFile(ROUTES_FILE);
  const hasRoute = Boolean(
    routesGen &&
      (routesGen.includes(`path: '${meta.camel}'`) || routesGen.includes(`features/${meta.camel}/`)),
  );

  const menuGen = readRootFile(MENU_FILE);
  const hasSidebar = Boolean(
    menuGen &&
      (menuGen.includes(`key: '${meta.camel}'`) || menuGen.includes(`path: '/${meta.camel}'`)),
  );

  if (hasFolder) {
    found.push(`src/features/${meta.camel}/`);
  }
  if (hasRoute) {
    found.push(`Route /${meta.camel} in ${ROUTES_FILE}`);
  }
  if (hasSidebar) {
    found.push(`Sidebar menu in ${MENU_FILE}`);
  }

  return [...new Set(found)];
}

function suggestFeatureNames(meta) {
  const suffixes = ['List', 'Manage', 'Overview', 'Admin'];
  return suffixes.map((suffix) => {
    const name = `${meta.camel}${suffix}`;
    const label = `${meta.pascal} ${suffix}`;
    return `make feature name="${name}" label="${label}"`;
  });
}

function exitFeatureAlreadyExists(meta, found) {
  console.error('');
  console.error(`✗ Feature name "${meta.camel}" is already in use — choose a different name.`);
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

const FEATURE_MENU_ICON_BLOCK = `function FeatureMenuIcon() {
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

function ensureFeatureMenuIcon(content) {
  if (content.includes('function FeatureMenuIcon(')) {
    return content;
  }

  return content.replace(
    'export function buildFeatureMenuItems',
    `${FEATURE_MENU_ICON_BLOCK}\nexport function buildFeatureMenuItems`,
  );
}

const ROUTES_FILE_HEADER = `/**
 * Feature routes — edit manually or append via make feature.
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
  patchFile(ROUTES_FILE, (content) => {
    if (content.includes(`features/${meta.camel}/`)) {
      return content;
    }

    let updated = ensureRoutesFileHeader(content);
    const lazyDecl = `const ${meta.pascal}Page = lazy(() => import('@/features/${meta.camel}/pages/${meta.pascal}Page'));\n\n`;
    if (!updated.includes(`const ${meta.pascal}Page = lazy`)) {
      updated = updated.replace('export const featureRoutes', `${lazyDecl}export const featureRoutes`);
    }

    const routeEntry = `  {
    path: '${meta.camel}',
    element: (
      <FeatureLazyPage>
        <${meta.pascal}Page />
      </FeatureLazyPage>
    ),
  }`;

    if (updated.includes('export const featureRoutes = [];')) {
      return updated.replace(
        'export const featureRoutes = [];',
        `export const featureRoutes = [\n${routeEntry},\n];`,
      );
    }

    return updated.replace(
      /(export const featureRoutes = \[)([\s\S]*?)(\n\];)/,
      (_, open, inner, close) => `${open}${appendArrayEntry(inner, routeEntry)}${close}`,
    );
  });
}

function appendGeneratedMenuItem(meta) {
  patchFile(MENU_FILE, (content) => {
    if (content.includes(`key: '${meta.camel}'`)) {
      return content;
    }

    let updated = ensureFeatureMenuIcon(content);

    const menuEntry = `    {
      key: '${meta.camel}',
      label: t('nav.${meta.camel}'),
      path: '/${meta.camel}',
      icon: <FeatureMenuIcon />,
    }`;

    updated = updated.replace(
      'buildFeatureMenuItems(_t:',
      'buildFeatureMenuItems(t:',
    );

    if (updated.includes('return [];')) {
      return updated.replace('return [];', `return [\n${menuEntry},\n  ];`);
    }

    return updated.replace(
      /(export function buildFeatureMenuItems\(t: \(key: string\) => string\): NavMenuItem\[\] \{\n  return \[)([\s\S]*?)(\n  \];\n\})/,
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
  const { camel, pascal } = meta;
  const { labelEn, labelId } = labels;
  const subtitles = subtitleForScope(scope, labelEn, labelId);

  const pageEmpty = `import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';

export default function ${pascal}Page() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.${camel}')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('${camel}.subtitle')}
        </Typography.Text>
      </div>
    </div>
  );
}
`;

  const pageWithTable = `import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';
import { ${pascal}Table } from '@/features/${camel}/components/${pascal}Table';

export default function ${pascal}Page() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.${camel}')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('${camel}.subtitle')}
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
import type { ${pascal}Item } from '@/features/${camel}/hooks/use${pascal}Page';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';
import { use${pascal}Page } from '@/features/${camel}/hooks/use${pascal}Page';

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
import { ${camel}Usecase } from '@/features/${camel}/usecase/${camel}Usecase';

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
  { id: '${camel}_001', name: '${labelEn} A', isActive: true },
  { id: '${camel}_002', name: '${labelEn} B', isActive: true },
  { id: '${camel}_003', name: '${labelEn} C', isActive: false },
  { id: '${camel}_004', name: '${labelEn} D', isActive: true },
  { id: '${camel}_005', name: '${labelEn} E', isActive: true },
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
import type { ${pascal}Item } from '@/features/${camel}/hooks/use${pascal}Page';

const MOCK_${pascal.toUpperCase()}_ITEMS: ${pascal}Item[] = [
  { id: '${camel}_001', name: '${labelEn} A', isActive: true },
  { id: '${camel}_002', name: '${labelEn} B', isActive: true },
  { id: '${camel}_003', name: '${labelEn} C', isActive: false },
  { id: '${camel}_004', name: '${labelEn} D', isActive: true },
  { id: '${camel}_005', name: '${labelEn} E', isActive: true },
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

/** Step 2 in the tutorial guide — create feature files without menu/route wiring. */
export function writeManualFeatureFiles(meta, templates) {
  const featureRoot = path.join(ROOT, 'src/features', meta.camel);

  fs.mkdirSync(path.join(featureRoot, 'pages'), { recursive: true });
  fs.writeFileSync(path.join(featureRoot, 'pages', `${meta.pascal}Page.tsx`), templates.page);

  if (templates.table) {
    fs.mkdirSync(path.join(featureRoot, 'components'), { recursive: true });
    fs.writeFileSync(path.join(featureRoot, 'components', `${meta.pascal}Table.tsx`), templates.table);
  }

  if (templates.hook) {
    fs.mkdirSync(path.join(featureRoot, 'hooks'), { recursive: true });
    fs.writeFileSync(path.join(featureRoot, 'hooks', `use${meta.pascal}Page.ts`), templates.hook);
  }

  if (templates.usecase) {
    fs.mkdirSync(path.join(featureRoot, 'usecase'), { recursive: true });
    fs.writeFileSync(path.join(featureRoot, 'usecase', `${meta.camel}Usecase.ts`), templates.usecase);
  }
}

/** Step 3 in the tutorial guide — locale, sidebar menu, and route wiring. */
export function wireManualFeatureNavigation(meta, templates) {
  patchLocales(meta, templates);
  appendGeneratedRoute(meta);
  appendGeneratedMenuItem(meta);
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
    ...new Set([...detectExistingFeature(meta), ...detectExistingLocaleKey(meta.camel)]),
  ];
  if (existing.length > 0) {
    exitFeatureAlreadyExists(meta, existing);
  }

  const featureRoot = path.join(ROOT, 'src/features', meta.camel);
  const templates = buildTemplates(meta, labels, scope);
  const created = [];

  writeFileIfMissing(path.join(featureRoot, 'pages', `${meta.pascal}Page.tsx`), templates.page);
  created.push(`src/features/${meta.camel}/pages/${meta.pascal}Page.tsx`);

  if (templates.table) {
    writeFileIfMissing(path.join(featureRoot, 'components', `${meta.pascal}Table.tsx`), templates.table);
    created.push(`src/features/${meta.camel}/components/${meta.pascal}Table.tsx`);
  }

  if (templates.hook) {
    writeFileIfMissing(path.join(featureRoot, 'hooks', `use${meta.pascal}Page.ts`), templates.hook);
    created.push(`src/features/${meta.camel}/hooks/use${meta.pascal}Page.ts`);
  }

  if (templates.usecase) {
    writeFileIfMissing(path.join(featureRoot, 'usecase', `${meta.camel}Usecase.ts`), templates.usecase);
    created.push(`src/features/${meta.camel}/usecase/${meta.camel}Usecase.ts`);
  }

  wireManualFeatureNavigation(meta, templates);

  const touchedFiles = [
    ...created,
    ROUTES_FILE,
    MENU_FILE,
    'src/locales/en.json',
    'src/locales/id.json',
  ];
  const formatted = formatGeneratedFiles(touchedFiles);

  const scopeLabels = { full: 'full (page + table + hook + usecase)', hook: 'hook (page + table + hook)', page: 'page (empty page only)' };

  console.log(`\n✓ Feature "${meta.camel}" generated (${scopeLabels[scope]}).\n`);
  console.log('Created:');
  created.forEach((file) => console.log(`  ${file}`));
  console.log('\nUpdated:');
  console.log(`  ${ROUTES_FILE}`);
  console.log(`  ${MENU_FILE}`);
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
  console.log(`  2. In ${MENU_FILE}, replace <FeatureMenuIcon /> for key '${meta.camel}'`);
  console.log(`\nOpen http://localhost:5173/${meta.camel} after make dev\n`);
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main();
}

export { buildTemplates, parseName };
