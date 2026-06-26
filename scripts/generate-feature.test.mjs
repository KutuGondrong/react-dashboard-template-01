import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { appendArrayEntry } from './generate-feature.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const GENERATE_FEATURE = path.join(SCRIPT_DIR, 'generate-feature.mjs');
const TEMPLATE_DIR = path.join(SCRIPT_DIR, 'template');

function setupFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'feature-gen-test-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.mkdirSync(path.join(dir, 'src/router'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src/layouts/sidebar'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src/locales'), { recursive: true });

  fs.copyFileSync(GENERATE_FEATURE, path.join(dir, 'scripts/generate-feature.mjs'));
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'featureRoutes.tsx'),
    path.join(dir, 'src/router/featureRoutes.tsx'),
  );
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, 'featureMenuItems.tsx'),
    path.join(dir, 'src/layouts/sidebar/featureMenuItems.tsx'),
  );
  fs.writeFileSync(path.join(dir, 'src/locales/en.json'), '{"nav":{}}\n');
  fs.writeFileSync(path.join(dir, 'src/locales/id.json'), '{"nav":{}}\n');

  return dir;
}

function runFeature(dir, args) {
  execSync(`node scripts/generate-feature.mjs ${args}`, { cwd: dir, stdio: 'pipe' });
}

test('appendArrayEntry keeps a single opening brace when inner has trailing whitespace', () => {
  const inner = "\n  {\n    path: 'inventory',\n  },\n";
  const entry = "  {\n    path: 'reports',\n  }";
  const result = appendArrayEntry(inner, entry);

  assert.equal(result.startsWith("\n  {"), true);
  assert.equal(result.includes('{{'), false);
});

test('sequential generation: full → hook → page scopes produce valid routes', () => {
  const dir = setupFixture();

  runFeature(dir, '--name=inventory --label="Inventory" --label-id="Inventaris"');
  runFeature(dir, '--name=reports --scope=hook --label="Reports" --label-id="Laporan"');
  runFeature(dir, '--name=alerts --scope=page --label="Alerts" --label-id="Peringatan"');

  const routesPath = path.join(dir, 'src/router/featureRoutes.tsx');
  const menuPath = path.join(dir, 'src/layouts/sidebar/featureMenuItems.tsx');
  const routes = fs.readFileSync(routesPath, 'utf8');
  const menu = fs.readFileSync(menuPath, 'utf8');

  assert.equal(routes.includes('{{'), false, 'routes must not contain doubled braces');
  assert.equal(menu.includes('{{'), false, 'menu must not contain doubled braces');
  assert.match(routes, /path: 'inventory'/);
  assert.match(routes, /path: 'reports'/);
  assert.match(routes, /path: 'alerts'/);
  assert.match(menu, /key: 'inventory'/);
  assert.match(menu, /key: 'reports'/);
  assert.match(menu, /key: 'alerts'/);
  assert.match(routes, /const InventoryPage = lazy/);
  assert.match(routes, /const ReportsPage = lazy/);
  assert.match(routes, /const AlertsPage = lazy/);
});

test('manual tutorial flow: feature files then locale, menu, and route wiring', () => {
  const dir = setupFixture();

  execSync(
    `node --input-type=module -e "
import { parseName, buildTemplates, writeManualFeatureFiles, wireManualFeatureNavigation } from './scripts/generate-feature.mjs';
const meta = parseName('inventory');
const labels = { labelEn: 'Inventory', labelId: 'Inventaris' };
const templates = buildTemplates(meta, labels, 'full');
writeManualFeatureFiles(meta, templates);
wireManualFeatureNavigation(meta, templates);
"`,
    { cwd: dir, stdio: 'pipe' },
  );

  const pagePath = path.join(dir, 'src/features/inventory/pages/InventoryPage.tsx');
  const hookPath = path.join(dir, 'src/features/inventory/hooks/useInventoryPage.ts');
  const usecasePath = path.join(dir, 'src/features/inventory/usecase/inventoryUsecase.ts');
  const routesPath = path.join(dir, 'src/router/featureRoutes.tsx');
  const menuPath = path.join(dir, 'src/layouts/sidebar/featureMenuItems.tsx');
  const enLocalePath = path.join(dir, 'src/locales/en.json');
  const idLocalePath = path.join(dir, 'src/locales/id.json');

  assert.equal(fs.existsSync(pagePath), true);
  assert.equal(fs.existsSync(hookPath), true);
  assert.equal(fs.existsSync(usecasePath), true);

  const routes = fs.readFileSync(routesPath, 'utf8');
  const menu = fs.readFileSync(menuPath, 'utf8');
  const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf8'));
  const idLocale = JSON.parse(fs.readFileSync(idLocalePath, 'utf8'));

  assert.equal(routes.includes('{{'), false);
  assert.equal(menu.includes('{{'), false);
  assert.match(routes, /path: 'inventory'/);
  assert.match(routes, /features\/inventory\/pages\/InventoryPage/);
  assert.match(menu, /key: 'inventory'/);
  assert.match(menu, /path: '\/inventory'/);
  assert.equal(enLocale.nav.inventory, 'Inventory');
  assert.equal(idLocale.nav.inventory, 'Inventaris');
  assert.match(enLocale.inventory.subtitle, /Manage inventory/i);
  assert.match(idLocale.inventory.subtitle, /Kelola inventaris/i);
});
