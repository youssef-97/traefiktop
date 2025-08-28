<div>
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.svg">
  <img alt="traefiktop" src="assets/logo-light.svg">
</picture>

[![GitHub Downloads](https://img.shields.io/github/downloads/darksworm/traefiktop/total?style=flat-square&label=github+downloads)](https://github.com/darksworm/traefiktop/releases/latest)
[![Latest Release](https://img.shields.io/github/v/release/darksworm/traefiktop?style=flat-square)](https://github.com/darksworm/traefiktop/releases/latest)
[![License](https://img.shields.io/github/license/darksworm/traefiktop?style=flat-square)](./LICENSE)
[![codecov](https://img.shields.io/codecov/c/github/darksworm/traefiktop?style=flat-square)](https://codecov.io/github/darksworm/traefiktop)
</div>

A simple, keyboard‑friendly terminal UI for exploring Traefik routers and services. Built with React + Ink, focused on clarity over chrome.

## What it shows
- Routers, their rules, and the services they target
- Which router is effectively down (no healthy services)
- The active service path (failover aware)
- Quick, readable status with a minimal set of emojis and colors

## 🚀 Installation methods

<details>
  <summary><strong>Install Script (Linux/macOS)</strong></summary>

```bash
curl -sSL https://raw.githubusercontent.com/darksworm/traefiktop/main/install.sh | sh
```

The install script automatically detects your system (including musl vs glibc on Linux) and downloads the appropriate binary from the latest release.

You can also install a specific version:
```bash
curl -sSL https://raw.githubusercontent.com/darksworm/traefiktop/main/install.sh | sh -s -- v0.1.0
```
</details>

<details>
  <summary><strong>npm (Linux/macOS)</strong></summary>

```bash
npm i --global traefiktop
```
</details>

<details>
  <summary><strong>Homebrew (Linux/macOS)</strong></summary>

```bash
brew tap darksworm/homebrew-tap
brew install --cask traefiktop
```
</details>

<details>
  <summary><strong>AUR (Arch User Repository)</strong></summary>

```bash
yay -S traefiktop-bin
```
</details>

<details>
  <summary><strong>Download a binary</strong></summary>

Grab binaries and packages from the latest release:
https://github.com/darksworm/traefiktop/releases/latest

</details>

## Usage
`--host` is required. Optionally hide routers by name with `--ignore` patterns (case‑insensitive). Use `*` at the start/end for “starts with” / “ends with”. Use `--insecure` to disable TLS verification for development against self‑signed endpoints.

```bash
traefiktop --host https://traefik.example.org \
  --ignore staging-* \
  --ignore *-tmp,*-old
```

Development only (self-signed endpoints):

```
traefiktop --host https://selfsigned.local --insecure
```

## Keys
- Navigation: `j/k` or arrows
- Page: `PgDn/PgUp`, `Ctrl+f/Ctrl+b`
- Jump: `gg` (top), `G` (bottom), `Home/End`
- Search: `/` to filter, `Esc` to clear
- Sort: `s` toggles (dead first/name); `d` dead first; `n` name
- Quit: `q` or `Ctrl+C`

## Build from source
Prereqs: Bun ≥ 1.2.20, Node ≥ 18

```bash
bun install
# Node bundle (dist/cli.js)
bun run build:node
# Native binary (bun compile)
bun run build:binary
```

## Notes
- API URL is mandatory. The app won’t start without `--host`.
- Ignore patterns support: `foo*` (starts with), `*bar` (ends with), `*mid*` (contains). Pass multiple `--ignore` flags or comma‑separate values.
- When selected, dead routers use a bright red background for better contrast. Active services are colored; inactive/down are grey.
