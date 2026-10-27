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

test('Desktop homepage recovery-proof previews fill their card width using cover sizing', () => {
  const homeStyles = read('styles.css');
  assert.match(homeStyles, /AFV320 desktop proof previews: fill the full card with the screenshots/);
  assert.match(homeStyles, /html body\.home-page \.social-collage > \.recovery-proofs-showcase \.recovery-proof-preview-item img\s*\{[\s\S]*?object-fit:\s*cover !important;[\s\S]*?object-position:\s*center 42% !important/);
});



