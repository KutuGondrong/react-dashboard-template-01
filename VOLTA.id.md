# Setup Node.js dan pnpm (Volta)

Project ini mengunci **Node.js `24.18.0`** dan **pnpm `11.17.0`** di `package.json` (`volta`, `engines`, dan `packageManager`).

[Volta](https://volta.sh) opsional tapi disarankan. Pilih **satu** panduan di bawah sesuai mesin Anda, lalu ikuti dari atas ke bawah.

English: [VOLTA.md](./VOLTA.md)

Cek shell dulu:

```bash
echo $SHELL
# /bin/zsh  → pakai macOS zsh (atau Linux zsh)
# /bin/bash → pakai macOS bash atau Linux bash
```

---

## 1. macOS + zsh (default Mac modern)

### Install Volta

```bash
brew install volta
# atau: curl https://get.volta.sh | bash
```

Buka tab terminal baru, atau lanjut setelah langkah configure.

### Configure `~/.zshrc`

Buka `~/.zshrc` dan taruh baris berikut di **akhir** file (setelah blok `nvm` / `fnm` / `asdf` jika ada):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Terapkan:

```bash
source ~/.zshrc
```

### Install toolchain project (sekali per mesin)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verifikasi

```bash
which node
# harus: .../.volta/bin/node   (bukan .../.nvm/...)

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Jalankan project

```bash
cd /path/to/this-repo
pnpm install
pnpm run dev
```

Tidak perlu `volta pin` jika `package.json` sudah punya blok `volta`. Tidak perlu `volta install` tiap kali clone.

---

## 2. macOS + bash

### Install Volta

```bash
brew install volta
# atau: curl https://get.volta.sh | bash
```

### Configure profile

Utamakan `~/.bashrc`. Jika Mac Anda hanya memuat `~/.bash_profile` untuk login shell, tulis blok yang sama di sana (atau `source` bashrc dari bash_profile).

Tambahkan di **akhir** file (setelah blok `nvm` / `fnm` / `asdf` jika ada):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Terapkan:

```bash
source ~/.bashrc
# atau: source ~/.bash_profile
```

### Install toolchain project (sekali per mesin)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verifikasi

```bash
which node
# harus: .../.volta/bin/node

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Jalankan project

```bash
cd /path/to/this-repo
pnpm install
pnpm run dev
```

---

## 3. Linux + bash (atau WSL + bash)

### Install Volta

```bash
curl https://get.volta.sh | bash
```

Buka terminal baru, atau lanjut setelah configure.

### Configure `~/.bashrc`

Tambahkan di **akhir** (setelah blok `nvm` / `fnm` / `asdf` jika ada):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Terapkan:

```bash
source ~/.bashrc
```

### Install toolchain project (sekali per mesin)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verifikasi

```bash
which node
# harus: .../.volta/bin/node

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Jalankan project

```bash
cd /path/to/this-repo
pnpm install
pnpm run dev
```

---

## 4. Linux + zsh (atau WSL + zsh)

### Install Volta

```bash
curl https://get.volta.sh | bash
```

### Configure `~/.zshrc`

Tambahkan di **akhir** (setelah blok `nvm` / `fnm` / `asdf` jika ada):

```bash
export VOLTA_FEATURE_PNPM=1
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

Terapkan:

```bash
source ~/.zshrc
```

### Install toolchain project (sekali per mesin)

```bash
volta install node@24.18.0 pnpm@11.17.0
```

### Verifikasi

```bash
which node
# harus: .../.volta/bin/node

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $VOLTA_FEATURE_PNPM   # 1
```

### Jalankan project

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

Tutup lalu buka jendela PowerShell **baru**.

### Configure environment user

```powershell
[System.Environment]::SetEnvironmentVariable('VOLTA_FEATURE_PNPM', '1', 'User')
[System.Environment]::SetEnvironmentVariable('VOLTA_HOME', "$env:USERPROFILE\.volta", 'User')
```

Taruh `%USERPROFILE%\.volta\bin` di **urutan pertama** User `Path` (Settings → System → About → Advanced system settings → Environment Variables).

Untuk jendela saat ini:

```powershell
$env:VOLTA_FEATURE_PNPM = '1'
$env:PATH = "$env:USERPROFILE\.volta\bin;$env:PATH"
```

Setelah ubah User env, buka PowerShell baru.

### Install toolchain project (sekali per mesin)

```powershell
volta install node@24.18.0 pnpm@11.17.0
```

### Verifikasi

```powershell
Get-Command node
# Source harus di bawah .volta\bin

node --version    # v24.18.0
pnpm --version    # 11.17.0
echo $env:VOLTA_FEATURE_PNPM   # 1
```

### Jalankan project

```powershell
cd path\to\this-repo
pnpm install
pnpm run dev
```

Untuk `make generate` (butuh `rsync`), lebih nyaman pakai **WSL** dan ikuti panduan Linux di atas di dalam WSL.

---

## Tanpa Volta

Pakai versi yang sama: Node.js `24.18.0` dan pnpm `11.17.0`.

```bash
# contoh dengan Corepack (setelah Node 24.18.0 terpasang)
corepack enable
corepack prepare pnpm@11.17.0 --activate
node --version
pnpm --version
```

---

## Troubleshooting

### `VOLTA_FEATURE_PNPM` kosong

Export belum ada di profile yang benar-benar di-load, atau belum `source` / belum buka terminal baru. Ulangi langkah configure di panduan shell Anda di atas.

### `node -v` masih nvm / versi lain

Volta sudah install, tapi binary lain lebih dulu di `PATH`.

Sesi ini:

```bash
export PATH="$HOME/.volta/bin:$PATH"
hash -r
which node && node -v
```

Permanen: baris Volta harus di **akhir** `~/.zshrc` / `~/.bashrc`. Kalau hanya `export` di terminal lalu `source ~/.zshrc`, nvm bisa menang lagi kecuali file itu sendiri diakhiri blok `PATH` Volta.

```bash
which node
# harus ~/.volta/bin/node
```

### Apakah perlu `volta pin`?

Tidak, jika repo ini sudah punya `"volta"` di `package.json`. `volta pin` menulis pin; `volta install` mengunduh ke mesin Anda.

Lihat juga: [Prasyarat README](./README.id.md#1-environment--prasyarat-sistem-multi-os).
