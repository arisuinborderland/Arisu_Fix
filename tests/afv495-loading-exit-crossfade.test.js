'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV496 uses one uniform overlay fade without a nested card fade', () => {
  const css = read('loading-screen.css');
  const baseCss = css.split('/* Consolidated reduced-motion support for the standalone loading page. */')[0];
  const baseRule = baseCss.match(/#arisu-loading-screen\s*\{[^}]*\}/)?.[0] || '';
  const visibleRule = baseCss.match(/#arisu-loading-screen\.is-visible:not\(\.is-ready\)\s*\{[^}]*\}/)?.[0] || '';
  const exitRule = baseCss.match(/#arisu-loading-screen\.is-ready\s*\{[^}]*\}/)?.[0] || '';
  assert.match(baseRule, /transition:\s*opacity \.42s ease-in, visibility 0s linear \.42s/);
  assert.match(visibleRule, /transition:\s*none/);
  assert.match(exitRule, /opacity:\s*0/);
  assert.match(exitRule, /visibility:\s*hidden/);
  assert.doesNotMatch(exitRule, /transition:/);
  assert.doesNotMatch(baseCss, /#arisu-loading-screen\.is-ready\s+\.boot-window\s*\{/);
  assert.doesNotMatch(css, /arisu-loading-card-fade-out|@keyframes arisu-loading-card-fade-out/);
});

test('AFV496 refreshes the loading stylesheet cache token and preserves startup behavior', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  assert.match(html, /loading-screen\.css\?v=AFV496&sessionguard=1&firstpaint=7/);
  assert.match(html, /loading-screen\.js\?v=AFV491&sessionguard=3/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV491/);
  assert.match(js, /overlay\.remove\(\)/);
  assert.match(js, /await wait\(500\)/);
  assert.match(js, /\}, 440\)/);
});

test('AFV496 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '496.0.0');
  assert.equal(lock.version, '496.0.0');
  assert.equal(lock.packages[''].version, '496.0.0');
  assert.ok(readme.includes('Current release: AFV496'));
  assert.ok(history.includes('AFV496 — Delay overlay visibility until fade completes'));
});
