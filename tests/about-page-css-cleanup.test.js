const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'about-page.css'), 'utf8');

test('About page mobile spacing does not retain superseded floating-button clearance values', () => {
  assert.doesNotMatch(css, /padding-bottom:\s*76px\s*!important/);
  assert.match(css, /body\.about-page \.about-page-main\s*\{\s*padding-bottom:\s*2px\s*!important/);
});

test('About page stylesheet has no empty CSS rule blocks after cleanup', () => {
  assert.doesNotMatch(css, /[^{}]+\{\s*\}/);
});
