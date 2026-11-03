const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'reviews.css'), 'utf8');
const sharedHeaderCss = fs.readFileSync(path.join(root, 'site-header.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'reviews.html'), 'utf8');

function countOccurrences(source, value) {
  return source.split(value).length - 1;
}

test('Shared header CSS owns one mobile logo sizing rule for the 700px breakpoint', () => {
  const selector = 'html body header.topbar.site-header>a.brand>.logo';
  assert.equal(countOccurrences(sharedHeaderCss, selector), 3);
  assert.match(sharedHeaderCss, /flex:0 0 39px!important;width:39px!important;height:39px!important/);
});

test('Shared header CSS keeps the 700px mobile brand subtitle typography', () => {
  assert.match(sharedHeaderCss, /\.brand-copy>small \{margin:0!important;font-size:11px!important;line-height:1\.2!important\}/);
});

test('Shared header CSS keeps the compact 380px logo dimensions', () => {
  assert.match(sharedHeaderCss, /\.brand>\.logo \{flex-basis:37px!important;width:37px!important;height:37px!important\}/);
});

test('Reviews page loads the current release CSS and script cache tokens', () => {
  assert.match(html, /reviews\.css\?v=AFV\d+/);
  assert.match(html, /story-viewer\.js\?v=AFV\d+/);
  assert.doesNotMatch(html, new RegExp('\\?v=AFV' + '251'));
});
