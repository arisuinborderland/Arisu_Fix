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
  assert.ok(html.includes('loading-screen.css?v=AFV502'));
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

test('current release metadata stays synchronized with the README release marker', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const release = readme.match(/^Current release: AFV(\\d+)$/m);
  assert.ok(release, 'README must declare the current AFV release');
  const expectedVersion = `${release[1]}.0.0`;
  assert.equal(pkg.version, expectedVersion);
  assert.equal(lock.version, expectedVersion);
  assert.equal(lock.packages[''].version, expectedVersion);
});


test('AFV502 uses the optimized Joker WebP as the loading-screen backdrop without replacing the boot card', () => {
  const css = read('loading-screen.css');
  const html = read('index.html');
  const build = read('build.js');
  const imagePath = path.join(root, 'assets', 'loading-screen', 'joker-background.webp');
  assert.ok(fs.existsSync(imagePath), 'Joker WebP must be present in the public assets tree');
  const image = fs.readFileSync(imagePath);
  assert.equal(image.toString('ascii', 0, 4), 'RIFF');
  assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  assert.ok(css.includes('url("/assets/loading-screen/joker-background.webp")'));
  assert.ok(css.includes('center center / cover no-repeat'));
  assert.ok(css.includes('#arisu-loading-screen .boot-window'));
  assert.ok(html.includes('loading-screen.css?v=AFV502'));
  assert.ok(build.includes('new Set(["reviews", "proofs", "assets"])'));
});
