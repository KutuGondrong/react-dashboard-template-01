# Dokumentasi Arsitektur & Pengembang

**Production-ready React dashboard starter** dengan Vite, TypeScript, Tailwind CSS, dan **Clean Layered Architecture**.

**Live template preview:** [https://template.teristimewa.com/react-dashboard-template-01](https://template.teristimewa.com/react-dashboard-template-01)

Choose Language / Pilih Bahasa:

- [English](./DOCUMENTATION.md)
- Bahasa Indonesia (dokumen ini)

> Dokumentasi untuk membantu pengembangan, lebih jelas dan mendalam daripada [README.id.md](./README.id.md). Mencakup alur bootstrap, provider, komponen, hooks, integrasi API, dan panduan membuat halaman baru langkah demi langkah.

---

## Daftar Isi

1. [Gambaran Proyek](#id-1-gambaran-proyek)
2. [Tautan Live & Sumber Daya Eksternal](#id-2-tautan-live--sumber-daya-eksternal)
3. [Tech Stack & Dependensi](#id-3-tech-stack--dependensi)
4. [Clone & Instalasi (Langkah demi Langkah)](#id-4-clone--instalasi-langkah-demi-langkah)
5. [Bootstrap Aplikasi](#id-5-bootstrap-aplikasi)
6. [Hierarki Provider](#id-6-hierarki-provider)
7. [Arsitektur Routing](#id-7-arsitektur-routing)
8. [Struktur Proyek](#id-8-struktur-proyek)
9. [Pola Modul Fitur](#id-9-pola-modul-fitur)
10. [Pustaka Komponen Reusable](#id-10-pustaka-komponen-reusable)
11. [Hooks](#id-11-hooks)
12. [Lapisan Data & Implementasi API](#id-12-lapisan-data--implementasi-api)
13. [i18n & Tema](#id-13-i18n--tema)
14. [Buat Halaman Baru: Shortcut (`make feature`)](#id-14-buat-halaman-baru--shortcut-make-feature)
15. [Buat Halaman Baru: Manual](#id-15-buat-halaman-baru--manual)
16. [Scaffold Aplikasi Sendiri (`make generate`)](#id-16-scaffold-aplikikasi-sendiri-make-generate)
17. [Deployment](#id-17-deployment)
18. [Referensi Makefile](#id-18-referensi-makefile)

---

<a id="id-1-gambaran-proyek"></a>

## 1. Gambaran Proyek

Repositori ini adalah **starter dashboard React siap produksi** dengan **Vite**, **TypeScript**, **Tailwind CSS**, dan **Clean Layered Architecture**.

Aplikasi dibagi ke lapisan yang jelas agar UI, logika bisnis, dan kode jaringan tetap terpisah:

```
Presentation   → halaman, layout, komponen bersama
Application    → hooks, usecase, React context
Domain         → tipe model, mapper, payload
Infrastructure → Axios, localStorage, config, router
```

**Alur data (ujung ke ujung):**

```
Page → Hook → Usecase → Repository / apiSource → Axios (backendService)
                              ↓
                         model.map.ts (snake_case API → camelCase UI)
```

**Aturan dependensi:**

| Lapisan      | Boleh mengimpor                                |
| ------------ | ---------------------------------------------- |
| Presentation | Application, Domain, Infrastructure            |
| Application  | Domain, Infrastructure                         |
| Domain       | Tidak boleh dari Presentation atau Application |

**Login demo (mock development):** `admin@mail.com` / `password123`

---

<a id="id-2-tautan-live--sumber-daya-eksternal"></a>

## 2. Tautan Live & Sumber Daya Eksternal

URL dikelola di `src/config/external-links.json`:

| Key               | URL                                                                                                                                        | Fungsi                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| `templateRepoUrl` | [github.com/KutuGondrong/react-dashboard-template-01](https://github.com/KutuGondrong/react-dashboard-template-01.git)                     | URL clone Git untuk end user  |
| `readmeUrl`       | README GitHub                                                                                                                              | Ringkasan singkat proyek      |
| `tutorialUrl`     | [template.teristimewa.com/.../documentation/overview](https://template.teristimewa.com/react-dashboard-template-01/documentation/overview) | Dokumentasi terpublikasi      |
| `componentsUrl`   | [template.teristimewa.com/.../components](https://template.teristimewa.com/react-dashboard-template-01/components)                         | Katalog komponen terpublikasi |

**Preview template live:** [https://template.teristimewa.com/react-dashboard-template-01](https://template.teristimewa.com/react-dashboard-template-01)

### Menu sidebar (navigasi end user)

Saat menjalankan `pnpm run dev`, area terproteksi menampilkan menu utama:

| Key menu  | Route        | Fitur                      |
| --------- | ------------ | -------------------------- |
| Dashboard | `/dashboard` | Kartu statistik, chart     |
| Users     | `/users`     | Tabel user dengan paginasi |
| Settings  | `/settings`  | Preferensi aplikasi        |

Menu dev opsional _(badge DEV)_ saat `VITE_SHOW_DEV_FEATURES=true`:

| Key menu            | Route            | Fitur                                    |
| ------------------- | ---------------- | ---------------------------------------- |
| Dokumentasi _(DEV)_ | `/documentation` | Landing page → tautan ke `tutorialUrl`   |
| Components _(DEV)_  | `/components`    | Landing page → tautan ke `componentsUrl` |

Saat development (`pnpm run dev`), **Dokumentasi** dan **Components** membuka landing page dengan tombol ke dokumentasi terpublikasi di atas. Build produksi (`pnpm run build`) menghapus route ini.

**Sembunyikan saat dev:** set `VITE_SHOW_DEV_FEATURES=false` di `.env` atau `.env.development`.

**Hapus sepenuhnya:** hapus `...devLandingRoutes` dari `AppRouter.tsx` dan `buildDevLandingMenuItems` dari `useSidebar.tsx` (lihat komentar di `src/router/devLandingRoutes.tsx`).

---

<a id="id-3-tech-stack--dependensi"></a>

## 3. Tech Stack & Dependensi

Versi dipin via [Volta](https://volta.sh) di `package.json`:

| Tool    | Versi     |
| ------- | --------- |
| Node.js | `20.11.0` |
| pnpm    | `8.15.4`  |

### Dependensi runtime

| Paket                 | Versi  | Peran                              |
| --------------------- | ------ | ---------------------------------- |
| `react` + `react-dom` | 18.3.1 | Rendering UI                       |
| `react-router-dom`    | 6.28.0 | Routing client-side, lazy routes   |
| `axios`               | 1.7.9  | HTTP client (via `backendService`) |

### Dependensi dev

| Paket                 | Versi  | Peran                         |
| --------------------- | ------ | ----------------------------- |
| `typescript`          | 5.7.2  | Static typing                 |
| `vite`                | 5.4.11 | Dev server & bundler produksi |
| `tailwindcss`         | 3.4.16 | Utility-first CSS             |
| `eslint` + `prettier` | -      | Linting & formatting          |

**Path alias:** `@/*` → `src/*`

---

<a id="id-4-clone--instalasi-langkah-demi-langkah"></a>

## 4. Clone & Instalasi (Langkah demi Langkah)

### Langkah 1: Instal prasyarat

| Tool         | Wajib            | Catatan                              |
| ------------ | ---------------- | ------------------------------------ |
| Git          | Direkomendasikan | Clone repositori                     |
| Node.js 20.x | Ya               | `20.11.0` direkomendasikan           |
| pnpm 8.x     | Ya\*             | `8.15.4` direkomendasikan            |
| GNU Make     | Opsional         | Shortcut: `make dev`, `make feature` |

```bash
volta pin node@20.11.0
volta pin pnpm@8.15.4
```

### Langkah 2: Clone repositori template

```bash
git clone https://github.com/KutuGondrong/react-dashboard-template-01.git react-app
cd react-app
```

### Langkah 3: Instal dependensi

```bash
pnpm install
```

### Langkah 4: Jalankan dev server

```bash
pnpm run dev
# atau
make dev
```

Buka [http://localhost:5173](http://localhost:5173). Login: `admin@mail.com` / `password123`.

### Langkah 5: Verifikasi tooling

```bash
pnpm run lint
pnpm run format
pnpm run build
```

### Langkah 6: Variabel environment (opsional)

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_BASE_PATH=/
VITE_SHOW_DEV_FEATURES=true
```

---

<a id="id-5-bootstrap-aplikasi"></a>

## 5. Bootstrap Aplikasi

### `src/main.tsx`: titik masuk

Memuat `index.css` dan merender `<App />` di dalam `StrictMode`.

### `src/App.tsx`: provider global + router

```
ErrorBoundary
  → LocaleProvider
    → ThemeProvider
      → ToastProvider
        → ModalProvider
          → RouterProvider
```

`AuthProvider` berada di dalam `AuthShell` (bukan di `App.tsx`) agar bisa memakai `useNavigate()` untuk redirect 401.

---

<a id="id-6-hierarki-provider"></a>

## 6. Hierarki Provider

| Provider         | File                        | Hook                 | Tanggung jawab                 |
| ---------------- | --------------------------- | -------------------- | ------------------------------ |
| `ErrorBoundary`  | `components/ErrorBoundary/` | -                    | Tangkap error render           |
| `LocaleProvider` | `context/LocaleContext.tsx` | `useLocale()`        | Terjemahan `t()`, ganti bahasa |
| `ThemeProvider`  | `context/ThemeContext.tsx`  | `useTheme()`         | Mode light/dark/system         |
| `ToastProvider`  | `components/Toast/`         | `useToast()`         | Notifikasi toast               |
| `ModalProvider`  | `components/Modal/`         | `useModal()`         | Dialog konfirmasi              |
| `AuthProvider`   | `context/AuthContext.tsx`   | `useAuth()`          | Sesi, login, logout            |
| `ScrollProvider` | `context/ScrollContext.tsx` | `useScrollContext()` | Scroll-to-top saat ganti route |

Contoh:

```tsx
const { t } = useLocale();
const { user, login, logout } = useAuth();
const { mode, toggleTheme } = useTheme();
```

---

<a id="id-7-arsitektur-routing"></a>

## 7. Arsitektur Routing

Route didefinisikan di `src/router/AppRouter.tsx`.

| Registry     | File                        | Fungsi                                                                   |
| ------------ | --------------------------- | ------------------------------------------------------------------------ |
| Manual       | `featureRoutes.tsx`         | Route bawaan (dashboard, users, …) — edit manual                         |
| Generated    | `featureRoutesGenerate.tsx` | Route dari `make feature` — **jangan edit manual**                       |
| Dev landings | `devLandingRoutes.tsx`      | `/documentation` & `/components` → tautan eksternal publisher (opsional) |
| Core         | `AppRouter.tsx`             | Redirect index, spread registry, `settings` (paling akhir), 404          |

Urutan spread di `protectedChildren`: `...featureRoutes`, `...featureRoutesGenerate`, `...devLandingRoutes`.

| Guard            | Perilaku                                              |
| ---------------- | ----------------------------------------------------- |
| `ProtectedRoute` | Butuh token valid; redirect ke `/login`               |
| `PublicRoute`    | Hanya tamu; redirect ke `/dashboard` jika sudah login |

Setiap halaman memakai `React.lazy()` + `Suspense` dengan fallback `SkeletonLoader`.

Route `settings` tetap di `AppRouter.tsx` (paling akhir). Route tidak dikenal (`path: '*'`) menampilkan `NotFoundPage` (404).

- **`MainLayout`**: sidebar, header, footer, `<Outlet />` untuk halaman anak
- **`AuthLayout`**: kartu terpusat untuk login/register

---

<a id="id-8-struktur-proyek"></a>

## 8. Struktur Proyek

```
src/
├── config/          # Konfigurasi app, token warna, base path
├── context/         # Provider global (Auth, Locale, Theme, Scroll)
├── router/          # AppRouter, devLandingRoutes, featureRoutes(+Generate), guard
├── locales/         # en.json, id.json
├── models/          # Response API, tipe UI, mapper
├── datasource/      # network (Axios) + local (localStorage)
├── components/      # Pustaka UI reusable (23+ komponen)
├── layouts/         # MainLayout, AuthLayout, Header, Sidebar
├── features/        # Modul domain (auth, users, dashboard, …)
└── utils/           # Helper murni
```

### Layout folder fitur standar

```
src/features/<nama>/
├── pages/<Nama>Page.tsx
├── components/
├── hooks/use<Nama>Page.ts
└── usecase/<nama>Usecase.ts
```

---

<a id="id-9-pola-modul-fitur"></a>

## 9. Pola Modul Fitur

Fitur **Users** yang sudah ada di template ini menjadi contoh referensi. Untuk menambah halaman sendiri (mis. Products), lihat [Bagian 14](#id-14-buat-halaman-baru--shortcut-make-feature) dan [Bagian 15](#id-15-buat-halaman-baru--manual).

| File              | Lapisan      | Fungsi                                |
| ----------------- | ------------ | ------------------------------------- |
| `UsersPage.tsx`   | Presentation | Shell halaman, judul, komposisi tabel |
| `UsersTable.tsx`  | Presentation | Kolom, DataTable, Pagination          |
| `useUsersPage.ts` | Application  | State, fetch, paginasi                |
| `usersUsecase.ts` | Application  | Operasi async, delegasi ke repository |

**Aturan:** Halaman tetap tipis. Jangan panggil `axios`, `localStorage`, atau API langsung dari page/komponen.

---

<a id="id-10-pustaka-komponen-reusable"></a>

## 10. Pustaka Komponen Reusable

Semua UI bersama ada di `src/components/`. Dibangun dengan Tailwind CSS dan token dari `color.tokens.ts`.

### Katalog komponen

Button · Input · ComboBox · DataTable · Pagination · Modal · Drawer · Toast · Badge · Card · Avatar · Toggle · Typography · Chart · FileManagement · Layout · NavMenu · SkeletonLoader · ScrollToTop · CodeBlock · ErrorBoundary

### Di mana melihat komponen

| Kapan                            | URL                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Development** (`pnpm run dev`) | Menu **Components** (badge DEV) → landing page dengan tautan ke katalog                                                                            |
| **Katalog komponen (live)**      | [https://template.teristimewa.com/react-dashboard-template-01/components](https://template.teristimewa.com/react-dashboard-template-01/components) |

Katalog live menampilkan props, matriks state, dan contoh kode siap salin untuk setiap komponen bersama.

### Contoh penggunaan

```tsx
import { Button } from '@/components/Button';
import { DataTable, DataTableGroup } from '@/components/DataTable';
import { Pagination } from '@/components/Pagination';

<Button variant="primary" onClick={handleSave}>
  Simpan
</Button>;
```

Teks default di dalam `src/components/` harus memakai `t('components.common.*')`.

---

<a id="id-11-hooks"></a>

## 11. Hooks

Hook adalah jembatan **Application layer** antara UI dan logika bisnis.

### Jenis hook di proyek ini

| Kategori        | Lokasi                   | Contoh                             |
| --------------- | ------------------------ | ---------------------------------- |
| Context hooks   | `context/`, Toast, Modal | `useAuth`, `useLocale`, `useTheme` |
| Feature hooks   | `features/<nama>/hooks/` | `useUsersPage`, `useProductsPage`  |
| Layout hooks    | `layouts/**/hooks/`      | `useMainLayout`, `useSidebar`      |
| Component hooks | `components/**/hooks/`   | `useFileDownload`                  |

### Pola feature hook

```tsx
export function useUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await usersUsecase.getUsers(page, pageSize);
      setUsers(result.data);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, page, setPage /* ... */ };
}
```

### Aturan hook

| Lakukan                                | Jangan                                 |
| -------------------------------------- | -------------------------------------- |
| Panggil usecase dari feature hook      | Panggil `axios` langsung di hook       |
| Biarkan page tipis                     | Taruh aturan bisnis di komponen        |
| Pakai context hooks untuk state global | Duplikasi logika auth/locale per fitur |

---

<a id="id-12-lapisan-data--implementasi-api"></a>

## 12. Lapisan Data & Implementasi API

### Tiga lapisan jaringan

```
backendService.ts   → Instance Axios, base URL, token Bearer, interceptor 401
apiSource.ts        → Satu fungsi per endpoint REST (return JSON mentah)
apiRepository.ts    → Logika bisnis, validasi, mock data, mapper
```

### Model: lapisan anti-korupsi

| File                | Format           | Contoh field                     |
| ------------------- | ---------------- | -------------------------------- |
| `model.response.ts` | snake_case (API) | `full_name`, `is_active`         |
| `model.type.ts`     | camelCase (UI)   | `fullName`, `isActive`           |
| `model.map.ts`      | Fungsi transform | `toUser()`, `toPaginatedUsers()` |

**Aturan:** Komponen dan hook tidak pernah melihat field `snake_case`.

### Cara sambungkan API nyata (contoh: Users)

Fitur Users sudah punya tipe API, mapper (`toUser`, `toPaginatedUsers`), dan `getUsers()` di `apiSource.ts`. Saat backend siap:

1. Set `VITE_API_BASE_URL` di `.env`
2. Ganti mock di `apiRepository.getUsers()` dengan `apiSource.getUsers()` + `toPaginatedUsers()`
3. Usecase, hook, dan page **tidak perlu diubah**

Untuk **halaman baru** (mis. Inventaris dari Tutorial), tambahkan tipe response, tipe domain, mapper, dan endpoint. Lihat [Bagian 15: Langkah 7](#id-15-buat-halaman-baru--manual) atau langkah 7 di Tutorial dalam aplikasi.

### Penyimpanan lokal

Jangan pakai `localStorage` langsung. Gunakan `localSource`:

```tsx
localSource.getToken();
localSource.setUser(user);
localSource.clearAuth();
```

---

<a id="id-13-i18n--tema"></a>

## 13. i18n & Tema

| File                  | Bahasa           |
| --------------------- | ---------------- |
| `src/locales/en.json` | English          |
| `src/locales/id.json` | Bahasa Indonesia |

Kedua file harus punya **struktur key yang sama**. Nama parameter `{{param}}` harus cocok; urutan kata boleh berbeda.

Tema: `light` · `dark` · `system`. Disimpan di localStorage. Default locale: `'en'` di `app.config.ts`.

---

<a id="id-14-buat-halaman-baru--shortcut-make-feature"></a>

## 14. Buat Halaman Baru: Shortcut (`make feature`)

Cara tercepat menambah menu sidebar, route, locale, ikon, dan folder fitur:

```bash
make feature name=products label="Products" label-id="Produk"
```

### Scope

| Scope              | File yang dibuat           | Mock data         |
| ------------------ | -------------------------- | ----------------- |
| `full` _(default)_ | page, table, hook, usecase | di `usecase/*.ts` |
| `hook`             | page, table, hook          | inline di hook    |
| `page`             | page saja                  | tidak ada         |

### Parameter

| Parameter  | Wajib            | Deskripsi                                                                                                                                                                                                                                                                                                   |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | Ya               | Nama fitur — boleh pakai spasi (mis. `name="pake spasi"`). Perintah mempertahankan input Anda; key yang dihasilkan jadi camelCase (`pake spasi` → `pakeSpasi`). Spasi/pemisah berlebih di-trim/digabung saat menghitung key. Membuat folder, route `/<key>`, locale `nav.<key>`. Key sudah ada? Ganti nama. |
| `label`    | Direkomendasikan | Label menu bahasa Inggris (boleh spasi — pakai tanda kutip)                                                                                                                                                                                                                                                 |
| `label-id` | Direkomendasikan | Label menu bahasa Indonesia (boleh spasi — pakai tanda kutip)                                                                                                                                                                                                                                               |
| `scope`    | Tidak            | `full` · `hook` · `page`                                                                                                                                                                                                                                                                                    |

### Contoh

```bash
make feature name=reports label="Reports" label-id="Laporan"
make feature name=inventory scope=hook label="Inventory" label-id="Inventaris"
make feature name=analytics scope=page label="Analytics" label-id="Analitik"
```

File yang diubah otomatis (`make feature` — jangan edit manual): feature folder, `featureRoutesGenerate.tsx`, `featureMenuItemsGenerate.tsx`, `en.json`, `id.json`.

Registry manual: `featureRoutes.tsx` (route bawaan), `featureMenuItems.tsx` (menu bawaan). Ikon kustom opsional di `SidebarIcons.tsx`, lalu ganti `<FeatureMenuIcon />` di `featureMenuItemsGenerate.tsx`.

Di repo creator, tab **Dokumentasi → Tutorial** punya builder perintah interaktif: mempertahankan input `name`/`app name` Anda (termasuk spasi) di perintah yang disalin, dan menampilkan feature key atau folder output sebelum disalin — input tidak diubah otomatis saat mengetik.

---

<a id="id-15-buat-halaman-baru--manual"></a>

## 15. Buat Halaman Baru: Manual

Gunakan ini untuk kontrol penuh atau memahami apa yang dilakukan `make feature`. Kita buat halaman **Products** dari nol sampai API jalan.

### Langkah 1: Buat struktur folder

```
src/features/products/
├── pages/ProductsPage.tsx
├── components/ProductsTable.tsx
├── hooks/useProductsPage.ts
└── usecase/productsUsecase.ts
```

### Langkah 2: Tambah locale

```json
// en.json
"nav": { "products": "Products" }
"products": { "subtitle": "Manage your product catalog" }

// id.json
"nav": { "products": "Produk" }
"products": { "subtitle": "Kelola katalog produk Anda" }
```

### Langkah 3: Buat page, hook, usecase, table

Lihat [Bagian 15 English](./DOCUMENTATION.md#15-create-a-new-page--manual-walkthrough) untuk kode lengkap halaman **Products**.

### Langkah 4: Daftarkan route di `featureRoutes.tsx`

Tambahkan entry ke array `featureRoutes` (di-spread ke `AppRouter.tsx` via `...featureRoutes`):

```tsx
const ProductsPage = lazyWithRetry(() => import('@/features/products/pages/ProductsPage'));
// path: 'products' + FeatureLazyPage wrapper. Lihat Bagian 15 English Step 7
```

### Langkah 5: Tambah menu di `featureMenuItems.tsx` + ikon di `SidebarIcons.tsx`

Tambahkan item ke return `buildFeatureMenuItems()` di `src/layouts/sidebar/featureMenuItems.tsx`. Ikon opsional di `SidebarIcons.tsx`.

### Langkah 6: Verifikasi

```bash
pnpm run dev
```

Buka `/products`, tabel mock dengan paginasi harus tampil.

### Langkah 7: Sambungkan API nyata (opsional)

Lewati langkah ini jika masih memakai mock data. Saat backend siap, hubungkan fitur **Inventaris** end-to-end:

1. Set `VITE_API_BASE_URL` di `.env`; `backendService` membaca `appConfig.apiBaseUrl`
2. Tambah `ApiInventoryItemResponse` di `model.response.ts` (snake_case)
3. Tambah `InventoryItem` di `model.type.ts` (camelCase)
4. Tambah `toInventoryItem` / `toPaginatedInventory` di `model.map.ts`
5. Tambah `getInventory()` di `apiSource.ts`, return response API mentah
6. Ganti mock di `inventoryUsecase.ts` dengan `apiSource.getInventory()` + `toPaginatedInventory()`

Hook (`useInventoryPage`) dan page (`InventoryPage`) **tidak perlu diubah**. Kode lengkap ada di [Bagian 15 English: Step 11](./DOCUMENTATION.md#step-11--connect-real-api-when-backend-is-ready).

---

<a id="id-16-scaffold-aplikikasi-sendiri-make-generate"></a>

## 16. Scaffold Aplikasi Sendiri (`make generate`)

Gunakan template ini untuk membuat folder proyek **terpisah** (di luar repo ini):

```bash
make generate name=my-new-app
make generate name=my-new-app out=~/projects/my-new-app
```

| Yang terjadi   | Detail                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Output         | Folder baru berisi salinan penuh template ini                                                                                                                                              |
| `package.json` | `name` diperbarui ke nama aplikasi Anda                                                                                                                                                    |
| Git            | `git init` di folder output                                                                                                                                                                |
| Config         | Title/description di `app.config.ts` disalin apa adanya: sesuaikan setelah generate                                                                                                        |
| Nama folder    | Spasi di `name` tetap di perintah (mis. `name="my new app"`); folder output memakai kebab-case (mis. `my-new-app`); spasi/pemisah berlebih di-trim/digabung; CLI menampilkan path hasilnya |

**File demo FileDownload:** `public/samples/` sudah disertakan agar mock download berfungsi langsung.

Setelah generate, `cd` ke folder baru, jalankan `pnpm install`, lalu `make dev`.

---

<a id="id-17-deployment"></a>

## 17. Deployment

| Variabel                 | Default      | Fungsi                                                                                                                                                             |
| ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_API_BASE_URL`      | `/api`       | Base URL API backend                                                                                                                                               |
| `VITE_BASE_PATH`         | `/`          | Base path saat di-host di subpath                                                                                                                                  |
| `VITE_SHOW_DEV_FEATURES` | `true` (dev) | Tampilkan route landing Tutorial & Components saat dev. Set `false` untuk sembunyikan, atau hapus `devLandingRoutes` / `devLandingMenuItems` untuk bersih permanen |

**Subpath hosting:** Set `VITE_BASE_PATH` sesuai path hosting sebelum `pnpm run build`. Output `dist/` harus disajikan dengan SPA fallback agar deep link (mis. `/dashboard`) mengarah ke `index.html`. Konfigurasi fallback mengikuti dokumentasi web server Anda (nginx, Apache, S3 + CloudFront, dll.).

**Build produksi:**

```bash
pnpm run build
pnpm run preview   # opsional, cek dist/ secara lokal
```

---

<a id="id-18-referensi-makefile"></a>

## 18. Referensi Makefile

| Perintah                                           | Deskripsi                                     |
| -------------------------------------------------- | --------------------------------------------- |
| `make dev`                                         | Jalankan Vite dev server                      |
| `make format`                                      | Prettier + ESLint auto-fix                    |
| `make lint`                                        | ESLint + TypeScript check                     |
| `make build`                                       | Format → type-check → build produksi          |
| `make preview`                                     | Serve `dist/` secara lokal                    |
| `make clean`                                       | Hapus `dist/`, `.turbo`, `node_modules/.vite` |
| `make feature name=X label="Name" label-id="Nama"` | Scaffold menu + halaman                       |
| `make generate name=my-app`                        | Scaffold micro-app di luar repo ini           |

---

## Bacaan Lanjutan

- [DOCUMENTATION.md](./DOCUMENTATION.md) (versi English)
- [README.id.md](./README.id.md): ringkasan singkat (Bahasa Indonesia)
- [README.md](./README.md): ringkasan singkat (English)
- [Katalog komponen (live)](https://template.teristimewa.com/react-dashboard-template-01/components)
- [Dokumentasi (live)](https://template.teristimewa.com/react-dashboard-template-01/documentation/overview)
