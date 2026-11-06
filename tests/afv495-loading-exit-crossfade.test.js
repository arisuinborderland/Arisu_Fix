'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV499 keeps the card opaque while the background layer fades', () => {
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
  assert.match(css, /#arisu-loading-screen \.boot-window::before\s*\{[\s\S]*?background:\s*#fff/);
  assert.match(css, /#arisu-loading-screen\.is-ready \.boot-window::before,[\s\S]*?opacity:\s*0/);
  assert.match(html, /loading-screen-critical-guard[^>]*>[\s\S]*?background:#f3f5f9;/);
  assert.doesNotMatch(html, /loading-screen-critical-guard[^>]*>[\s\S]*?backdrop-filter:blur/);
});

test('AFV499 refreshes the loading stylesheet cache token and preserves startup behavior', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  assert.match(html, /loading-screen\.css\?v=AFV504&sessionguard=1&firstpaint=10&pullrefresh=1&statusrows=visible1&readability=1/);
  assert.match(html, /loading-screen\.js\?v=AFV504&sessionguard=4&statusrows=visible1&duration=2500&statusdone=1&minimalstatus=1/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV491/);
  assert.match(js, /overlay\.remove\(\)/);
  assert.match(js, /const MIN_STARTUP_DURATION = 2500/);
  assert.match(js, /remainingBeforeFade/);
  assert.match(js, /const EXIT_FADE_DURATION = 440/);
  assert.match(js, /\}, EXIT_FADE_DURATION\)/);
});

test('AFV499 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '504.0.0');
  assert.equal(lock.version, '504.0.0');
  assert.equal(lock.packages[''].version, '504.0.0');
  assert.ok(readme.includes('Current release: AFV504'));
  assert.ok(history.includes('AFV499 — Delay Homepage Reveal Until Loading Fade Completes'));
});
