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

test('AFV323 desktop homepage proof previews mask cyan rails and keep square source composites intact', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV323 desktop-only preview polish.')[1];
  assert.ok(desktopFix, 'AFV323 desktop preview block must exist');
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /aspect-ratio:\s*1 \/ 1 !important/);
  assert.match(desktopFix, /object-fit:\s*contain !important/);
  assert.match(desktopFix, /recovery-proof-preview-item::after/);
  assert.match(desktopFix, /background-size:\s*4\.2% 67%, 5\.5% 67%, 4\.2% 67%/);
  assert.match(desktopFix, /height:\s*410px !important/);
});


test('Desktop homepage proof previews align at the top with no extra inset', () => {
  const homeStyles = read('styles.css');
  const alignFix = homeStyles.split('AFV323 desktop thumbnail top alignment: remove the extra top inset and align each source at the top.')[1];
  assert.ok(alignFix, 'desktop-only proof thumbnail alignment block must exist');
  assert.match(alignFix, /@media \(min-width: 761px\)/);
  assert.match(alignFix, /align-items:\s*start !important/);
  assert.match(alignFix, /margin-top:\s*0 !important/);
  assert.match(alignFix, /object-position:\s*top center !important/);
});
test('Homepage cache key refreshes desktop proof thumbnail alignment', () => {
  const html = read('index.html');
  assert.match(html, /styles\.css\?v=AFV323&proofalign=top1/);
});
