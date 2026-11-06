'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV490 keeps the loading overlay in the homepage document with external assets', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="arisu-loading-screen"'));
  assert.ok(html.includes('loading-screen-first-paint-guard'));
  assert.ok(html.includes('loading-screen-critical-guard'));
  assert.ok(html.includes('loading-screen.css?v=AFV490'));
  assert.ok(html.includes('loading-screen.js?v=AFV490'));
  assert.ok(html.includes('sessionStorage.getItem(sessionKey)'));
  assert.ok(!html.includes('window.location.replace("/home")'));
  assert.ok(!fs.existsSync(path.join(root, 'loading.html')));
});

test('AFV490 root is served directly and no standalone splash redirect remains', () => {
  assert.equal(read('_redirects').trim(), '');
  const build = read('build.js');
  assert.ok(!build.includes('"loading.html"'));
  assert.ok(!build.includes('homepage.html'));
});

test('AFV490 loading script removes the same-document overlay after first session run', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('overlay.remove()'));
  assert.ok(js.includes('sessionStorage.getItem(sessionKey)'));
  assert.ok(js.includes('sessionStorage.setItem(sessionKey, "1")'));
  assert.ok(!js.includes('window.location.replace'));
  assert.ok(read('loading-screen.css').includes('#arisu-loading-screen.is-ready'));
});

test('AFV490 release metadata stays synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version, '490.0.0');
  assert.equal(lock.version, '490.0.0');
  assert.equal(lock.packages[''].version, '490.0.0');
});
