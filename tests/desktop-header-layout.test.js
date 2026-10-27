'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const css = read('desktop-header.css');
const pages = ['index.html', 'reviews.html', 'proofs.html', 'privacy.html', 'about.html'];

test('Shared desktop header rules use one centered 1080px content alignment', () => {
  assert.match(css, /@media\s*\(min-width:\s*701px\)/);
  assert.match(css, /padding:\s*18px max\(22px, calc\(\(100% - 1080px\) \/ 2\)\) !important/);
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
