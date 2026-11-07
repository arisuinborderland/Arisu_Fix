'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV510 keeps the first-paint guard external and installs a bounded fail-open timer', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="arisu-loading-screen"'));
  assert.ok(html.includes('loading-first-paint-guard.js?v=AFV510'));
  assert.ok(html.indexOf('loading-first-paint-guard.js?v=AFV510') < html.indexOf('loading-screen-critical-guard'));
  assert.ok(html.includes('loading-screen.css?v=AFV511&sessionguard=1&firstpaint=10&pullrefresh=1&statusrows=visible1&readability=1&completionbadge=1&doneplain=3'));
  assert.ok(html.includes('loading-screen.js?v=AFV510&failsafe=15s&duration=2500&exitfade=440'));
  const guard = read('loading-first-paint-guard.js');
  assert.ok(guard.includes('arisu-loading-first-run'));
  assert.ok(guard.includes('window.setTimeout(failOpen, 15000)'));
  assert.ok(guard.includes('arisu-loading-active'));
  assert.ok(read('_headers').includes("script-src 'self'"));
  assert.ok(!read('_headers').includes("script-src 'self' 'unsafe-inline'"));
  assert.ok(!html.includes('window.location.replace("/home")'));
  assert.ok(!fs.existsSync(path.join(root, 'loading.html')));
});

test('AFV510 loading script fails open for storage errors, missing required markup, and rejected startup sequence', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('const failOpen = () =>'));
  assert.ok(js.includes('catch (error)'));
  assert.ok(js.includes('requiredRowsReady'));
  assert.ok(js.includes('runSequence().catch(failOpen)'));
  assert.ok(js.includes('arisu-loading-first-run'));
  assert.ok(js.includes('arisu-loading-active'));
  assert.ok(js.includes('sessionStorage.setItem(sessionKey, "1")'));
  assert.ok(!js.includes('window.location.replace'));
  assert.ok(read('loading-screen.css').includes('#arisu-loading-screen.is-ready'));
});

test('AFV510 preserves the approved startup duration and exit fade', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('const MIN_STARTUP_DURATION = 2500'));
  assert.ok(js.includes('const EXIT_FADE_DURATION = 440'));
});

test('AFV510 root is served directly and no standalone splash redirect remains', () => {
  assert.equal(read('_redirects').trim(), '');
  const build = read('build.js');
  assert.ok(!build.includes('"loading.html"'));
  assert.ok(!build.includes('homepage.html'));
});

test('AFV510 release metadata stays synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version, '511.0.0');
  assert.equal(lock.version, '511.0.0');
  assert.equal(lock.packages[''].version, '511.0.0');
});
