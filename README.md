# Magic Storybook ✨

Interactive mobile reading prototypes exploring modern UI and interaction paradigms for illustrated children's storybooks, featuring tactile peek-a-boo flaps and progressive layer reveals.

## Overview

This repository explores 5 distinct reading experiences for mobile and desktop web, demonstrating how children's lift-the-flap picture books can be reimagined digitally:

1. **Responsive 3D Flipbook** (`/page-flip/`)  
   Realistic 3D page turns (`flipbook-js` + custom CSS 3D transforms), dual-page spread on desktop, single-page touch-step navigation on mobile, and 3D flap-lift interactions.

2. **Horizontal Story Strip** (`/sidescroll-cards/`)  
   Horizontal landscape scroll with pill progress tracking, snap positioning, and interactive peek-a-boo flaps.

3. **Continuous Story Panorama** (`/sidescroll-panorama/`)  
   Continuous side-scrolling panoramic world with an infinite looping illustrated backdrop, scripted animated sprites (butterflies, soaring songbirds, hot air balloons), and scroll-anchored morphing transitions between character layers.

4. **Vertical Storyboard** (`/vertical-story/`)  
   Modern full-screen vertical snap-scroll (social story / feed style) with right-edge chapter progress dots and tap-to-reveal flaps.

5. **Story Cards Deck** (`/story-cards/`)  
   Full-screen tap-to-advance card deck with segmented top progress bars (Instagram Stories / Tinder deck style) for focused, distraction-free illustration display.

---

## Shared Architecture

All 5 prototypes dynamically render from a single centralized story specification:

- **Source of Truth**: [`resources/story-board.json`](file:///home/leslie/Downloads/photos/For%20sherry/resources/story-board.json) defines all chapters, titles, narrative text, character attributes, and layer asset paths.
- **Visual Assets**: Contained in `resources/png/` and `resources/jpg/`, featuring stylized fictional storybook characters (**Aria**, **Leo**, and **Felix**) with upper/lower flap layers.
- **Silent & Accessible**: Built without external audio/sound effects for a clean, peaceful reading experience across all devices.

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

---

## Automated Verification

Headless CDP test script for verifying dynamic rendering across all 5 UIs:

```bash
uv run node scratch/test-all-5-uis-dynamic.mjs
```
