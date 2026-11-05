const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'reviews.css'), 'utf8');
const sharedHeaderCss = fs.readFileSync(path.join(root, 'site-header.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'reviews.html'), 'utf8');

test('Shared header CSS keeps one base, one mobile, and one compact logo rule', () => {
  const logoRule = /html body header\.topbar\.site-header>a\.brand>\.logo\s*\{/g;
  assert.equal([...sharedHeaderCss.matchAll(logoRule)].length, 3);
  assert.match(sharedHeaderCss, /flex:0 0 44px!important;width:44px!important;height:44px!important/);
  assert.match(sharedHeaderCss, /flex-basis:42px!important;width:42px!important;height:42px!important/);
});

test('Shared header CSS keeps the 700px mobile brand subtitle typography', () => {
  assert.ok(sharedHeaderCss.includes('.brand-copy>small.brand-subtitle {'));
});

test('Shared header CSS keeps the compact 380px brand subtitle typography', () => {
  assert.ok(sharedHeaderCss.includes('font-size:8.5px!important;letter-spacing:.5px!important'));
});

test('Reviews page loads the current release CSS and script cache tokens', () => {
  assert.match(html, /reviews\.css\?v=AFV\d+/);
  assert.match(html, /story-viewer\.js\?v=AFV\d+/);
  assert.doesNotMatch(html, new RegExp('\\?v=AFV' + '251'));
});
