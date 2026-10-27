# Magic Storybook ✨

Interactive mobile reading prototypes exploring modern UI and interaction paradigms for illustrated children's storybooks, featuring tactile peek-a-boo flaps, multi-act panoramic environments, and progressive layer reveals.

## Overview

This repository explores 5 distinct reading experiences for mobile and desktop web, demonstrating how children's lift-the-flap picture books can be reimagined digitally:

1. **Responsive 3D Flipbook** (`/page-flip/`)  
   Realistic 3D page turns (`flipbook-js` + custom CSS 3D transforms), dual-page spread on desktop, single-page touch-step navigation on mobile, act divider spreads, and 3D flap-lift interactions.

2. **Horizontal Story Strip** (`/sidescroll-cards/`)  
   Horizontal landscape scroll with pill progress tracking, snap positioning, act divider cards, and interactive peek-a-boo flaps.

3. **Continuous Story Panorama** (`/sidescroll-panorama/`)  
   Continuous side-scrolling panoramic world with multi-act dynamic backdrop transitions (smooth crossfade between Act I and Act II environments), animated landmark journey trail tracker, ambient floating kinetic lyrics parallax layers, scripted animated sprites (butterflies, soaring songbirds, fireflies, hot air balloons), background audio toggle controller, and scroll-anchored morphing transitions between character layers.

4. **Vertical Storyboard** (`/vertical-story/`)  
   Modern full-screen vertical snap-scroll (social story / feed style) with right-edge chapter progress dots, section dividers, and tap-to-reveal flaps.

5. **Story Cards Deck** (`/story-cards/`)  
   Full-screen tap-to-advance card deck with segmented top progress bars (Instagram Stories / Tinder deck style), act dividers, and focused illustration display.

---

## Shared Architecture

All 5 prototypes dynamically render from a centralized story specification:

- **Source of Truth**: [`resources/story-board.json`](file:///home/leslie/Downloads/photos/For%20sherry/resources/story-board.json) defines all chapters, titles, narrative beats (`narrative` + `narrative2`), character attributes, act dividers (`type: "divider"`), and layer asset paths.
- **Multi-Act Environmental Backdrops**: High-resolution panorama backdrops in `resources/jpg/` (`panorama_boardgame.jpg` for Act I and `office-pano.jpg` for Act II), with seamless runtime crossfading based on scene assignments.
- **Visual Assets**: Contained in `resources/png/` and `resources/jpg/`, featuring stylized storybook characters (**Aria**, **Leo**, and **Felix**) with upper/lower flap layers.
- **Ambient Lyrics Engine**: In `resources/lyrics.json`, feeding the continuous panorama's multi-depth kinetic parallax layers.
- **Audio Experience**: Built-in background audio element (`resources/bgm.mp3` or fallback) with ambient music toggle button and animated sound bars.

---

## Getting Started

### Prerequisites
- Node.js (v20+) or [`uv`](https://github.com/astral-sh/uv).

### Development Server
```bash
# Install dependencies
uv run npm install

# Start Vite dev server
uv run npm run dev
```

The prototype portal will be available at `http://localhost:5173/`.

### Production Build
```bash
uv run npm run build
```

Compiled bundles for all 5 prototypes and the portal are output to `dist/`.

### Standalone Distribution Bundle (Single HTML)

To package a prototype into a completely self-contained, offline-ready single HTML file with all images, stylesheets, scripts, audio, and storyboard data inlined:

```bash
# Package continuous panorama (default) -> dist/distro.html
uv run node bundle.mjs --panorama
# or via npm script:
uv run npm run bundle -- --panorama

# Package responsive 3D flipbook -> dist/distro.html
uv run node bundle.mjs --flip

# Package horizontal story strip -> dist/distro.html
uv run node bundle.mjs --cards

# Package vertical storyboard -> dist/distro.html
uv run node bundle.mjs --vertical

# Package story cards deck -> dist/distro.html
uv run node bundle.mjs --deck

# Package all prototypes + portal hub into dist/
uv run node bundle.mjs --all

# Custom output file
uv run node bundle.mjs --ui panorama -o ./dist/custom-storybook.html

# Run packaging integrity check across all prototypes
uv run node bundle.mjs --check
```

Output files are saved directly to `dist/` (e.g. `dist/distro.html`) and can be distributed or opened directly via `file://` in any browser without needing a web server.

---

## Automated Verification & Test Suites

Headless Chrome CDP test suites for automated verification of engine features:

```bash
# 1. Flipbook boundary guards and spread transition integrity
uv run node test-check.mjs

# 2. Continuous panorama journey line geometry and landmark tracking
uv run node test-journey-line.mjs

# 3. Keyframe snapping and scene pin boundary calculations
uv run node test-keyframe-snapping.mjs

# 4. Multi-depth kinetic parallax lyrics engine
uv run node test-panorama-lyrics.mjs

# 5. Background audio toggle controller and playback states
uv run node test-bgm-audio.mjs
```
