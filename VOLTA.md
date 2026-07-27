# Node.js and pnpm setup (Volta)

This project pins **Node.js `24.18.0`** and **pnpm `11.17.0`** in `package.json` (`volta`, `engines`, and `packageManager`).

[Volta](https://volta.sh) is optional but recommended. Pick **one** guide below for your machine and follow it top to bottom.

Bahasa Indonesia: [VOLTA.id.md](./VOLTA.id.md)

Check your shell first:

```bash
echo $SHELL
# /bin/zsh  → use macOS zsh (or Linux zsh)
# /bin/bash → use macOS bash or Linux bash
```

---

## 1. macOS + zsh (default on modern Mac)

### Install Volta

```bash
brew install volta
# or: curl https://get.volta.sh | bash
```

Open a new terminal tab, or continue in this one after the next step.

### Configure `~/.zshrc`

Open `~/.zshrc` and put these lines at the **end** of the file (after any `nvm` / `fnm` / `asdf` blocks):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Apply:

```bash
source ~/.zshrc
```

### Install project toolchain (once per machine)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verify

```bash
which node
# must be: .../.volta/bin/node   (not .../.nvm/...)

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Run the project

```bash
cd /path/to/this-repo
pnpm install
pnpm run dev
```

You do not need `volta pin` when `package.json` already has a `volta` block. You do not need `volta install` on every clone.

---

## 2. macOS + bash

### Install Volta

```bash
brew install volta
# or: curl https://get.volta.sh | bash
```

### Configure profile

Prefer `~/.bashrc`. If your Mac only loads `~/.bash_profile` for login shells, put the same block there (or source bashrc from bash_profile).

Add at the **end** of the file (after any `nvm` / `fnm` / `asdf` blocks):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Apply:

```bash
source ~/.bashrc
# or: source ~/.bash_profile
```

### Install project toolchain (once per machine)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verify

```bash
which node
# must be: .../.volta/bin/node

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Run the project

```bash
cd /path/to/this-repo
pnpm install
pnpm run dev
```

---

## 3. Linux + bash (or WSL + bash)

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Open a new terminal, or continue after configure.

### Configure `~/.bashrc`

Add at the **end** (after any `nvm` / `fnm` / `asdf` blocks):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Apply:

```bash
source ~/.bashrc
```

### Install project toolchain (once per machine)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verify

```bash
which node
# must be: .../.volta/bin/node

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Run the project

```bash
cd /path/to/this-repo
pnpm install
pnpm run dev
```

---

## 4. Linux + zsh (or WSL + zsh)

### Install Volta

```bash
curl https://get.volta.sh | bash
```

### Configure `~/.zshrc`

Add at the **end** (after any `nvm` / `fnm` / `asdf` blocks):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Apply:

```bash
source ~/.zshrc
```

### Install project toolchain (once per machine)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verify

```bash
which node
# must be: .../.volta/bin/node

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Run the project

```bash
cd /path/to/this-repo
pnpm install
pnpm run dev
```

---

## 5. Windows + PowerShell

### Install Volta

```powershell
winget install Volta.Volta
```

Close and open a **new** PowerShell window.

### Configure user environment

```powershell
[System.Environment]::SetEnvironmentVariable('VOLTA_FEATURE_PNPM', '1', 'User')
[System.Environment]::SetEnvironmentVariable('VOLTA_HOME', "$env:USERPROFILE\.volta", 'User')
```

Put `%USERPROFILE%\.volta\bin` **first** in User `Path` (Settings → System → About → Advanced system settings → Environment Variables).

For the current window:

```powershell
$env:VOLTA_FEATURE_PNPM = '1'
$env:PATH = "$env:USERPROFILE\.volta\bin;$env:PATH"
```

Open a new PowerShell after changing User env vars.

### Install project toolchain (once per machine)

```powershell
volta install node@24.18.0 pnpm@11.17.0
```

### Verify

```powershell
Get-Command node
# Source must be under .volta\bin

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $env:VOLTA_FEATURE_PNPM   # 1
```

### Run the project

```powershell
cd path\to\this-repo
pnpm install
pnpm run dev
```

For `make generate` (needs `rsync`), prefer **WSL** and follow the Linux guide above inside WSL.

---

## Without Volta

Use the same versions: Node.js `24.18.0` and pnpm `11.17.0`.

```bash
# example with Corepack (after Node 24.18.0 is installed)
corepack enable
corepack prepare pnpm@11.17.0 --activate
node --version
pnpm --version
```

---

## Troubleshooting

### `VOLTA_FEATURE_PNPM` is empty

The export is missing from the profile you actually load, or you have not `source`d / opened a new terminal. Re-check the configure step for your shell above.

### `node -v` still shows nvm / another version

Volta installed fine, but another binary is ahead on `PATH`.

This session:

```bash
export PATH="$HOME/.volta/bin:$PATH"
hash -r
which node && node -v
```

Permanent: Volta lines must be at the **end** of `~/.zshrc` / `~/.bashrc`. If you only `export` in the terminal then `source ~/.zshrc`, nvm can win again unless the file itself ends with the Volta `PATH` block.

```bash
which node
# must be ~/.volta/bin/node
```

### Do I need `volta pin`?

No, when this repo already has `"volta"` in `package.json`. `volta pin` writes pins; `volta install` downloads them onto your machine.

See also: [README Prerequisites](./README.md#1-prerequisites).
