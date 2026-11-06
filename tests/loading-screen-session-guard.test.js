'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV492 homepage return lifecycle routes resumed visits through the startup screen', () => {
  const home = read('index.html');
  const lifecycle = read('loading-return.js');
  const loading = read('loading-screen.js');
  const build = read('build.js');
  assert.ok(home.includes('loading-return.js?v=AFV492'));
  assert.ok(build.includes('"loading-return.js"'), 'the lifecycle controller must be shipped in production output');
  assert.ok(read("build.js").includes('"loading-return.js"'), "build allowlist must publish the homepage lifecycle controller");
  assert.ok(lifecycle.includes('window.addEventListener("pagehide", markPageHidden)'));
  assert.ok(lifecycle.includes('document.addEventListener("visibilitychange"'));
  assert.ok(lifecycle.includes('window.addEventListener("pageshow"'));
  assert.ok(lifecycle.includes('event.persisted'));
  assert.ok(lifecycle.includes('window.location.replace("/")'));
  assert.ok(lifecycle.includes('window.sessionStorage.setItem(markerKey, "1")'));
  assert.ok(lifecycle.includes('window.sessionStorage.removeItem(markerKey)'));
  assert.ok(lifecycle.includes('navigationType === "reload"'));
  assert.ok(lifecycle.includes('let hasBeenVisible = document.visibilityState === "visible"'));
  assert.ok(lifecycle.includes('redirectingToStartup || !hasBeenVisible'));
  assert.ok(lifecycle.includes('navigationType === "navigate"'));
  assert.ok(loading.includes('navigationType === "reload"'));
  assert.ok(!home.includes('id="arisu-loading-screen"'));
});

test('AFV492 preserves the root route and canonical homepage rewrite', () => {
  const redirects = read('_redirects').trim().split(/\r?\n/);
  assert.deepEqual(redirects, ['/home /homepage.html 200', '/ /loading.html 302']);
  const build = read('build.js');
  assert.ok(build.includes('"loading.html"'));
  assert.ok(build.includes('"_redirects"'));
  assert.ok(build.includes('fs.copyFileSync(path.join(output, "index.html"), path.join(output, "homepage.html"))'));
  assert.ok(build.includes('expected.push("homepage.html")'));
});

test('AFV492 startup screen preserves existing checks and avoids forced reload loops', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('document.readyState !== "loading"'));
  assert.ok(js.includes('row.key === "styles" && document.readyState !== "complete"'));
  assert.ok(js.includes('link[rel="stylesheet"]'));
  assert.ok(js.includes('window.location.replace("/home")'));
  assert.doesNotMatch(js, /location\.(reload|assign)\s*\(/);
  assert.doesNotMatch(js, /setInterval\s*\(/);
  const css = read('loading-screen.css');
  assert.ok(css.includes('arisu-loading-card-fade-out'));
  assert.ok(css.includes('transition: opacity .42s ease-in, visibility .42s ease-in'));
  assert.equal((css.match(/prefers-reduced-motion: reduce/g) || []).length, 1);
  assert.doesNotMatch(css, /arisu-loading-active|overscroll-behavior: none/);
});

test('AFV492 package metadata and release notes are synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '492.0.0');
  assert.equal(lock.version, '492.0.0');
  assert.equal(lock.packages[''].version, '492.0.0');
  assert.ok(readme.includes('Current release: AFV492'));
  assert.ok(history.includes('AFV492 — Correct Homepage Return and Startup Lifecycle'));
  assert.ok(history.includes('AFV491 — Correct Loading Lifecycle Detection'));
  assert.ok(history.includes('AFV489 — Fix Standalone Loading Redirect Loop'));
});
