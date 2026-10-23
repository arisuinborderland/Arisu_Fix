const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'proofs.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'proofs.html'), 'utf8');

test('Recovery Proofs header actions use homepage-matched desktop geometry', () => {
  assert.match(css, /html body\.proofs-document \.topbar > \.header-meta > \.privacy-link[\s\S]*?padding-left: 17px !important/);
  assert.match(css, /html body\.proofs-document \.topbar > \.header-meta > \.about-header-link[\s\S]*?padding-left: 16px !important/);
  assert.match(css, /min-height: 44px !important;[\s\S]*?height: 44px !important;/);
});

test('Recovery Proofs header actions use homepage-matched compact mobile geometry', () => {
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?height: 36px !important;[\s\S]*?font-size: 11px !important;/);
  assert.match(css, /@media \(max-width: 380px\)[\s\S]*?height: 34px !important;[\s\S]*?font-size: 10px !important;/);
});

test('Recovery Proofs includes only the page-scoped header actions', () => {
  assert.match(html, /class="privacy-link"/);
  assert.match(html, /class="about-header-link"/);
  assert.doesNotMatch(html, /proofs-back-to-site/);
});
