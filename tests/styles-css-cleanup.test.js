const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('Homepage mobile outer footer container starts 2px below the Remember card', () => {
  assert.match(css, /@media \(max-width: 700px\) \{\s*html body\.home-page > footer\.site-footer \{\s*margin-top: 2px !important;\s*\}\s*\}/);
});

test('Homepage mobile footer cleanup retains safe-area bottom navigation clearance', () => {
  assert.match(css, /@media \(max-width: 700px\) \{\s*html body\.home-page \.site-footer \{\s*padding-bottom: 6px !important;\s*\}\s*html body\.home-page \{\s*padding-bottom: calc\(88px \+ env\(safe-area-inset-bottom\)\) !important;/);
});
