const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'reviews.css'), 'utf8');
const sharedHeaderCss = fs.readFileSync(path.join(root, 'site-header.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'reviews.html'), 'utf8');

test('Shared header CSS owns one mobile logo sizing rule for the 700px breakpoint', () => {
  const block = /html body header\.topbar\.site-header>a\.brand>\.logo\s*\{[^}]*flex:\s*0 0 39px!important;[^}]*width:\s*39px!important;[^}]*height:\s*39px!important;[^}]*\}/g;
  assert.equal([...sharedHeaderCss.matchAll(block)].length, 1);
});

test('Shared header CSS owns one mobile brand-small typography rule for the 700px breakpoint', () => {
  const block = /html body header\.topbar\.site-header \.brand-copy>small\s*\{[^}]*font-size:\s*11px!important;[^}]*line-height:\s*1\.2!important;[^}]*\}/g;
  assert.equal([...sharedHeaderCss.matchAll(block)].length, 1);
});

test('Shared header CSS owns one compact logo sizing rule for the 380px breakpoint', () => {
  const block = /html body header\.topbar\.site-header>a\.brand>\.logo\s*\{[^}]*flex-basis:\s*37px!important;[^}]*width:\s*37px!important;[^}]*height:\s*37px!important;[^}]*\}/g;
  assert.equal([...sharedHeaderCss.matchAll(block)].length, 1);
});

test('Reviews page loads the current release CSS and script cache tokens', () => {
  assert.match(html, /reviews\.css\?v=AFV\d+/);
  assert.match(html, /story-viewer\.js\?v=AFV\d+/);
  assert.doesNotMatch(html, new RegExp('\\?v=AFV' + '251'));
});
