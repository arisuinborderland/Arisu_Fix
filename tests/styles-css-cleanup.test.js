const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('Homepage mobile footer uses one consolidated full-bleed layout block', () => {
  const matches = css.match(/\/\* Homepage mobile footer: full-bleed surface, compact link grid, centered copyright\. \*\/[\s\S]*?@media \(max-width: 700px\) \{[\s\S]*?html body\.home-page \.site-footer \{[\s\S]*?border-radius: 0 !important;[\s\S]*?\n\}/g) || [];
  assert.equal(matches.length, 1);
});

test('Homepage mobile footer keeps the About card, two-column links, and centered copyright divider', () => {
  assert.match(css, /html body\.home-page \.site-footer > \.about-link-section \.about-page-cta \{[\s\S]*?width: 100% !important;/);
  assert.match(css, /html body\.home-page \.site-footer > \.footer-links \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important;/);
  assert.match(css, /html body\.home-page \.site-footer > \.footer-links > \.footer-copyright \{[\s\S]*?grid-column: 1 \/ -1 !important;[\s\S]*?justify-content: center !important;[\s\S]*?border-top: 1px solid #DCE4F0 !important;/);
});

test('Homepage mobile footer retains safe-area clearance for bottom navigation', () => {
  assert.match(css, /@media \(max-width: 700px\) \{\s*html body\.home-page \{\s*padding-bottom: calc\(56px \+ env\(safe-area-inset-bottom\)\) !important;/);
});
