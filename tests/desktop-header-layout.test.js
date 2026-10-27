'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const css = read('desktop-header.css');
const pages = ['index.html', 'reviews.html', 'proofs.html', 'privacy.html', 'about.html'];

test('Desktop header spans the viewport with responsive outer gutters', () => {
  assert.match(css, /@media\s*\(min-width:\s*701px\)/);
  assert.match(css, /padding:\s*8px clamp\(20px, 2vw, 36px\) !important/);
  for (const pageClass of ['home-page', 'reviews-document', 'proofs-document', 'privacy-page', 'about-page']) {
    assert.match(css, new RegExp('body\\.' + pageClass + ' header\\.topbar'));
  }
});

test('Desktop header actions share the same size, palette, icon dimensions, and focus treatment', () => {
  assert.match(css, /height:\s*44px !important/);
  assert.match(css, /width:\s*164px !important/);
  assert.match(css, /width:\s*124px !important/);
  assert.match(css, /border-radius:\s*14px !important/);
  assert.match(css, /background:\s*linear-gradient\(135deg, rgba\(255,255,255,\.98\), rgba\(239,243,255,\.96\)\) !important/);
  assert.match(css, /width:\s*18px !important;\s*height:\s*18px !important;\s*flex:\s*0 0 18px !important/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /header SVG icons visible on pale desktop buttons/);
  assert.match(css, /\.header-icon \*[,\s\S]*stroke: #263a61 !important/);
});

test('All public pages load the shared header stylesheet after page-specific stylesheets', () => {
  for (const page of pages) {
    const html = read(page);
    const links = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
    const last = links.at(-1)?.[1];
    assert.equal(last, 'desktop-header.css?v=AFV319', page + ' must load the common header stylesheet last');
  }
});

test('Production build allowlist includes the shared header stylesheet', () => {
  assert.match(read('build.js'), /"desktop-header\.css"/);
});

test('Mobile header styles are not declared in the desktop-only override', () => {
  assert.doesNotMatch(css, /@media\s*\(max-width:/);
});

test('Desktop homepage proof previews display both source composites side by side with contain sizing', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV322 desktop proof previews: show both complete composite images side by side')[1];
  assert.ok(desktopFix, 'AFV322 desktop proof preview block must exist');
  assert.match(desktopFix, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(desktopFix, /aspect-ratio:\s*8 \/ 7 !important/);
  assert.match(desktopFix, /object-fit:\s*contain !important/);
  assert.match(desktopFix, /height:\s*410px !important/);
});



