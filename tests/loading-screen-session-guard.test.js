'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV514 keeps the first-paint guard external and installs a bounded fail-open timer', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="arisu-loading-screen"'));
  assert.ok(html.includes('loading-first-paint-guard.js?v=AFV514'));
  assert.ok(html.indexOf('loading-first-paint-guard.js?v=AFV514') < html.indexOf('loading-screen-critical-guard'));
  assert.ok(html.includes('loading-screen.css?v=AFV514&sessionguard=1&firstpaint=11&pullrefresh=1&statusrows=visible1&readability=1&completionbadge=1&doneplain=3'));
  assert.ok(html.includes('loading-screen.js?v=AFV518&failsafe=15s&cancel=1&duration=2500&exitfade=440&desktoppaint=1'));
  const guard = read('loading-first-paint-guard.js');
  assert.ok(guard.includes('arisu-loading-first-run'));
  assert.ok(guard.includes('window.setTimeout(failOpen, 15000)'));
  assert.ok(guard.includes('window.__arisuLoadingFailOpen'));
  assert.ok(guard.includes('cancelLoader()'));
  assert.ok(guard.includes('arisu-loading-active'));
  assert.ok(read('_headers').includes("script-src 'self'"));
  assert.ok(!read('_headers').includes("script-src 'self' 'unsafe-inline'"));
  assert.ok(!html.includes('window.location.replace("/home")'));
  assert.ok(!fs.existsSync(path.join(root, 'loading.html')));
});

test('AFV514 loading script fails open for storage errors, missing required markup, and rejected startup sequence', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('function failOpen()'));
  assert.ok(js.includes('controller.abort()'));
  assert.ok(js.includes('window.__arisuLoadingFailOpen = failOpen'));
  assert.ok(js.includes('catch (error)'));
  assert.ok(js.includes('requiredRowsReady'));
  assert.ok(js.includes('runSequence().catch(error =>'));
  assert.ok(js.includes('controller.abort()'));
  assert.ok(js.includes('if (finished) return'));
  assert.ok(js.includes('signal.aborted'));
  assert.ok(js.includes('const elements = new Map(rows.map'));
  assert.ok(!js.includes('runSequence().catch(failOpen)'));
  assert.ok(js.includes('arisu-loading-first-run'));
  assert.ok(js.includes('arisu-loading-active'));
  assert.ok(js.includes('sessionStorage.setItem(sessionKey, "1")'));
  assert.ok(!js.includes('window.location.replace'));
  assert.ok(read('loading-screen.css').includes('#arisu-loading-screen.is-ready'));
});

test('AFV514 preserves the approved startup duration and exit fade', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('const MIN_STARTUP_DURATION = 2500'));
  assert.ok(js.includes('const EXIT_FADE_DURATION = 440'));
});

test('AFV514 root is served directly and no standalone splash redirect remains', () => {
  assert.equal(read('_redirects').trim(), '');
  const build = read('build.js');
  assert.ok(!build.includes('"loading.html"'));
  assert.ok(!build.includes('homepage.html'));
});

test('AFV514 release metadata stays synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version, '518.0.0');
  assert.equal(lock.version, '518.0.0');
  assert.equal(lock.packages[''].version, '518.0.0');
});
