'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'proofs.html'), 'utf8');
const moreMenu = fs.readFileSync(path.join(root, 'more-menu.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'proofs.css'), 'utf8');

test('Recovery Proofs uses the shared More menu for About and Privacy destinations', () => {
  const header = html.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0] || '';
  assert.doesNotMatch(header, /privacy-link|privacy-about-link|about-header-link/);
  assert.match(html, /more-menu\.js\?v=AFV\d+/);
  assert.match(moreMenu, /href="\/about\.html"/);
  assert.match(moreMenu, /href="\/privacy\.html"/);
});

test('Recovery Proofs retains its page-scoped five-item bottom navigation', () => {
  assert.match(html, /class="mobile-bottom-nav"/);
  assert.match(html, /id="mobileNavStories"/);
  assert.match(html, /class="mobile-nav-item is-active" href="proofs\.html"/);
  assert.match(css, /body\.proofs-document \.mobile-bottom-nav/);
});

test('Recovery Proofs no longer includes the floating Back to Home button', () => {
  assert.doesNotMatch(html, /proofs-back-to-site/);
});
