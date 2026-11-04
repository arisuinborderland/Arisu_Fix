const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'proofs.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'proofs.css'), 'utf8');
const sharedCss = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const moreMenu = fs.readFileSync(path.join(root, 'more-menu.js'), 'utf8');

test('Recovery Proofs moves About and Privacy destinations into the More menu', () => {
  const header = html.match(/<header class="topbar">[\s\S]*?<\/header>/)?.[0] || '';
  assert.doesNotMatch(header, /privacy-link|privacy-about-link|about-header-link/);
  assert.match(moreMenu, /href="\/about\.html"/);
  assert.match(moreMenu, /href="\/privacy\.html"/);
});
test('Recovery Proofs no longer includes the floating Back to Home button', () => { assert.doesNotMatch(html, /proofs-back-to-site/); });
test('Recovery Proofs has five-item bottom navigation and Stories centered', () => { assert.match(html, /class="mobile-bottom-nav"/); assert.match(html, /id="mobileNavStories"/); assert.match(html, /class="mobile-nav-item is-active" href="proofs.html"/); });
test('Recovery Proofs navigation styles are page scoped', () => { assert.match(css, /body\.proofs-document \.mobile-bottom-nav/); });

test('Recovery Proofs reuses the shared default hidden state for bottom navigation', () => {
  const sharedStylesheet = html.indexOf('styles.css?');
  const proofsStylesheet = html.indexOf('proofs.css?');
  assert.ok(sharedStylesheet >= 0 && proofsStylesheet > sharedStylesheet, 'shared CSS must load before Proofs CSS');
  assert.equal((sharedCss.match(/\\.mobile-bottom-nav\\s*\\{\\s*display:\\s*none\\s*;\\s*\\}/g) || []).length, 1);
  assert.doesNotMatch(css, /\\.mobile-bottom-nav\\s*\\{\\s*display:\\s*none\\s*;\\s*\\}/);
  assert.match(css, /html body\\.proofs-document \\.mobile-bottom-nav/);
});
