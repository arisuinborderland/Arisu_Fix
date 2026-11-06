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

test('AFV492 shows the approved startup overlay only for a fresh tab session', () => {
  const home = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.ok(home.includes('id="arisu-loading-screen"'));
  assert.ok(home.includes('const key = "arisuFixStartupSeen"'));
  assert.ok(home.includes('sessionStorage.getItem(key)'));
  assert.ok(home.includes('const tabKey = "arisuFixTabId"'));
  assert.ok(home.includes('window.name.startsWith(prefix)'));
  assert.ok(home.includes('sessionStorage.removeItem(key)'));
  assert.ok(home.includes('const navigation = performance.getEntriesByType("navigation")[0]'));
  assert.ok(home.includes('const isNewDocumentVisit = navigationType === "navigate" || navigationType === "back_forward"'));
  assert.ok(home.includes('if (!sessionStorage.getItem(key) || isNewDocumentVisit)'));
  assert.ok(home.includes('sessionStorage.setItem(key, "1")'));
  assert.ok(home.includes('loading-screen.css?v=AFV492'));
  assert.ok(home.includes('loading-screen.js?v=AFV492'));
  assert.ok(css.includes('html.arisu-show-startup #arisu-loading-screen:not(.is-ready)'));
  assert.ok(js.includes('root.classList.contains("arisu-show-startup")'));
  assert.ok(!js.includes('window.location'));
  assert.ok(!js.includes('location.replace'));
  assert.ok(!js.includes('location.reload'));
});

test('AFV492 suppresses replay on refresh and browser-initiated viewport-mode reloads', () => {
  const home = read('index.html');
  assert.ok(home.includes('navigationType === "navigate" || navigationType === "back_forward"'));
  assert.ok(home.includes('if (!sessionStorage.getItem(key) || isNewDocumentVisit)'));
  assert.ok(home.includes('const isNewDocumentVisit = navigationType === "navigate" || navigationType === "back_forward"'));
});

test('AFV492 replays the in-place overlay when the existing tab returns from background or BFCache', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('document.addEventListener("visibilitychange"'));
  assert.ok(js.includes('document.visibilityState === "hidden"'));
  assert.ok(js.includes('document.visibilityState === "visible"'));
  assert.ok(js.includes('window.addEventListener("pageshow"'));
  assert.ok(js.includes('if (event.persisted) startOverlay(true)'));
  assert.ok(js.includes('function resetOverlay()'));
  assert.ok(js.includes('screen.classList.remove("is-ready")'));
  assert.ok(js.includes('element.dataset.state = "pending"'));
  assert.ok(js.includes('setProgress(0)'));
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
  assert.ok(history.includes('AFV492 — Fix Homepage Loading Replay and Return-to-Tab Lifecycle'));
  assert.ok(history.includes('AFV490 — Remove Duplicate Story Viewer Empty-State Rules'));
  assert.ok(history.includes('AFV489 — Fix Standalone Loading Redirect Loop'));
});
