#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALID_SCOPES = ['full', 'hook', 'page'];

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
  const localeKey = parts.length === 1 ? parts[0] : camel;

  return { kebab, pascal, camel, localeKey, parts };
}

function escapeJsonString(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function appendNavLocaleEntry(content, key, label) {
  if (new RegExp(`"nav"[\\s\\S]*?"${key}"\\s*:`).test(content)) {
    throw new Error(`Nav key "${key}" already exists`);
  }

  return content.replace(/(  "nav": \{[\s\S]*?)(  \},)/, (_, navInner, navClose) => {
    let inner = navInner.replace(/\s+$/, '');
    inner = inner.replace(/(\n    "[^"]+": "(?:[^"\\]|\\.)*")(\s*)$/, '$1,$2');
    return `${inner}\n    "${key}": "${escapeJsonString(label)}"\n${navClose}`;
  });
}

function appendFeatureLocaleSection(content, key, subtitle) {
  if (content.includes(`"${key}": {`)) {
    throw new Error(`Locale key ${key} already exists`);
  }

  const block = `  "${key}": {\n    "subtitle": "${escapeJsonString(subtitle)}"\n  },`;

  if (content.includes('\n  "footer": {')) {
    return content.replace(/\n  "footer": \{/, `\n${block}\n  "footer": {`);
  }

  return content.replace(/(\n)\}$/, `$1${block}\n}$`);
}

function readRootFile(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolute)) return null;
  return fs.readFileSync(absolute, 'utf8');
}

function detectExistingFeature(meta) {
  const found = [];
  const featureRoot = path.join(ROOT, 'src/features', meta.kebab);

  if (fs.existsSync(featureRoot)) {
    found.push(`src/features/${meta.kebab}/`);
  }

  const router = readRootFile('src/router/AppRouter.tsx');
  if (router) {
    if (router.includes(`path: '${meta.kebab}'`) || router.includes(`features/${meta.kebab}/`)) {
      found.push(`Route /${meta.kebab} in src/router/AppRouter.tsx`);
    }
  }

  const sidebar = readRootFile('src/layouts/sidebar/hooks/useSidebar.tsx');
  if (sidebar) {
    if (
      sidebar.includes(`key: '${meta.kebab}'`) ||
      sidebar.includes(`path: '/${meta.kebab}'`) ||
      sidebar.includes(`nav.${meta.localeKey}`)
    ) {
      found.push(`Sidebar menu in src/layouts/sidebar/hooks/useSidebar.tsx`);
    }
  }

  const icons = readRootFile('src/layouts/sidebar/components/SidebarIcons.tsx');
  if (icons?.includes(`export function ${meta.pascal}Icon(`)) {
    found.push(`${meta.pascal}Icon in src/layouts/sidebar/components/SidebarIcons.tsx`);
  }

  for (const localeFile of ['src/locales/en.json', 'src/locales/id.json']) {
    const locale = readRootFile(localeFile);
    if (locale && (locale.includes(`"${meta.localeKey}":`) || locale.includes(`"nav.${meta.localeKey}"`))) {
      found.push(`Locale key "${meta.localeKey}" in ${localeFile}`);
      break;
    }
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
  console.error(`✗ Feature "${meta.kebab}" already exists — create a different one.`);
  console.error('');
  console.error('  Found:');
  found.forEach((item) => console.error(`    - ${item}`));
  console.error('');
  console.error('  Examples:');
  suggestFeatureNames(meta).forEach((example) => console.error(`    ${example}`));
  console.error('');
  process.exit(1);
}

function writeFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: ${path.relative(ROOT, filePath)}`);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
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

function subtitleForScope(scope, labelEn, labelId) {
  if (scope === 'page') {
    return {
      en: `Empty page scaffold for ${labelEn.toLowerCase()} — add your own components.`,
      id: `Halaman kosong untuk ${labelId.toLowerCase()} — tambahkan komponen sendiri.`,
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
  const { kebab, pascal, camel, localeKey } = meta;
  const { labelEn, labelId } = labels;
  const subtitles = subtitleForScope(scope, labelEn, labelId);

  const pageEmpty = `import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';

export default function ${pascal}Page() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.${localeKey}')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('${localeKey}.subtitle')}
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
        <Typography.Title level={2}>{t('nav.${localeKey}')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('${localeKey}.subtitle')}
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
import { DataTable } from '@/components/DataTable';
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
        header: t('common.name'),
        sortable: true,
      },
      {
        key: 'isActive',
        header: t('common.status'),
        render: (item) => (
          <Badge variant={item.isActive ? 'success' : 'danger'} dot>
            {item.isActive ? t('common.active') : t('common.inactive')}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={items}
      columns={columns}
      isLoading={isLoading}
      currentPage={page}
      totalPages={totalPages}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={setPage}
      onPageSizeChange={onPageSizeChange}
    />
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

  const icon = `export function ${pascal}Icon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}
`;

  return {
    page: scope === 'page' ? pageEmpty : pageWithTable,
    table: scope === 'page' ? null : table,
    hook: scope === 'full' ? hookWithUsecase : scope === 'hook' ? hookWithInlineMock : null,
    usecase: scope === 'full' ? usecase : null,
    icon,
    localeEn: { nav: labelEn, subtitle: subtitles.en },
    localeId: { nav: labelId, subtitle: subtitles.id },
  };
}

function patchSidebar(meta, templates) {
  patchFile('src/layouts/sidebar/components/SidebarIcons.tsx', (content) => {
    const marker = `export function TutorialIcon()`;
    if (content.includes(`export function ${meta.pascal}Icon()`)) {
      throw new Error(`Icon ${meta.pascal}Icon already exists`);
    }
    return content.replace(marker, `${templates.icon}\n\n${marker}`);
  });

  patchFile('src/layouts/sidebar/hooks/useSidebar.tsx', (content) => {
    let updated = content;
    if (!updated.includes(`${meta.pascal}Icon`)) {
      updated = updated.replace(
        `} from '@/layouts/sidebar/components/SidebarIcons';`,
        `  ${meta.pascal}Icon,\n} from '@/layouts/sidebar/components/SidebarIcons';`,
      );
    }

    const sidebarNeedle = /\n    \];\n\n    if \(isDev\)/;
    if (!sidebarNeedle.test(updated)) {
      throw new Error('Could not patch useSidebar.tsx — items array anchor not found');
    }

    const menuItem = `      {
        key: '${meta.kebab}',
        label: t('nav.${meta.localeKey}'),
        path: '/${meta.kebab}',
        icon: <${meta.pascal}Icon />,
      },`;

    return updated.replace(sidebarNeedle, `\n${menuItem}\n    ];\n\n    if (isDev)`);
  });
}

function patchRouter(meta) {
  patchFile('src/router/AppRouter.tsx', (content) => {
    if (content.includes(`features/${meta.kebab}/`)) {
      throw new Error(`Route for ${meta.kebab} already exists in AppRouter.tsx`);
    }

    let updated = content.replace(
      '\nfunction LazyPage',
      `\nconst ${meta.pascal}Page = lazy(() => import('@/features/${meta.kebab}/pages/${meta.pascal}Page'));\n\nfunction LazyPage`,
    );

    const routeSpreadNeedle = '  ...tutorialRoutes,';
    if (!updated.includes(routeSpreadNeedle)) {
      throw new Error('Could not patch AppRouter.tsx — tutorialRoutes spread anchor not found');
    }

    const routeBlock = `  {
    path: '${meta.kebab}',
    element: (
      <LazyPage>
        <${meta.pascal}Page />
      </LazyPage>
    ),
  },
  ...tutorialRoutes,`;

    return updated.replace(routeSpreadNeedle, routeBlock);
  });
}

function patchLocales(meta, templates) {
  for (const [localeFile, labels] of [
    ['src/locales/en.json', templates.localeEn],
    ['src/locales/id.json', templates.localeId],
  ]) {
    patchFile(localeFile, (content) => {
      let updated = appendNavLocaleEntry(content, meta.localeKey, labels.nav);
      updated = appendFeatureLocaleSection(updated, meta.localeKey, labels.subtitle);
      return updated;
    });
  }
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

  const existing = detectExistingFeature(meta);
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

  patchSidebar(meta, templates);
  patchRouter(meta);
  patchLocales(meta, templates);

  const scopeLabels = { full: 'full (page + table + hook + usecase)', hook: 'hook (page + table + hook)', page: 'page (empty page only)' };

  console.log(`\n✓ Feature "${meta.kebab}" generated (${scopeLabels[scope]}).\n`);
  console.log('Created:');
  created.forEach((file) => console.log(`  ${file}`));
  console.log('\nUpdated:');
  console.log('  src/router/AppRouter.tsx');
  console.log('  src/layouts/sidebar/hooks/useSidebar.tsx');
  console.log('  src/layouts/sidebar/components/SidebarIcons.tsx');
  console.log('  src/locales/en.json');
  console.log('  src/locales/id.json');
  console.log(`\nOpen http://localhost:5173/${meta.kebab} after make dev\n`);
}

main();
