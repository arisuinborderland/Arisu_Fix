'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'reviews.html', 'proofs.html', 'about.html', 'privacy.html'];

test('AFV494 renders More in the HTML before JavaScript runs on every public page', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const nav = html.match(/<nav class="mobile-bottom-nav"[\s\S]*?<\/nav>/)?.[0] || '';
    assert.match(nav, /<button class="mobile-nav-item mobile-nav-more" type="button" aria-label="More options"/, page);
    assert.doesNotMatch(nav, /aria-label="Contact Arisu"|<span>Contact<\/span>/, page);
    assert.match(html, /more-menu\.js\?v=AFV494/, page);
  }
});

test('AFV494 More menu initializes the existing control without replacing Contact', () => {
  const script = fs.readFileSync(path.join(root, 'more-menu.js'), 'utf8');
  assert.match(script, /nav\.querySelector\('button\.mobile-nav-more\[aria-controls="arisuMoreMenu"\]'\)/);
  assert.doesNotMatch(script, /contactLink|replaceWith\(moreButton\)|createElement\('button'\)/);
  assert.match(script, /href="\/about\.html"/);
  assert.match(script, /href="\/privacy\.html"/);
});
