# React App Boilerplate

Production-ready React starter with Vite, TypeScript, Tailwind CSS, and Clean Layered Architecture.

## Prerequisites

Install these before running the app. Versions match [package.json](./package.json) (Volta-pinned).

| Tool | Version | Required | Used for |
|------|---------|----------|----------|
| **Node.js** | 20.x (20.11.0 recommended) | Yes | Runtime & build |
| **pnpm** | 8.x (8.15.4 recommended) | Yes* | Install dependencies & run scripts |
| **Git** | any recent | Recommended | Clone repo, `make generate` init |
| **make** | any (GNU Make) | Optional | Makefile shortcuts (`make dev`, etc.) |
| **rsync** | any | Optional | `make generate` only (Mac/Linux usually pre-installed) |

\* npm works as a fallback (`npm install`, `npm run dev`) but this project is tested with **pnpm**.

### Installing Make

`make` is optional for daily dev (`pnpm dev` works without it). Install it if you want Makefile shortcuts (`make dev`, `make build`, `make generate`, etc.).

#### macOS

```bash
# Option A: Xcode Command Line Tools (make included)
xcode-select --install

# Option B: Homebrew (if make is missing or you want a newer GNU Make)
brew install make

# Verify
make --version
```

#### Linux (Debian / Ubuntu)

```bash
# build-essential includes make, gcc, and other build tools
sudo apt update
sudo apt install -y build-essential

# Or install make only
sudo apt install -y make

# rsync: needed for make generate
sudo apt install -y rsync

# Verify
make --version
```

Other distros: use your package manager, e.g. `sudo dnf install make` (Fedora), `sudo pacman -S make` (Arch).

#### Windows

Pick one:

| Method | Install | Notes |
|--------|---------|-------|
| **pnpm only** (no make) | n/a | Use [Without Make](#without-make). Works for dev, build, lint |
| **WSL** (recommended) | [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install), then inside Ubuntu: `sudo apt install -y build-essential rsync` | Full Makefile support including `make generate` |
| **Chocolatey** | `choco install make` | Run in admin PowerShell |
| **Scoop** | `scoop install make` | User-level install |
| **Git Bash** | Often bundled; if missing use WSL or Chocolatey | `make generate` still needs rsync (use WSL) |

```powershell
# Verify (after install)
make --version
```

### macOS: Node & pnpm

```bash
# Node + pnpm via Homebrew
brew install node pnpm

# Optional: exact versions via Volta (recommended)
curl https://get.volta.sh | bash
volta install node@20.11.0 pnpm@8.15.4

# make: see [Installing Make](#installing-make) above
# rsync: included with macOS
```

### Linux (Debian/Ubuntu): Node & pnpm

```bash
# Node 20 via NodeSource (or use nvm / Volta)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
npm install -g pnpm@8.15.4

# make & rsync: see [Installing Make](#installing-make) above

# Optional: Volta
curl https://get.volta.sh | bash
volta install node@20.11.0 pnpm@8.15.4
```

### Windows: Node & pnpm

```powershell
# Node 20: download installer from https://nodejs.org/ or use winget:
winget install OpenJS.NodeJS.LTS

# pnpm (after Node is installed)
npm install -g pnpm@8.15.4

# Optional: Volta (https://docs.volta.sh/guide/getting-started)
```

**make on Windows:** see [Installing Make](#installing-make) above.

**`make generate` on Windows** needs `rsync`. Easiest via **WSL**. For feature scaffolding only, use the `node` command in [Scaffolding without Make](#scaffolding-without-make) (works everywhere).

---

## Quick Start

### 1. Clone the template

```bash
git clone https://github.com/your-org/react-app-template.git
cd react-app-template
```

> **Creator:** set the real URL in `src/config/external-links.json` → `templateRepoUrl` before `make template`. The in-app Tutorial uses that value for copy-paste commands.

### 2. Install & run

```bash
pnpm install
make dev
```

Open **http://localhost:5173**. Demo login: `admin@mail.com` / `password123`

### 3. Scaffold your own app (optional)

From inside the cloned template:

```bash
make generate name=my-new-app
cd ../my-new-app
rm -rf ../react-app-template
pnpm install
make dev
```

---

## Without Make

If you **don't have `make`**, use **pnpm scripts** directly. Same result for daily development:

| Instead of | Run |
|------------|-----|
| `make dev` | `pnpm dev` |
| `make build` | `pnpm format && pnpm build` |
| `make lint` | `pnpm lint` |
| `make format` | `pnpm format` |
| `make preview` | `pnpm preview` |
| `make clean` | delete `dist`, `.turbo`, `node_modules/.vite` manually |
| `make feature name=X label="Name"` | see [Scaffolding without Make](#scaffolding-without-make) |
| `make generate name=X` | see [Scaffolding without Make](#scaffolding-without-make) |

**Minimal run (no make at all):**

```bash
pnpm install
pnpm dev
```

**npm equivalent:**

```bash
npm install
npm run dev
```

### Scaffolding without Make

```bash
# Add menu + page (works on Windows, Mac, Linux)
# label     = English sidebar text (en.json)
# label-id  = Indonesian sidebar text (id.json)
node scripts/generate-feature.mjs --name=orders --label="Orders" --label-id="Pesanan"
node scripts/generate-feature.mjs --name=reports --scope=hook --label="Reports" --label-id="Laporan"
node scripts/generate-feature.mjs --name=inventory --scope=page --label="Inventory" --label-id="Inventaris"

# Clone boilerplate outside this repo (needs rsync; use WSL on Windows)
make generate name=my-app                    # → ../my-app
node scripts/generate-app.mjs --name=my-app   # same, without make
node scripts/generate-app.mjs --name=my-app --out=~/projects/my-app
```

---

## Commands (Makefile)

| Command | Description |
|---------|-------------|
| `make dev` | Start Vite dev server (development mode) |
| `make build` | Format, type-check, and production build |
| `make lint` | ESLint + TypeScript check (no file writes) |
| `make format` | Prettier + ESLint auto-fix |
| `make preview` | Serve production build locally |
| `make clean` | Remove `dist`, `.turbo`, `node_modules/.vite` |
| `make generate name=my-app [out=PATH]` | Scaffold micro-app outside boilerplate (default: `../my-app`) |
| `make feature name=X [scope=full\|hook\|page] label="English" [label-id="Indonesia"]` | Scaffold menu + page (bilingual sidebar labels) |

Open **Tutorial** in the sidebar (DEV badge, development mode only) for a step-by-step guide from `make generate` to adding features.

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for architecture, routing, localization, and Storybook details.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router v6
- Axios with interceptors
- Volta-pinned Node 20.11.0 / pnpm 8.15.4
