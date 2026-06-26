# Architecture & Developer Documentation

**Choose language / Pilih Bahasa:**

- English (this document)
- [Bahasa Indonesia](./DOCUMENTATION.id.md)

> Documentation to help you build — clearer and more detailed than [README.md](./README.md). Covers bootstrap flow, providers, components, hooks, API wiring, and step-by-step page creation.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Live Links & External Resources](#2-live-links--external-resources)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Clone & Install (Step by Step)](#4-clone--install-step-by-step)
5. [Application Bootstrap](#5-application-bootstrap)
6. [Provider Hierarchy](#6-provider-hierarchy)
7. [Routing Architecture](#7-routing-architecture)
8. [Project Structure](#8-project-structure)
9. [Feature Module Pattern](#9-feature-module-pattern)
10. [Reusable Component Library](#10-reusable-component-library)
11. [Hooks](#11-hooks)
12. [Data Layer & API Implementation](#12-data-layer--api-implementation)
13. [i18n & Theming](#13-i18n--theming)
14. [Create a New Page — Shortcut (`make feature`)](#14-create-a-new-page--shortcut-make-feature)
15. [Create a New Page — Manual Walkthrough](#15-create-a-new-page--manual-walkthrough)
16. [Scaffolding Your Own App (`make generate`)](#16-scaffolding-your-own-app-make-generate)
17. [Deployment](#17-deployment)
18. [Makefile Reference](#18-makefile-reference)

---

## 1. Project Overview

This repository is a **production-ready React dashboard starter** built with **Vite**, **TypeScript**, **Tailwind CSS**, and **Clean Layered Architecture**.

The app is organized into clear layers so UI, business logic, and network code stay separated:

```
Presentation   → pages, layouts, shared components
Application    → hooks, usecases, React context
Domain         → model types, mappers, payloads
Infrastructure → Axios, localStorage, config, router
```

**Data flow (end to end):**

```
Page → Hook → Usecase → Repository / apiSource → Axios (backendService)
                              ↓
                         model.map.ts (snake_case API → camelCase UI)
```

**Dependency rules:**

| Layer | May import |
|-------|------------|
| Presentation (`pages`, `components`, `layouts`) | Application, Domain, Infrastructure |
| Application (`hooks`, `usecase`, `context`) | Domain, Infrastructure |
| Domain (`models/`) | Nothing from Presentation or Application |

**Demo login (development mock):** `admin@mail.com` / `password123`

---

## 2. Live Links & External Resources

URLs are centralized in `src/config/external-links.json`:

| Key | URL | Purpose |
|-----|-----|---------|
| `templateRepoUrl` | [github.com/KutuGondrong/react-dashboard-template-01](https://github.com/KutuGondrong/react-dashboard-template-01.git) | Git clone URL for end users |
| `readmeUrl` | GitHub README | Short project overview |
| `tutorialUrl` | [template.teristimewa.com/.../tutorial/document](https://template.teristimewa.com/react-dashboard-template-01/tutorial/document) | Published tutorial |
| `componentsUrl` | [template.teristimewa.com/.../components](https://template.teristimewa.com/react-dashboard-template-01/components) | Published component catalog |

**Live template preview:** [https://template.teristimewa.com/react-dashboard-template-01](https://template.teristimewa.com/react-dashboard-template-01)

### Sidebar menu (end-user navigation)

When you run `pnpm run dev`, the protected area shows these main menu items:

| Menu key | Route | Feature |
|----------|-------|---------|
| Dashboard | `/dashboard` | Stats cards, charts |
| Users | `/users` | Paginated user table |
| Settings | `/settings` | App preferences |
| Tutorial *(DEV)* | `/tutorial` | Landing page → links to `tutorialUrl` |
| Components *(DEV)* | `/components` | Landing page → links to `componentsUrl` |

In development (`pnpm run dev`), **Tutorial** and **Components** show a DEV badge and open landing pages with buttons to the published docs above. Production builds (`pnpm run build`) strip these routes. Hide them during dev with `VITE_SHOW_DEV_FEATURES=false` in `.env`.

---

## 3. Tech Stack & Dependencies

Pinned via [Volta](https://volta.sh) in `package.json`:

| Tool | Version |
|------|---------|
| Node.js | `20.11.0` |
| pnpm | `8.15.4` |

### Runtime dependencies

| Package | Version | Role |
|---------|---------|------|
| `react` + `react-dom` | 18.3.1 | UI rendering |
| `react-router-dom` | 6.28.0 | Client-side routing, lazy routes |
| `axios` | 1.7.9 | HTTP client (via `backendService`) |

### Dev dependencies

| Package | Version | Role |
|---------|---------|------|
| `typescript` | 5.7.2 | Static typing |
| `vite` | 5.4.11 | Dev server & production bundler |
| `@vitejs/plugin-react` | 4.3.4 | React Fast Refresh |
| `tailwindcss` | 3.4.16 | Utility-first CSS |
| `postcss` + `autoprefixer` | — | CSS pipeline |
| `eslint` + plugins | — | Linting |
| `prettier` + `prettier-plugin-tailwindcss` | — | Formatting |

**Path alias:** `@/*` → `src/*` (configured in `tsconfig.json` and `vite.config.ts`).

---

## 4. Clone & Install (Step by Step)

### Step 1 — Install prerequisites

| Tool | Required | Notes |
|------|----------|-------|
| Git | Recommended | Clone the repository |
| Node.js 20.x | Yes | `20.11.0` recommended |
| pnpm 8.x | Yes* | `8.15.4` recommended; npm works as fallback |
| GNU Make | Optional | Shortcuts: `make dev`, `make feature`, etc. |

Install Volta (recommended for version pinning):

```bash
# macOS
brew install volta

# Linux / macOS (curl)
curl https://get.volta.sh | bash

# Windows
winget install Volta.Volta
```

Pin versions inside the project:

```bash
volta pin node@20.11.0
volta pin pnpm@8.15.4
node --version   # v20.11.0
pnpm --version   # 8.15.4
```

### Step 2 — Clone the template repository

```bash
git clone https://github.com/KutuGondrong/react-dashboard-template-01.git react-app
cd react-app
```

### Step 3 — Install dependencies

```bash
pnpm install
```

This resolves `pnpm-lock.yaml` and installs all packages listed in `package.json`.

### Step 4 — Start the development server

```bash
pnpm run dev
# or
make dev
```

Open [http://localhost:5173](http://localhost:5173). Log in with `admin@mail.com` / `password123`.

### Step 5 — Verify tooling

```bash
pnpm run lint    # ESLint + tsc --noEmit (must be zero errors)
pnpm run format  # Prettier + ESLint auto-fix
pnpm run build   # Type-check → production bundle in dist/
```

### Step 6 — Environment variables (optional)

Create `.env` or `.env.local` at the project root:

```bash
# Backend API base URL (default: /api)
VITE_API_BASE_URL=http://localhost:3000/api

# Subpath deployment (default: /)
VITE_BASE_PATH=/

# Show Tutorial & Storybook routes (default: true in dev)
VITE_SHOW_DEV_FEATURES=true
```

`app.config.ts` reads `VITE_API_BASE_URL` via `import.meta.env`.

---

## 5. Application Bootstrap

The React tree is mounted in two files:

### `src/main.tsx` — entry point

```tsx
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Loads global styles (`index.css`) and renders `<App />` inside React 18 `StrictMode`.

### `src/App.tsx` — global providers + router

```tsx
export function App() {
  return (
    <ErrorBoundary>
      <LocaleProvider>
        <ThemeProvider>
          <ToastProvider>
            <ModalProvider>
              <RouterProvider router={appRouter} />
            </ModalProvider>
          </ToastProvider>
        </ThemeProvider>
      </LocaleProvider>
    </ErrorBoundary>
  );
}
```

**Order matters:** `LocaleProvider` wraps everything so error screens and toasts can be translated. `ThemeProvider` applies `dark` class on `<html>`. `ToastProvider` and `ModalProvider` expose imperative UI APIs. `RouterProvider` renders the matched route.

`AuthProvider` is **not** in `App.tsx` — it lives inside `AuthShell` (see [Routing](#7-routing-architecture)) so it can use `useNavigate()` for 401 redirects.

---

## 6. Provider Hierarchy

Full provider tree from root to page:

```
ErrorBoundary
└── LocaleProvider          ← i18n (en / id)
    └── ThemeProvider       ← light / dark / system
        └── ToastProvider   ← global toast queue
            └── ModalProvider ← imperative modals
                └── RouterProvider
                    └── AuthShell
                        └── AuthProvider    ← session, login, logout
                            └── ProtectedRoute / PublicRoute
                                └── MainLayout / AuthLayout
                                    └── ScrollProvider (MainLayout only)
                                        └── <Outlet /> → Page
```

### Provider reference

| Provider | File | Hook | Responsibility |
|----------|------|------|----------------|
| `ErrorBoundary` | `components/ErrorBoundary/` | — | Catches render errors; localized recovery UI |
| `LocaleProvider` | `context/LocaleContext.tsx` | `useLocale()` | `t(key, params)`, `locale`, `setLocale` |
| `ThemeProvider` | `context/ThemeContext.tsx` | `useTheme()` | `mode`, `resolvedTheme`, `setMode`, `toggleTheme` |
| `ToastProvider` | `components/Toast/` | `useToast()` | Show success/error/info toasts |
| `ModalProvider` | `components/Modal/` | `useModal()` | Open/close confirmation dialogs |
| `AuthProvider` | `context/AuthContext.tsx` | `useAuth()` | `user`, `token`, `login`, `logout`, `isAuthenticated` |
| `ScrollProvider` | `context/ScrollContext.tsx` | `useScrollContext()` | Scroll-to-top on route change |

### `useLocale()` example

```tsx
import { useLocale } from '@/context/LocaleContext';

const { t, locale, setLocale } = useLocale();
t('users.title');
t('users.deleteMessage', { name: 'John Doe' });
setLocale('id');
```

### `useAuth()` example

```tsx
import { useAuth } from '@/context/AuthContext';

const { user, isAuthenticated, login, logout, isLoading } = useAuth();
await login({ email: 'admin@mail.com', password: 'password123' });
```

### `useTheme()` example

```tsx
import { useTheme } from '@/context/ThemeContext';

const { mode, resolvedTheme, setMode, toggleTheme } = useTheme();
setMode('dark');   // 'light' | 'dark' | 'system'
```

### `useToast()` / `useModal()` example

```tsx
import { useToast } from '@/components/Toast';
import { useModal } from '@/components/Modal';

const toast = useToast();
toast.success('Saved successfully');

const modal = useModal();
modal.confirm({
  title: 'Delete user?',
  onConfirm: () => { /* ... */ },
});
```

---

## 7. Routing Architecture

Routes are defined in `src/router/AppRouter.tsx` using `createBrowserRouter`.

### Layout structure

```
/  (ProtectedRoute + MainLayout)
├── /dashboard
├── /users
├── /settings
├── /tutorial              (dev only — landing → external docs)
└── /components            (dev only — landing → external catalog)

/  (PublicRoute + AuthLayout)
├── /login
└── /register

* → redirect to /dashboard
```

### Route guards

| Guard | File | Behavior |
|-------|------|----------|
| `ProtectedRoute` | `router/RouteGuards.tsx` | Requires valid token; redirects to `/login` |
| `PublicRoute` | `router/RouteGuards.tsx` | Guest only; redirects to `/dashboard` if logged in |

### Code splitting

Every page is loaded with `React.lazy()` and wrapped in `<Suspense fallback={<SkeletonLoader />}>`:

```tsx
const UsersPage = lazy(() => import('@/features/users/pages/UsersPage'));

{
  path: 'users',
  element: (
    <LazyPage>
      <UsersPage />
    </LazyPage>
  ),
}
```

### `MainLayout` vs `AuthLayout`

- **`MainLayout`** — sidebar, header, footer, scroll container. Renders child routes via `<Outlet />`.
- **`AuthLayout`** — centered card for login/register forms.

### Basename (subpath deploy)

`routerBasename` comes from `src/config/basePath.ts` (reads `import.meta.env.BASE_URL`). Set `VITE_BASE_PATH` when the app is served under a subpath (see [Deployment](#17-deployment)).

---

## 8. Project Structure

```
react-app/
├── public/                    # Static assets (logos, favicon)
├── scripts/
│   ├── generate-app.mjs       # make generate
│   └── generate-feature.mjs   # make feature
├── src/
│   ├── main.tsx               # React entry
│   ├── App.tsx                # Root providers + router
│   ├── index.css              # Tailwind directives + global styles
│   │
│   ├── config/
│   │   ├── app.config.ts      # Title, API URL, locale defaults, pagination
│   │   ├── basePath.ts        # Asset URL helper, router basename
│   │   ├── color.tokens.ts    # Design tokens (use with Tailwind)
│   │   ├── devFeatures.ts     # Tutorial / Storybook toggle
│   │   └── external-links.json
│   │
│   ├── context/               # Global React context providers
│   │   ├── AuthContext.tsx
│   │   ├── LocaleContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ScrollContext.tsx
│   │
│   ├── router/
│   │   ├── AppRouter.tsx      # Route definitions
│   │   ├── RouteGuards.tsx    # Protected / Public guards
│   │   └── AuthShell.tsx      # AuthProvider wrapper
│   │
│   ├── locales/
│   │   ├── en.json            # English UI strings
│   │   ├── id.json            # Indonesian UI strings
│   │   ├── messages.ts        # Bundled locale imports
│   │   └── localeUtils.ts     # translateMessage(), {{param}} interpolation
│   │
│   ├── models/
│   │   ├── model.response.ts  # Raw API JSON shapes (snake_case)
│   │   ├── model.type.ts      # UI types (camelCase)
│   │   ├── model.map.ts       # API → UI mappers
│   │   └── model.payload.ts   # Partial update payloads
│   │
│   ├── datasource/
│   │   ├── local/
│   │   │   └── localSource.ts # localStorage (token, user, theme, locale)
│   │   └── network/
│   │       ├── services/backendService.ts  # Axios instance + interceptors
│   │       ├── apiSource.ts                # REST endpoint calls
│   │       └── apiRepository.ts            # Mock auth + business logic
│   │
│   ├── components/            # Reusable UI library (23+ components)
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── ComboBox/
│   │   ├── DataTable/
│   │   ├── Pagination/
│   │   ├── Modal/
│   │   ├── Drawer/
│   │   ├── Toast/
│   │   ├── Badge/
│   │   ├── Card/
│   │   ├── Avatar/
│   │   ├── Toggle/
│   │   ├── Typography/
│   │   ├── Chart/
│   │   ├── FileManagement/
│   │   ├── Layout/
│   │   ├── NavMenu/
│   │   ├── SkeletonLoader/
│   │   ├── ErrorBoundary/
│   │   ├── ScrollToTop/
│   │   ├── CodeBlock/
│   │   └── locales/           # Component default strings (en.json, id.json)
│   │
│   ├── layouts/
│   │   ├── main-layout/       # MainLayout shell
│   │   ├── header/            # Header, profile menu, theme toggle
│   │   ├── sidebar/           # Sidebar nav, icons, useSidebar hook
│   │   └── footer/
│   │
│   ├── features/              # Domain modules (one folder per feature)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── settings/
│   │   ├── tutorial/          # Dev landing → external tutorial URL
│   │   └── storybook/         # Dev landing → external components URL
│   │
│   └── utils/                 # Pure helpers (no React)
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── Makefile
```

### Standard feature folder layout

```
src/features/<name>/
├── pages/<Name>Page.tsx       # Route entry — layout + title only
├── components/                # Feature-specific UI (tables, forms)
├── hooks/use<Name>Page.ts     # State, fetch, pagination, handlers
└── usecase/<name>Usecase.ts   # Business logic → repository / apiSource
```

---

## 9. Feature Module Pattern

Each feature follows the same layered pattern. The **Users** feature that ships with this template is the reference example. To add your own page (e.g. Products), see [Section 14](#14-create-a-new-page--shortcut-make-feature) and [Section 15](#15-create-a-new-page--manual-walkthrough).

### Layer responsibilities

| File | Layer | Does |
|------|-------|------|
| `UsersPage.tsx` | Presentation | Page shell, title, composes `<UsersTable />` |
| `UsersTable.tsx` | Presentation | Columns, DataTable, Pagination |
| `useUsersPage.ts` | Application | `useState`, `useEffect`, calls usecase |
| `usersUsecase.ts` | Application | Async operations, delegates to repository |

### Example: `UsersPage.tsx`

```tsx
import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';
import { UsersTable } from '@/features/users/components/UsersTable';

export default function UsersPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={2}>{t('nav.users')}</Typography.Title>
        <Typography.Text color="muted" className="mt-1 block">
          {t('users.subtitle')}
        </Typography.Text>
      </div>
      <UsersTable />
    </div>
  );
}
```

**Rule:** Pages stay thin. No `axios`, no `localStorage`, no direct API calls in pages or table components.

---

## 10. Reusable Component Library

All shared UI lives in `src/components/`. Built with Tailwind CSS and design tokens from `src/config/color.tokens.ts`.

### Component catalog

| Component | Import | Typical use |
|-----------|--------|-------------|
| `Button` | `@/components/Button` | Actions, form submit |
| `Input` | `@/components/Input` | Text fields, validation rules |
| `ComboBox` | `@/components/ComboBox` | Searchable select |
| `DataTable` | `@/components/DataTable` | Sortable tables with loading state |
| `Pagination` | `@/components/Pagination` | Page navigation |
| `Modal` | `@/components/Modal` | Confirm dialogs (`useModal()`) |
| `Drawer` | `@/components/Drawer` | Side panels |
| `Toast` | `@/components/Toast` | Notifications (`useToast()`) |
| `Badge` | `@/components/Badge` | Status chips |
| `Card` | `@/components/Card` | Content containers |
| `Avatar` | `@/components/Avatar` | User avatars, user cards |
| `Toggle` | `@/components/Toggle` | Boolean switches |
| `Typography` | `@/components/Typography` | Title, Text, Paragraph |
| `Chart` | `@/components/Chart` | Bar, Line, Donut, MetricCard |
| `FileManagement` | `@/components/FileManagement` | Upload / download |
| `Layout` | `@/components/Layout` | Grid, Flex, Masonry, Splitter |
| `NavMenu` | `@/components/NavMenu` | Sidebar navigation tree |
| `SkeletonLoader` | `@/components/SkeletonLoader` | Loading placeholders |
| `ScrollToTop` | `@/components/ScrollToTop` | Scroll container + anchor |
| `CodeBlock` | `@/components/CodeBlock` | Syntax-highlighted code |
| `ErrorBoundary` | `@/components/ErrorBoundary` | Error recovery screen |

### Where to browse components

| When | URL |
|------|-----|
| **Development** (`pnpm run dev`) | Sidebar **Components** (DEV badge) → landing page with link to the catalog |
| **Component catalog (live)** | [https://template.teristimewa.com/react-dashboard-template-01/components](https://template.teristimewa.com/react-dashboard-template-01/components) |

The live catalog shows props, state matrix (default / loading / error / disabled), and copy-paste code samples for every shared component.

### Usage example — Button

```tsx
import { Button } from '@/components/Button';

<Button variant="primary" size="md" isLoading={saving} onClick={handleSave}>
  Save
</Button>
```

Variants: `primary` · `secondary` · `outline` · `ghost` · `danger`  
Sizes: `sm` · `md` · `lg`

### Usage example — DataTable + Pagination

```tsx
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';

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
```

### Component locale rule

Default text inside `src/components/` must use `t('components.common.*')` from `src/components/locales/en.json` and `id.json`. Feature-specific copy goes in `src/locales/`.

### Color tokens

Do not hardcode hex colors in components. Use tokens from `color.tokens.ts` and Tailwind classes defined in `tailwind.config.js`.

---

## 11. Hooks

Hooks are the **Application layer** bridge between UI and business logic.

### Types of hooks in this project

| Category | Location | Examples |
|----------|----------|----------|
| Context hooks | `context/`, `components/Toast`, `components/Modal` | `useAuth`, `useLocale`, `useTheme`, `useToast`, `useModal` |
| Feature hooks | `features/<name>/hooks/` | `useUsersPage`, `useProductsPage` |
| Layout hooks | `layouts/**/hooks/` | `useMainLayout`, `useSidebar` |
| Component hooks | `components/**/hooks/` | `useFileDownload` |

### Feature hook pattern — `useUsersPage`

A feature hook owns **UI state** and **data fetching**:

```tsx
export function useUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(appConfig.paginationDefaultPageSize);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await usersUsecase.getUsers(page, pageSize);
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, isLoading, page, setPage, pageSize, totalPages, totalItems, onPageSizeChange };
}
```

**Conventions:**

- `useState` + `useCallback` + `useEffect` for async lists
- Call **usecase**, never `axios` or `apiSource` directly from hooks
- Return a flat object consumed by the page/table component
- Export item types from the hook file when they are feature-specific

### `useUsersPage` — optimistic updates

The Users hook adds local state updates after delete/edit without re-fetching:

```tsx
const deleteUser = useCallback((userId: string) => {
  setUsers((prev) => prev.filter((user) => user.id !== userId));
  // ... adjust pagination totals
}, [pageSize]);
```

### Hook rules (do / don't)

| Do | Don't |
|----|-------|
| Call usecase from feature hooks | Call `axios` or `fetch` in hooks |
| Keep pages thin — delegate to hooks | Put business rules in components |
| Use context hooks for global state | Duplicate auth/locale logic per feature |
| Memoize callbacks passed to children | Create new inline functions on every render for heavy tables |

---

## 12. Data Layer & API Implementation

### Three network layers

```
backendService.ts   → Axios instance, base URL, Bearer token, 401 interceptor
apiSource.ts        → One function per REST endpoint (returns raw API JSON)
apiRepository.ts    → Business logic, validation, mock data, calls mappers
```

Feature usecases call `apiRepository` (or `apiSource` + mappers when wiring a real backend).

### Models — anti-corruption layer

| File | Format | Example field |
|------|--------|---------------|
| `model.response.ts` | snake_case (API) | `full_name`, `is_active` |
| `model.type.ts` | camelCase (UI) | `fullName`, `isActive` |
| `model.map.ts` | Transform functions | `toUser()`, `toPaginatedUsers()` |

```tsx
// model.response.ts
export interface ApiUserResponse {
  full_name: string;
  is_active: boolean;
}

// model.type.ts
export interface User {
  fullName: string;
  isActive: boolean;
}

// model.map.ts
export function toUser(api: ApiUserResponse): User {
  return { fullName: api.full_name, isActive: api.is_active, /* ... */ };
}
```

**Rule:** Components and hooks never see `snake_case` API fields.

### `backendService.ts` — Axios setup

```tsx
export const backendService = axios.create({
  baseURL: appConfig.apiBaseUrl,  // VITE_API_BASE_URL ?? '/api'
  timeout: 30000,
});

// Request interceptor: attach Bearer token from localSource
// Response interceptor: on 401 → clear auth → redirect to /login
```

### `apiSource.ts` — endpoint functions

```tsx
export const apiSource = {
  async getUsers(page: number, pageSize: number): Promise<ApiUserListResponse> {
    const response = await backendService.get('/users', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },
};
```

### `localSource.ts` — storage abstraction

Never use `localStorage` directly. Use `localSource`:

```tsx
localSource.getToken();
localSource.setUser(user);
localSource.getTheme();
localSource.setLocale('id');
localSource.clearAuth();
```

### Current state: mock vs real API

| Feature | Current data source |
|---------|---------------------|
| Auth (login/register) | Mock in `apiRepository.ts` (~800ms delay) |
| Users list | Mock in `apiRepository.ts` |
| Dashboard | Mock in `dashboardUsecase.ts` |
| New features you scaffold | Mock inline in `<name>Usecase.ts` (see [Section 15](#15-create-a-new-page--manual-walkthrough)) |

`apiSource.ts` already defines real endpoint shapes for when you connect a backend.

### How to wire a real API (example: Users)

The Users feature already has API types (`ApiUserResponse`), mappers (`toUser`, `toPaginatedUsers`), and `getUsers()` in `apiSource.ts`. When your backend is ready:

**Step 1 — Set environment variable**

```bash
# .env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Step 2 — Replace mock in `apiRepository.ts`**

```tsx
async getUsers(page: number, pageSize: number): Promise<PaginatedResult<User>> {
  const response = await apiSource.getUsers(page, pageSize);
  return toPaginatedUsers(response);
},
```

**Step 3 — No changes needed in usecase, hook, or page**

`useUsersPage` still calls `usersUsecase.getUsers()`. The UI layer is unaware of mock vs real.

For a **new page you create from scratch** (e.g. Products), add response types, mappers, and endpoints following [Section 15 — Step 11](#step-11--connect-real-api-when-backend-is-ready).

### Error handling

- `ValidationError` in `apiRepository.ts` for form field errors
- `isApiError()` helper in `apiSource.ts` for API error responses
- 401 responses trigger `AuthProvider` logout via `backendService` interceptor

---

## 13. i18n & Theming

### Locales

| File | Language |
|------|----------|
| `src/locales/en.json` | English |
| `src/locales/id.json` | Bahasa Indonesia |

Both files must share the **same key structure**. Parameter names in `{{param}}` must match across locales; word order can differ.

```json
// en.json
{ "users": { "deleteMessage": "Are you sure you want to delete {{name}}?" } }

// id.json
{ "users": { "deleteMessage": "{{name}} akan dihapus. Apakah Anda yakin?" } }
```

Default locale: `'en'` in `src/config/app.config.ts`.

### Theme

`ThemeProvider` supports `light`, `dark`, and `system`. Persists to localStorage via `localSource`. Toggle in header via `ThemeToggleButton`.

---

## 14. Create a New Page — Shortcut (`make feature`)

The fastest way to add a sidebar menu item, route, locale keys, icon, and feature folder:

```bash
make feature name=products label="Products" label-id="Produk"
```

### What `make feature` generates

| Scope | Files created | Mock data |
|-------|---------------|-----------|
| `full` *(default)* | page, table, hook, usecase | in `usecase/*.ts` |
| `hook` | page, table, hook | inline in hook |
| `page` | page only | none |

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `name` | Yes | Feature key → folder `src/features/products/`, route `/products`, locale `nav.products` |
| `label` | Recommended | English menu label |
| `label-id` | Recommended | Indonesian menu label |
| `scope` | No | `full` · `hook` · `page` |

### Examples

```bash
# Full stack (recommended)
make feature name=reports label="Reports" label-id="Laporan"

# Hook only (mock data in hook)
make feature name=inventory scope=hook label="Inventory" label-id="Inventaris"

# Page shell only (you add hook + API manually)
make feature name=analytics scope=page label="Analytics" label-id="Analitik"
```

### Files touched automatically

1. `src/features/<name>/pages/<Name>Page.tsx`
2. `src/features/<name>/components/<Name>Table.tsx` *(full / hook)*
3. `src/features/<name>/hooks/use<Name>Page.ts` *(full / hook)*
4. `src/features/<name>/usecase/<name>Usecase.ts` *(full only)*
5. `src/router/AppRouter.tsx` — lazy route
6. `src/layouts/sidebar/hooks/useSidebar.tsx` — menu item
7. `src/layouts/sidebar/components/SidebarIcons.tsx` — icon component
8. `src/locales/en.json` + `id.json` — `nav.*` and `<name>.subtitle`

After scaffolding, run `pnpm run dev` and open `/<name>`.

---

## 15. Create a New Page — Manual Walkthrough

Use this when you need full control or want to understand what `make feature` does under the hood. We will create a **Products** page from scratch through to a working API.

### Step 1 — Create feature folder structure

```
src/features/products/
├── pages/ProductsPage.tsx
├── components/ProductsTable.tsx
├── hooks/useProductsPage.ts
└── usecase/productsUsecase.ts
```

### Step 2 — Add locale keys

```json
// src/locales/en.json — under "nav"
"products": "Products"

// new section
"products": {
  "subtitle": "Manage your product catalog"
}
```

```json
// src/locales/id.json — under "nav"
"products": "Produk"

"products": {
  "subtitle": "Kelola katalog produk Anda"
}
```

### Step 3 — Create the page

```tsx
// src/features/products/pages/ProductsPage.tsx
import { useLocale } from '@/context/LocaleContext';
import { Typography } from '@/components/Typography';
import { ProductsTable } from '@/features/products/components/ProductsTable';

export default function ProductsPage() {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <Typography.Title level={2}>{t('nav.products')}</Typography.Title>
      <Typography.Text color="muted" className="mt-1 block">
        {t('products.subtitle')}
      </Typography.Text>
      <ProductsTable />
    </div>
  );
}
```

### Step 4 — Create the hook

```tsx
// src/features/products/hooks/useProductsPage.ts
import { useCallback, useEffect, useState } from 'react';
import { appConfig } from '@/config/app.config';
import { productsUsecase } from '@/features/products/usecase/productsUsecase';

export interface ProductItem {
  id: string;
  name: string;
  isActive: boolean;
}

export function useProductsPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(appConfig.paginationDefaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await productsUsecase.getItems(page, pageSize);
      setItems(result.data);
      setTotalPages(result.totalPages);
      setTotalItems(result.total);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return {
    items, isLoading, page,
    setPage: (p: number) => setPage(p),
    pageSize, totalPages, totalItems,
    onPageSizeChange: (size: number) => { setPageSize(size); setPage(1); },
  };
}
```

### Step 5 — Create the usecase (mock first)

```tsx
// src/features/products/usecase/productsUsecase.ts
import type { PaginatedResult } from '@/models/model.type';
import type { ProductItem } from '@/features/products/hooks/useProductsPage';

const MOCK_ITEMS: ProductItem[] = [
  { id: 'prd_001', name: 'Product A', isActive: true },
  { id: 'prd_002', name: 'Product B', isActive: false },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const productsUsecase = {
  async getItems(page: number, pageSize: number): Promise<PaginatedResult<ProductItem>> {
    await delay(500);
    const start = (page - 1) * pageSize;
    return {
      data: MOCK_ITEMS.slice(start, start + pageSize),
      total: MOCK_ITEMS.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(MOCK_ITEMS.length / pageSize)),
    };
  },
};
```

### Step 6 — Create the table component

```tsx
// src/features/products/components/ProductsTable.tsx
import { useMemo } from 'react';
import { useLocale } from '@/context/LocaleContext';
import type { TableColumn } from '@/models/model.type';
import type { ProductItem } from '@/features/products/hooks/useProductsPage';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/Badge';
import { useProductsPage } from '@/features/products/hooks/useProductsPage';

export function ProductsTable() {
  const { t } = useLocale();
  const { items, isLoading, page, setPage, pageSize, totalPages, totalItems, onPageSizeChange } =
    useProductsPage();

  const columns = useMemo<TableColumn<ProductItem>[]>(
    () => [
      { key: 'name', header: t('components.common.name'), sortable: true },
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
```

### Step 7 — Register the route

```tsx
// src/router/AppRouter.tsx
const ProductsPage = lazy(() => import('@/features/products/pages/ProductsPage'));

// inside protectedChildren:
{
  path: 'products',
  element: (
    <LazyPage>
      <ProductsPage />
    </LazyPage>
  ),
},
```

### Step 8 — Add sidebar menu item

```tsx
// src/layouts/sidebar/hooks/useSidebar.tsx
import { ProductsIcon } from '@/layouts/sidebar/components/SidebarIcons';

// inside menuItems array:
{
  key: 'products',
  label: t('nav.products'),
  path: '/products',
  icon: <ProductsIcon />,
},
```

### Step 9 — Add sidebar icon

```tsx
// src/layouts/sidebar/components/SidebarIcons.tsx
export function ProductsIcon() {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
```

### Step 10 — Verify in browser

```bash
pnpm run dev
```

Navigate to `/products`. You should see the table with mock data and working pagination.

### Step 11 — Connect real API (when backend is ready)

Follow [Section 12](#12-data-layer--api-implementation):

1. Add `ApiProductResponse` to `model.response.ts`
2. Add `toProductItem` / `toPaginatedProducts` to `model.map.ts`
3. Add `getProducts()` to `apiSource.ts`
4. Replace mock in `productsUsecase.ts` with `apiSource` + mapper

The hook and page require **no changes**.

---

## 16. Scaffolding Your Own App (`make generate`)

Use the template once to bootstrap a **separate** project folder (outside this repo):

```bash
make generate name=my-new-app
make generate name=my-new-app out=~/projects/my-new-app
```

| What happens | Detail |
|--------------|--------|
| Output | New folder with a full copy of this template |
| `package.json` | `name` updated to your app name |
| Git | `git init` in the output folder |
| Config | `app.config.ts` title/description copied as-is — customize after generate |

**FileDownload demo files:** `public/samples/` (`report.pdf`, `data.csv`, `readme.txt`) is included so mock download works out of the box.

After generate, `cd` into the new folder, run `pnpm install`, then `make dev`.

---

## 17. Deployment

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `/api` | Backend API base URL |
| `VITE_BASE_PATH` | `/` | Base path when served under a subpath (e.g. `/my-app/`) |
| `VITE_SHOW_DEV_FEATURES` | `true` (dev) | Show Tutorial & Components landing routes in dev |

**Subpath hosting:** Set `VITE_BASE_PATH` to match your hosting path before `pnpm run build`. The build output in `dist/` must be served with SPA fallback so deep links (e.g. `/dashboard`) resolve to `index.html`. Configure fallback in your web server (nginx, Apache, S3 + CloudFront, etc.) according to your host's documentation.

**Production build:**

```bash
pnpm run build    # or make build
pnpm run preview  # optional local check of dist/
```

---

## 18. Makefile Reference

| Command | Description |
|---------|-------------|
| `make dev` | Start Vite dev server |
| `make format` | Prettier + ESLint auto-fix |
| `make lint` | ESLint + TypeScript check |
| `make build` | Format → type-check → production build |
| `make preview` | Serve `dist/` locally |
| `make clean` | Remove `dist/`, `.turbo`, `node_modules/.vite` |
| `make feature name=X label="Name" label-id="Nama"` | Scaffold menu + page |
| `make generate name=my-app` | Scaffold micro-app outside this repo |

---

## Further Reading

- [README.md](./README.md) — concise overview (English)
- [DOCUMENTATION.id.md](./DOCUMENTATION.id.md) — this document in Bahasa Indonesia
- [README.id.md](./README.id.md) — concise overview (Bahasa Indonesia)
- [Component catalog (live)](https://template.teristimewa.com/react-dashboard-template-01/components)
- [Tutorial (live)](https://template.teristimewa.com/react-dashboard-template-01/tutorial/document)
