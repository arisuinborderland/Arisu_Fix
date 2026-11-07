'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV514 keeps the crossfade on independent background and card layers', () => {
  const css = read('loading-screen.css');
  const html = read('index.html');
  assert.ok(css.includes('#arisu-loading-screen::before'));
  assert.ok(css.includes('#arisu-loading-screen.is-ready::before { opacity: 0; }'));
  assert.ok(css.includes('#arisu-loading-screen .boot-window::before'));
  assert.ok(css.includes('#arisu-loading-screen.is-ready .boot-window::before,'));
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
  assert.ok(html.includes('padding:12px;background:#f3f5f9;'));
  assert.ok(!html.includes('backdrop-filter:blur'));
});

test('AFV514 refreshes loading asset tokens and preserves startup behavior', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  assert.ok(html.includes('loading-screen.css?v=AFV514&sessionguard=1&firstpaint=11&pullrefresh=1&statusrows=visible1&readability=1&completionbadge=1&doneplain=3'));
  assert.ok(html.includes('loading-screen.js?v=AFV514&failsafe=15s&cancel=1&duration=2500&exitfade=440'));
  assert.ok(html.includes('loading-first-paint-guard.js?v=AFV514'));
  assert.ok(js.includes('controller.abort()'));
  assert.ok(js.includes('const MIN_STARTUP_DURATION = 2500'));
  assert.ok(js.includes('const EXIT_FADE_DURATION = 440'));
  assert.ok(js.includes('const STATUS_CHECK_DELAY = 550'));
  assert.ok(js.includes('const STATUS_ROW_GAP = 180'));
  assert.ok(js.includes('window.sessionStorage.setItem(sessionKey, "1")'));
});

test('AFV514 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '517.0.0');
  assert.equal(lock.version, '517.0.0');
  assert.equal(lock.packages[''].version, '517.0.0');
  assert.ok(readme.includes('Current release: AFV517'));
  assert.ok(history.includes('AFV514 — Full Loading Screen Audit and Lifecycle Cleanup'));
});
