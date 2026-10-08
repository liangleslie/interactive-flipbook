#!/usr/bin/env node
// Bundle dist/ into a single self-contained HTML file
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const DIST = './dist';
const OUT = './distro.html';

let html = readFileSync(join(DIST, 'index.html'), 'utf-8');

// Build asset map: filename -> base64 data URI (for images) or raw content (for css/js)
const assets = {};
for (const f of readdirSync(join(DIST, 'assets'))) {
  const full = join(DIST, 'assets', f);
  const ext = extname(f).toLowerCase();
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.webp' || ext === '.svg') {
    const mime = ext === '.svg' ? 'image/svg+xml' : `image/${ext.slice(1).replace('jpg', 'jpeg')}`;
    const b64 = readFileSync(full).toString('base64');
    assets[f] = { type: 'image', dataUri: `data:${mime};base64,${b64}` };
  } else if (ext === '.css') {
    assets[f] = { type: 'css', content: readFileSync(full, 'utf-8') };
  } else if (ext === '.js') {
    assets[f] = { type: 'js', content: readFileSync(full, 'utf-8') };
  }
}

// Replace image src="/assets/xxx.png" with data URIs (in HTML and later in CSS/JS)
function replaceImageRefs(text) {
  for (const [filename, asset] of Object.entries(assets)) {
    if (asset.type !== 'image') continue;
    // Match /assets/filename or ./assets/filename
    const patterns = [`/assets/${filename}`, `./assets/${filename}`];
    for (const p of patterns) {
      text = text.replaceAll(p, asset.dataUri);
    }
  }
  return text;
}

// Inline CSS: replace <link rel="stylesheet" ... href="/assets/xxx.css"> with <style>
for (const [filename, asset] of Object.entries(assets)) {
  if (asset.type !== 'css') continue;
  const cssContent = replaceImageRefs(asset.content);
  const linkRegex = new RegExp(`<link[^>]*href=["']/assets/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'g');
  html = html.replace(linkRegex, `<style>${cssContent}</style>`);
}

// Inline JS: replace <script ... src="/assets/xxx.js"></script> with inline <script>
for (const [filename, asset] of Object.entries(assets)) {
  if (asset.type !== 'js') continue;
  const jsContent = replaceImageRefs(asset.content);
  const scriptRegex = new RegExp(`<script[^>]*src=["']/assets/${filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*></script>`, 'g');
  html = html.replace(scriptRegex, `<script type="module">${jsContent}</script>`);
}

// Replace any remaining image references in the HTML body
html = replaceImageRefs(html);

// Inline Google Fonts as a preload hint + keep the external link
// (fonts can't be easily inlined, but they're cached/optional — the page still works offline with fallback fonts)

writeFileSync(OUT, html, 'utf-8');

const sizeMB = (Buffer.byteLength(html, 'utf-8') / 1024 / 1024).toFixed(2);
console.log(`✅ Created ${OUT} (${sizeMB} MB)`);
