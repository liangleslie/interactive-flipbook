# Sherry's Magic Storybook ✨

Interactive 3D children's flipbook web application built with HTML, CSS, JavaScript, and Vite.

## Features

- **3D Page Turning**: Realistically flips pages using 3D perspective transforms with spine shading and cover mechanics.
- **Interactive Peek-a-Boo Flaps**: Click character illustrations to flip up flaps in 3D (`rotateX`) and reveal lower art underneath.
- **Procedural Audio**: Page turn sound synthesized procedurally in real-time via the Web Audio API (zero audio asset dependencies).
- **Offline Single-File Bundle**: Packaged into a standalone `distro.html` with all images, styles, and scripts inlined as Base64 data URIs for email and offline distribution.

## Development

Prerequisites: Node.js (v20+) or `uv`.

```bash
# Install dependencies
uv run npm install

# Start local dev server
uv run npm run dev
```

Server runs by default at `http://localhost:5173/`.

## Building Single-File Offline Distribution

To compile and package everything into the standalone `distro.html`:

```bash
# 1. Build Vite production bundle
uv run npm run build

# 2. Bundle into single self-contained distro.html
uv run node bundle.mjs
```

The resulting `distro.html` can be opened directly by double-clicking in any modern web browser or sent as an email attachment without hosting.

## Self-Check Tests

Run automated headless navigation and layer-transition checks:

```bash
uv run node test-check.mjs
```

## Tech Stack

- **Vite**: Build tool and dev server
- **flipbook-js**: Core 3D page flip engine (with custom boundary & z-index patches)
- **Vanilla CSS**: Custom 3D animations, responsive layout, glassmorphic UI controls
- **Web Audio API**: Procedural noise and bandpass-filtered page turn sound
