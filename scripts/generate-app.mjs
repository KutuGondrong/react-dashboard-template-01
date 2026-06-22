#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function expandHome(input) {
  if (input.startsWith('~/')) {
    return path.join(os.homedir(), input.slice(2));
  }
  return input;
}

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (arg.startsWith('--name=')) args.name = arg.slice('--name='.length);
    if (arg.startsWith('--out=')) args.out = expandHome(arg.slice('--out='.length));
  }
  return args;
}

function resolveOutputDir(name, outRaw) {
  const target = outRaw ? path.resolve(outRaw) : path.resolve(ROOT, '..', name);
  const rootResolved = path.resolve(ROOT);

  if (target === rootResolved || target.startsWith(`${rootResolved}${path.sep}`)) {
    throw new Error(
      `Output must be outside the boilerplate folder. Got: ${target}\n` +
        'Use a sibling folder (default) or pass --out=/path/to/my-app',
    );
  }

  if (fs.existsSync(target)) {
    throw new Error(`Output already exists: ${target}`);
  }

  return target;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.name?.trim()) {
    console.error('Usage: node scripts/generate-app.mjs --name=<app-name> [--out=<path>]');
    console.error('');
    console.error('Default output: ../<app-name> (sibling folder, outside boilerplate)');
    console.error('Example: node scripts/generate-app.mjs --name=my-new-app --out=~/projects/my-new-app');
    process.exit(1);
  }

  const name = args.name.trim();
  let outputDir;

  try {
    outputDir = resolveOutputDir(name, args.out);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const excludes = ['node_modules', 'dist', '.git', 'generate', '.pnpm-store'].map(
    (item) => `--exclude=${item}`,
  );

  execSync(
    ['rsync', '-a', ...excludes, `${ROOT}/`, `${outputDir}/`].join(' '),
    { stdio: 'inherit', shell: true },
  );

  const gitDir = path.join(outputDir, '.git');
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }

  const pkgPath = path.join(outputDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = name;
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const cfgPath = path.join(outputDir, 'src/config/app.config.ts');
  let cfg = fs.readFileSync(cfgPath, 'utf8');
  cfg = cfg.replace(/title: '[^']*'/, `title: '${name}'`);
  cfg = cfg.replace(
    /description: \{[\s\S]*?\},/,
    `description: {\n    en: '',\n    id: '',\n  },`,
  );
  cfg = cfg.replace(/isBoilerplate: true/, 'isBoilerplate: false');
  cfg = cfg.replace(/enableDevFeaturesInProduction: true/, 'enableDevFeaturesInProduction: false');
  fs.writeFileSync(cfgPath, cfg);

  const envCopyPath = path.join(ROOT, '.env.production.copy');
  if (!fs.existsSync(envCopyPath)) {
    throw new Error('.env.production.copy not found — required for another-user output');
  }
  fs.copyFileSync(envCopyPath, path.join(outputDir, '.env.production'));

  execSync('git init -q', { cwd: outputDir, stdio: 'inherit' });

  console.log(`\n✓ Generated micro-app at ${outputDir}\n`);
  console.log('Next steps:');
  console.log(`  cd ${outputDir}`);
  console.log('  pnpm install');
  console.log('  make dev    # or: pnpm dev\n');
}

main();
