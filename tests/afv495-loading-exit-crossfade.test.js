'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV495 uses one uniform overlay fade without a nested card fade', () => {
  const css = read('loading-screen.css');
  const exitRule = css.match(/#arisu-loading-screen\.is-ready\s*\{[^}]*\}/)?.[0] || '';
  assert.match(exitRule, /transition:\s*opacity \.42s ease-in, visibility \.42s ease-in/);
  assert.match(exitRule, /opacity:\s*0/);
  assert.doesNotMatch(css, /#arisu-loading-screen\.is-ready \.boot-window\s*\{[^}]*opacity|#arisu-loading-screen\.is-ready \.boot-window\s*\{[^}]*animation/);
  assert.doesNotMatch(css, /arisu-loading-card-fade-out|@keyframes arisu-loading-card-fade-out/);
});

test('AFV495 refreshes the loading stylesheet cache token and preserves startup behavior', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  assert.match(html, /loading-screen\.css\?v=AFV495&sessionguard=1&firstpaint=6/);
  assert.match(html, /loading-screen\.js\?v=AFV491&sessionguard=3/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV491/);
  assert.match(js, /overlay\.remove\(\)/);
  assert.match(js, /await wait\(500\)/);
  assert.match(js, /\}, 440\)/);
});

test('AFV495 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '495.0.0');
  assert.equal(lock.version, '495.0.0');
  assert.equal(lock.packages[''].version, '495.0.0');
  assert.ok(readme.includes('Current release: AFV495'));
  assert.ok(history.includes('AFV495 — Remove Loading Screen Exit Ghosting'));
});
