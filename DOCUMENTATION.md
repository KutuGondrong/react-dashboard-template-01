# Architecture Documentation

## Overview

This project is a **React dashboard template**. **Clone it from GitHub first**, then run `make generate` to scaffold your own app, and customize features, locales, and API integration.

The clone URL is configured in `src/config/external-links.json` (`templateRepoUrl`).

```bash
git clone <templateRepoUrl>
cd react-app-template   # folder name from the URL
pnpm install
make dev
```

```
src/
├── config/          # App-wide constants
├── context/         # Global React providers
├── router/          # Route definitions and guards
├── locales/         # i18n JSON files (en, id)
├── models/          # API ↔ UI type separation
├── datasource/      # Network + local storage
├── components/      # Reusable UI library
├── layouts/         # Shell wireframes
└── features/        # Domain-specific modules
```

## Tutorial & Components (development only)

Full documentation and the component catalog are hosted on the template publisher's site, not inside this repo.

In development (`make dev`), sidebar shows **Tutorial** and **Components** with a DEV badge. Each opens a landing page with a button that takes you to the published docs. Production builds (`make build`) remove these routes entirely.

To hide Tutorial & Components while running `make dev`, set `VITE_SHOW_DEV_FEATURES=false` in `.env` or `.env.development`.

## Routing

Routes are centralized in `src/router/AppRouter.tsx` using `createBrowserRouter`.

- **ProtectedRoute**: Redirects unauthenticated users to `/login`.
- **PublicRoute**: Redirects authenticated users away from `/login` and `/register`.
- All pages use `React.lazy()` with a global `<Suspense>` fallback.

## Scaffolding Your App

```bash
make generate name=my-new-app
# creates ../my-new-app (outside this repo)

make generate name=my-new-app out=~/projects/my-new-app
```

Updates `package.json` name and `app.config.ts` title, then runs `git init` in the output folder.

## Scaffold a Feature

```bash
make feature name=orders label="Orders" label-id="Pesanan"
make feature name=reports scope=hook label="Reports" label-id="Laporan"
make feature name=inventory scope=page label="Inventory" label-id="Inventaris"
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `name` | Yes | Feature key: folder (`src/features/orders/`), route (`/orders`), locale key (`nav.orders`). Use lowercase kebab-case. |
| `label` | Recommended | **English** sidebar label in `src/locales/en.json` (`nav.*`). |
| `label-id` | Recommended | **Indonesian** sidebar label in `src/locales/id.json` (`nav.*`). Falls back to `label` if omitted. |
| `scope` | No | `full` (default), `hook`, or `page`. See table below. |

**Example:** `label="Orders"` and `label-id="Pesanan"` shows **Orders** in EN and **Pesanan** in ID.

### Scope

| Scope | Generated files |
|-------|-----------------|
| `full` | page, table, hook, usecase |
| `hook` | page, table, hook |
| `page` | page only |

## Makefile

```
make dev       → Vite dev server (Tutorial & Components visible with DEV badge)
make build     → format + type-check + production build (dev routes stripped)
make generate  → scaffold a new app folder
make feature   → add menu + page scaffold
```

## Localization

Add UI strings in `src/locales/en.json` and `id.json` (same key structure in both files). Use `useLocale()` with `t('key', params?)`. Use `{{param}}` placeholders in JSON for dynamic values. Set `defaultLocale` in `src/config/app.config.ts`.

## Path Aliases

`@/*` resolves to `src/*` in both `tsconfig.json` and `vite.config.ts`.
