const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'about-page.css'), 'utf8');

test('About page mobile layout reserves space for the fixed bottom navigation', () => {
  assert.doesNotMatch(css, /padding-bottom:\s*76px\s*!important/);
  assert.match(css, /html body\.about-page\s*\{\s*padding-bottom:\s*calc\(84px \+ env\(safe-area-inset-bottom,0px\)\) !important/);
});

test('About page stylesheet has no empty CSS rule blocks after cleanup', () => {
  assert.doesNotMatch(css, /[^{}]+\{\s*\}/);
});
