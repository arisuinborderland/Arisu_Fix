'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV492 serves the homepage directly and does not route the root through a standalone splash page', () => {
  const redirects = read('_redirects').trim().split(/\r?\n/);
  assert.deepEqual(redirects, ['/home /homepage.html 200', '/ /homepage.html 200']);
  const build = read('build.js');
  assert.ok(build.includes('"homepage.html"'));
  assert.ok(build.includes('fs.copyFileSync(path.join(output, "index.html"), path.join(output, "homepage.html"))'));
});

test('AFV492 shows the approved startup overlay only for the first page load in a tab session', () => {
  const home = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.ok(home.includes('id="arisu-loading-screen"'));
  assert.ok(home.includes('sessionStorage.getItem("arisuFixStartupSeen")'));
  assert.ok(home.includes('sessionStorage.setItem("arisuFixStartupSeen", "1")'));
  assert.ok(home.includes('loading-screen.css?v=AFV492'));
  assert.ok(home.includes('loading-screen.js?v=AFV492'));
  assert.ok(css.includes('html.arisu-show-startup #arisu-loading-screen:not(.is-ready)'));
  assert.ok(js.includes('root.classList.contains("arisu-show-startup")'));
  assert.ok(!js.includes('window.location'));
  assert.ok(!js.includes('location.replace'));
  assert.ok(!js.includes('location.reload'));
});

test('AFV492 startup sequence completes in place without causing a second document navigation', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('screen.classList.add("is-ready")'));
  assert.ok(js.includes('root.classList.remove("arisu-show-startup")'));
  assert.ok(!js.includes('window.location.replace("/home")'));
  assert.ok(!js.includes('window.location.href'));
});

test('AFV490 historical metadata remains intact while AFV492 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '492.0.0');
  assert.equal(lock.version, '492.0.0');
  assert.equal(lock.packages[''].version, '492.0.0');
  assert.ok(readme.includes('Current release: AFV492'));
  assert.ok(history.includes('AFV492 — Fix Homepage Loading Replay and Redirect Reload'));
  assert.ok(history.includes('AFV490 — Remove Duplicate Story Viewer Empty-State Rules'));
  assert.ok(history.includes('AFV489 — Fix Standalone Loading Redirect Loop'));
});
