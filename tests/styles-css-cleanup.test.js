const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('Homepage mobile footer padding is declared once in the adjacent 700px media-query block', () => {
  const matches = css.match(/@media\s*\(max-width:\s*700px\)\s*\{[\s\S]*?html body\.home-page \.site-footer\s*\{\s*padding-bottom:\s*6px\s*!important;\s*\}/g) || [];
  assert.equal(matches.length, 1);
  assert.equal((css.match(/html body\.home-page \.site-footer\s*\{\s*padding-bottom:\s*6px\s*!important;\s*\}/g) || []).length, 1);
});

test('Homepage mobile footer cleanup retains safe-area bottom navigation clearance', () => {
  assert.match(css, /@media \(max-width: 700px\) \{\s*html body\.home-page \.site-footer \{\s*padding-bottom: 6px !important;\s*\}\s*html body\.home-page \{\s*padding-bottom: calc\(88px \+ env\(safe-area-inset-bottom\)\) !important;/);
});

 
test('Homepage mobile footer collapses the exact flow space created by the lifted section and keeps a 2px gap', () => {
  assert.match(css, /html body\.home-page \.why-arisu-section > \.why-arisu-card\s*\{[^}]*translate:\s*0 -50px !important/);
  const footerFix = css.slice(css.lastIndexOf('/* AFV368 — Reconcile the mobile footer'));
  assert.match(footerFix, /@media \(max-width: 700px\)/);
  assert.match(footerFix, /html body\.home-page main > section\.site-section\.why-arisu-section\s*\{\s*margin-bottom:\s*-50px !important;/);
  assert.match(footerFix, /html body\.home-page main\s*\{\s*padding-bottom:\s*0 !important;/);
  assert.match(footerFix, /html body\.home-page > footer\.site-footer\s*\{\s*margin-top:\s*2px !important;/);
});
