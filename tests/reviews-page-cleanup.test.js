'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'reviews.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'reviews.css'), 'utf8');
const cleanup = fs.readFileSync(path.join(root, 'reviews-floating-cleanup.js'), 'utf8');

test('Customer Reviews header omits moved About and Privacy buttons while destinations remain in More menu', () => {
  const header = html.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0] || '';
  const menu = fs.readFileSync(path.join(root, 'more-menu.js'), 'utf8');
  assert.doesNotMatch(header, /privacy-link|privacy-about-link|about-header-link/);
  assert.doesNotMatch(header, /proofs-header-link|Recovery Proofs/);
  assert.match(menu, /href="\/about\.html"/);
  assert.match(menu, /href="\/privacy\.html"/);
  assert.match(fs.readFileSync(path.join(root, 'about.html'), 'utf8'), /<title[^>]*>About/i);
  assert.match(fs.readFileSync(path.join(root, 'privacy.html'), 'utf8'), /<title[^>]*>Privacy/i);
});

test('Customer Reviews has no floating home or old Arisu quick-access controls', () => {
  assert.doesNotMatch(html, /reviews-floating-home|id="floatingMenu"|id="floatingWhatsApp"/);
  assert.match(css, /body\.reviews-document \.floating-menu[\s\S]*display:none !important/);
  assert.match(css, /body\.reviews-document #floatingWhatsApp[\s\S]*display:none !important/);
  assert.match(cleanup, /MutationObserver/);
  assert.match(cleanup, /body\.classList\.contains\('reviews-document'\)/);
  assert.match(html, /reviews-floating-cleanup\.js\?v=AFV\d+/);
});

test('Customer Reviews includes the five-item bottom navigation and Stories viewer', () => {
  const nav = html.match(/<nav class="mobile-bottom-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  assert.match(nav, /href="index\.html" aria-label="Home"/);
  assert.match(nav, /class="mobile-nav-item is-active" href="reviews\.html" aria-label="Customer Reviews"/);
  assert.match(nav, /id="mobileNavStories"/);
  assert.match(nav, /href="proofs\.html" aria-label="Recovery Proofs"/);
  assert.match(nav, /<button class="mobile-nav-item mobile-nav-more" type="button" aria-label="More options"/);
  assert.match(html, /id="recoveryStoryViewer"/);
  assert.match(html, /story-viewer\.js\?v=AFV\d+/);
  assert.match(css, /body\.reviews-document \.mobile-bottom-nav/);
  assert.match(css, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});
