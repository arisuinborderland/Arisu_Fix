'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const protection = fs.readFileSync(path.join(root, 'image-protection.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('bottom navigation suppresses context menus and drag actions without removing tap navigation', () => {
  assert.match(protection, /closest\("\.mobile-bottom-nav"\)/);
  assert.match(protection, /inProtectedArea\(event\.target\) \|\| inBottomNavigation\(event\.target\)/);
  assert.match(css, /mobile-bottom-nav \{[\s\S]{0,240}-webkit-touch-callout:none/);
  assert.match(css, /mobile-nav-story-avatar img \{[\s\S]{0,240}pointer-events:none/);
  assert.match(html, /id="mobileNavStories"/);
  assert.match(html, /href="reviews\.html" aria-label="Customer Reviews"/);
});


test('bottom navigation uses the permanent More control', () => {
  const nav = html.match(/<nav class="mobile-bottom-nav"[\s\S]*?<\/nav>/)?.[0] || '';
  assert.match(nav, /<button class="mobile-nav-item mobile-nav-more" type="button" aria-label="More options"/);
  assert.doesNotMatch(nav, /aria-label="Contact Arisu"|<span>Contact<\/span>/);
  const moreMenu = fs.readFileSync(path.join(root, 'more-menu.js'), 'utf8');
  assert.match(moreMenu, /nav\.querySelector\\('button\.mobile-nav-more/);
  assert.doesNotMatch(moreMenu, /contactLink|replaceWith\(moreButton\)|createElement\('button'\)/);
});
