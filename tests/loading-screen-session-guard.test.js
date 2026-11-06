'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV491 keeps the loading overlay in the homepage document with external assets', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="arisu-loading-screen"'));
  assert.ok(html.includes('loading-first-paint-guard.js?v=AFV491'));
  assert.ok(!html.includes('id="loading-screen-first-paint-guard"'));
  assert.ok(html.indexOf('loading-first-paint-guard.js?v=AFV491') < html.indexOf('loading-screen-critical-guard'));
  assert.ok(!html.includes('loading-first-paint-guard.js?v=AFV491" defer'));
  assert.ok(html.includes('loading-screen-critical-guard'));
  assert.ok(html.includes('loading-screen.css?v=AFV499'));
  assert.ok(html.includes('loading-screen.js?v=AFV499'));
  assert.ok(!html.includes('sessionStorage.getItem(sessionKey)'));
  const guard = read('loading-first-paint-guard.js');
  assert.ok(guard.includes('sessionStorage.getItem(sessionKey)'));
  assert.ok(guard.includes('arisu-loading-first-run'));
  assert.ok(read('_headers').includes("script-src 'self'"));
  assert.ok(!read('_headers').includes("script-src 'self' 'unsafe-inline'"));
  assert.ok(!html.includes('window.location.replace("/home")'));
  assert.ok(!fs.existsSync(path.join(root, 'loading.html')));
});

test('AFV491 root is served directly and no standalone splash redirect remains', () => {
  assert.equal(read('_redirects').trim(), '');
  const build = read('build.js');
  assert.ok(!build.includes('"loading.html"'));
  assert.ok(!build.includes('homepage.html'));
});

test('AFV491 loading script removes the same-document overlay after first session run', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('overlay.remove()'));
  assert.ok(js.includes('sessionStorage.getItem(sessionKey)'));
  assert.ok(js.includes('sessionStorage.setItem(sessionKey, "1")'));
  assert.ok(!js.includes('window.location.replace'));
  assert.ok(read('loading-screen.css').includes('#arisu-loading-screen.is-ready'));
});

test('AFV491 release metadata stays synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version, '499.0.0');
  assert.equal(lock.version, '499.0.0');
  assert.equal(lock.packages[''].version, '499.0.0');
});
