'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV497 keeps the card opaque while the background layer fades', () => {
  const css = read('loading-screen.css');
  const html = read('index.html');
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
  assert.match(css, /#arisu-loading-screen::before\s*\{[^}]*transition:\s*opacity \.42s ease-in/);
  assert.match(css, /#arisu-loading-screen\.is-ready::before\s*\{\s*opacity:\s*0/);
  assert.match(css, /#arisu-loading-screen \.boot-window\s*\{[^}]*background:\s*#fff/);
  assert.match(css, /#arisu-loading-screen\.is-ready \.boot-window > \*\s*\{\s*opacity:\s*0/);
  assert.match(html, /loading-screen-critical-guard[^>]*>[\s\S]*?background:#f3f5f9;/);
  assert.doesNotMatch(html, /loading-screen-critical-guard[^>]*>[\s\S]*?backdrop-filter:blur/);
});

test('AFV497 refreshes the loading stylesheet cache token and preserves startup behavior', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  assert.match(html, /loading-screen\.css\?v=AFV497&sessionguard=1&firstpaint=8/);
  assert.match(html, /loading-screen\.js\?v=AFV491&sessionguard=3/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV491/);
  assert.match(js, /overlay\.remove\(\)/);
  assert.match(js, /await wait\(500\)/);
  assert.match(js, /\}, 440\)/);
});

test('AFV497 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '497.0.0');
  assert.equal(lock.version, '497.0.0');
  assert.equal(lock.packages[''].version, '497.0.0');
  assert.ok(readme.includes('Current release: AFV497'));
  assert.ok(history.includes('AFV497 — Isolate loading background fade from opaque card'));
});
