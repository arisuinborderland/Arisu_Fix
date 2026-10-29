const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'reviews.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'reviews.html'), 'utf8');

test('Reviews CSS keeps one mobile logo sizing rule for the 700px breakpoint', () => {
  const block = /html body\.reviews-document \.topbar > \.brand \.logo\s*\{\s*width:\s*43px !important;\s*height:\s*43px !important;\s*flex:\s*0 0 43px !important;\s*border-radius:\s*13px !important;\s*\}/g;
  assert.equal([...css.matchAll(block)].length, 1);
});

test('Reviews CSS keeps one mobile brand-small typography rule for the 700px breakpoint', () => {
  const block = /html body\.reviews-document \.topbar > \.brand small\s*\{\s*margin-top:\s*3px !important;\s*font-size:\s*11px !important;\s*line-height:\s*1\.2 !important;\s*\}/g;
  assert.equal([...css.matchAll(block)].length, 1);
});

test('Reviews CSS keeps one compact logo sizing rule for the 380px breakpoint', () => {
  const block = /html body\.reviews-document \.topbar > \.brand \.logo\s*\{\s*width:\s*39px !important;\s*height:\s*39px !important;\s*flex-basis:\s*39px !important;\s*\}/g;
  assert.equal([...css.matchAll(block)].length, 1);
});

test('Reviews CSS does not retain superseded AFV277 narrow-width overrides', () => {
  assert.doesNotMatch(css, /AFV277 — use homepage-canonical header button widths at narrow phone sizes/);
  assert.match(css, /@media \\(max-width:760px\\)[\\s\\S]*?html body\\.reviews-document header\\.topbar > \\.header-meta > \\.privacy-link \\{ width:128px !important; min-width:128px !important; \\}/);
  assert.match(css, /@media \\(max-width:380px\\)[\\s\\S]*?html body\\.reviews-document header\\.topbar > \\.header-meta > \\.privacy-link \\{ width:116px !important; min-width:116px !important; \\}/);
});

test('Reviews page loads the current release CSS and script cache tokens', () => {
  assert.match(html, /reviews\.css\?v=AFV\d+/);
  assert.match(html, /story-viewer\.js\?v=AFV\d+/);
  assert.doesNotMatch(html, new RegExp('\\?v=AFV' + '251'));
});
