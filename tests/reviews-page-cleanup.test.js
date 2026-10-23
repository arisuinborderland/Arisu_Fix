'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'reviews.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'reviews.css'), 'utf8');
const cleanup = fs.readFileSync(path.join(root, 'reviews-floating-cleanup.js'), 'utf8');

test('Customer Reviews header contains Privacy Policy and About, not Recovery Proofs', () => {
  const header = html.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0] || '';
  assert.match(header, /class="privacy-link" href="privacy\.html"/);
  assert.match(header, /class="about-header-link" href="about\.html"/);
  assert.doesNotMatch(header, /proofs-header-link|Recovery Proofs/);
});

test('Customer Reviews has no floating home or old Arisu quick-access controls', () => {
  assert.doesNotMatch(html, /reviews-floating-home|id="floatingMenu"|id="floatingWhatsApp"/);
  assert.match(css, /body\.reviews-document \.floating-menu[\s\S]*display:none !important/);
  assert.match(css, /body\.reviews-document #floatingWhatsApp[\s\S]*display:none !important/);
  assert.match(cleanup, /MutationObserver/);
  assert.match(cleanup, /body\.classList\.contains\('reviews-document'\)/);
  assert.match(html, /reviews-floating-cleanup\.js\?v=AFV229/);
});

test('Customer Reviews includes the five-item bottom navigation and Stories viewer', () => {
  const nav = html.match(/<nav class="mobile-bottom-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  assert.match(nav, /href="index\.html" aria-label="Home"/);
  assert.match(nav, /class="mobile-nav-item is-active" href="reviews\.html" aria-label="Customer Reviews"/);
  assert.match(nav, /id="mobileNavStories"/);
  assert.match(nav, /href="proofs\.html" aria-label="Recovery Proofs"/);
  assert.match(nav, /href="index\.html#contact" aria-label="Contact Arisu"/);
  assert.match(html, /id="recoveryStoryViewer"/);
  assert.match(html, /story-viewer\.js\?v=AFV229/);
  assert.match(css, /body\.reviews-document \.mobile-bottom-nav/);
  assert.match(css, /grid-template-columns:minmax\(0,1fr\) auto auto/);
  assert.match(css, /header-meta > \.about-header-link \{ grid-column:3 !important; grid-row:1 !important;/);
});
