# React App Boilerplate

Production-ready React starter with Vite, TypeScript, Tailwind CSS, and Clean Layered Architecture.

**Live template preview:** [https://template.teristimewa.com/react-dashboard-template-01](https://template.teristimewa.com/react-dashboard-template-01) (deployed Tutorial & Components documentation from the creator production build).

## Prerequisites

Install these **before** cloning or running the app. Versions match [package.json](./package.json) (Volta-pinned).

> **Already have everything?** If `node`, `pnpm`, and `git` work in your terminal, skip to [Quick Start](#quick-start). You only need `make` (optional shortcuts) and `rsync` (only for `make generate`).

| Tool | Version | Required | Used for |
|------|---------|----------|----------|
| **Node.js** | 20.x (20.11.0 recommended) | Yes | Runtime & build |
| **pnpm** | 8.x (8.15.4 recommended) | Yes* | Install dependencies & run scripts |
| **Git** | any recent | Recommended | Clone repo, `make generate` init |
| **make** | any (GNU Make) | Optional | Makefile shortcuts (`make dev`, etc.) |
| **rsync** | any | Optional | `make generate` only (Mac/Linux usually pre-installed) |

\* npm works as a fallback (`npm install`, `npm run dev`) but this project is tested with **pnpm**.

### Verify installation

Run these in a terminal. If a command is missing, install it using the guides below.

```bash
node --version    # expect v20.x (e.g. v20.11.0)
pnpm --version    # expect 8.x (e.g. 8.15.4)
git --version     # any recent version
make --version    # optional — skip if you use pnpm scripts directly
rsync --version   # optional — only needed for make generate
```

---

### Install from scratch

Pick your operating system. Follow the steps **in order** if nothing is installed yet.

| OS | Section |
|----|---------|
| **macOS** | [macOS](#macos) |
| **Linux** | [Linux (Debian / Ubuntu)](#linux-debian--ubuntu) · [Fedora / RHEL](#linux-fedora--rhel) · [Arch](#linux-arch) |
| **Windows** | [WSL (recommended)](#windows-wsl-recommended) · [Native PowerShell](#windows-native-powershell) |

#### macOS

Install **Git**, **make**, **rsync**, **Node.js 20**, and **pnpm**:

```bash
# 1. Git + make (Xcode Command Line Tools — includes both)
xcode-select --install
# If already installed, the command prints a message and does nothing.

# 2. Homebrew (recommended package manager — skip if already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Node.js 20 + pnpm (pick one method)

# Option A — Homebrew (simple)
brew install node pnpm

# Option B — Volta (exact pinned versions, recommended)
curl https://get.volta.sh | bash
# Restart terminal, then:
volta install node@20.11.0 pnpm@8.15.4

# 4. rsync — included with macOS (no install needed)
# 5. make — included with Xcode CLT above
#    Or install a newer GNU Make: brew install make

# Verify
node --version && pnpm --version && git --version && make --version && rsync --version
```

#### Linux (Debian / Ubuntu)

Install **Git**, **Node.js 20**, **pnpm**, **make**, and **rsync**:

```bash
# 1. Git
sudo apt update
sudo apt install -y git

# 2. Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. pnpm
npm install -g pnpm@8.15.4

# 4. make + rsync (needed for make generate)
sudo apt install -y build-essential rsync
# build-essential includes make, gcc, and other build tools

# Optional: Volta for exact versions
curl https://get.volta.sh | bash
# Restart terminal, then:
volta install node@20.11.0 pnpm@8.15.4

# Verify
node --version && pnpm --version && git --version && make --version && rsync --version
```

#### Linux (Fedora / RHEL)

```bash
sudo dnf install -y git make rsync
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
npm install -g pnpm@8.15.4

# Verify
node --version && pnpm --version && git --version && make --version && rsync --version
```

#### Linux (Arch)

```bash
sudo pacman -S --needed git make rsync nodejs npm
npm install -g pnpm@8.15.4

# Verify
node --version && pnpm --version && git --version && make --version && rsync --version
```

#### Windows (WSL — recommended)

Full support for `make`, `rsync`, and `make generate`. Install WSL, then use the Linux steps inside Ubuntu.

```powershell
# 1. Install WSL + Ubuntu (PowerShell as Administrator)
wsl --install
# Restart PC if prompted, then open "Ubuntu" from Start menu
```

Inside the **Ubuntu** terminal, follow [Linux (Debian / Ubuntu)](#linux-debian--ubuntu) above.

```bash
# After Linux steps complete, clone and run from WSL:
git clone https://github.com/KutuGondrong/react-dashboard-template-01.git
cd react-dashboard-template-01
pnpm install
make dev
```

#### Windows (native — PowerShell)

Works for daily dev (`pnpm dev`). For `make generate`, use [WSL](#windows-wsl-recommended) (needs `rsync`).

```powershell
# 1. Git
winget install Git.Git
# Or download: https://git-scm.com/download/win

# 2. Node.js 20 LTS
winget install OpenJS.NodeJS.LTS
# Or download: https://nodejs.org/

# 3. pnpm (open a NEW terminal after Node is installed)
npm install -g pnpm@8.15.4

# 4. make (optional — or use pnpm scripts, see Without Make)
winget install GnuWin32.Make
# Or Chocolatey (admin PowerShell): choco install make
# Or Scoop: scoop install make

# 5. rsync — not included on native Windows; use WSL for make generate
#    Optional native rsync: choco install rsync  (Chocolatey)

# Verify (PowerShell or Git Bash)
node --version
pnpm --version
git --version
make --version
```

| Windows setup | make | rsync | make generate |
|---------------|------|-------|---------------|
| **WSL + Ubuntu** | yes | yes | yes |
| **Native + pnpm only** | no | no | use WSL or `node scripts/generate-app.mjs` in WSL |
| **Native + make (Chocolatey/Scoop)** | yes | no* | use WSL for rsync |

\* `choco install rsync` may work on some setups; WSL is still the most reliable option.

---

## Quick Start

### 1. Clone the template

```bash
git clone https://github.com/KutuGondrong/react-dashboard-template-01.git
cd react-dashboard-template-01
```

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
rm -rf ../react-dashboard-template-01
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
