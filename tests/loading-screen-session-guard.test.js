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
  assert.ok(home.includes('if (!sessionStorage.getItem(key))'));
  assert.ok(!home.includes('performance.getEntriesByType("navigation")'));
  assert.ok(!home.includes('isNewDocumentVisit'));
  assert.ok(home.includes('document.documentElement.classList.add("arisu-suppress-startup")'));
  assert.ok(home.includes('document.documentElement.classList.remove("arisu-suppress-startup")'));
  assert.ok(home.includes('sessionStorage.setItem(key, "1")'));
  assert.ok(home.includes('loading-screen.css?v=AFV493'));
  assert.ok(home.includes('loading-screen.js?v=AFV493'));
  assert.ok(css.includes('html.arisu-show-startup #arisu-loading-screen:not(.is-ready)'));
  assert.ok(css.includes('html.arisu-show-startup body > :not(#arisu-loading-screen)'));
  assert.ok(css.includes('backdrop-filter: none;'));
  assert.ok(css.includes('html.arisu-suppress-startup #arisu-loading-screen:not(.is-ready)'));
  assert.ok(css.includes('html.arisu-suppress-startup #arisu-loading-screen:not(.is-ready)'));
  assert.match(css, /#arisu-loading-screen\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?visibility:\s*visible;/);
  assert.ok(js.includes('root.classList.contains("arisu-show-startup")'));
  assert.ok(js.includes('root.classList.remove("arisu-suppress-startup")'));
  assert.ok(!js.includes('window.location'));
  assert.ok(!js.includes('location.replace'));
  assert.ok(!js.includes('location.reload'));
});

test('AFV493 suppresses startup replay for every same-tab document reload, including viewport-mode changes', () => {
  const home = read('index.html');
  assert.ok(home.includes('if (!sessionStorage.getItem(key))'));
  assert.ok(home.includes('sessionStorage.setItem(key, "1")'));
  assert.ok(!home.includes('isNewDocumentVisit'));
  assert.ok(!home.includes('performance.getEntriesByType("navigation")'));
});

test('AFV493 does not replay startup when the browser hides/shows the tab or restores BFCache', () => {
  const js = read('loading-screen.js');
  assert.ok(!js.includes('document.addEventListener("visibilitychange"'));
  assert.ok(!js.includes('window.addEventListener("pageshow"'));
  assert.ok(!js.includes('startOverlay(true)'));
  assert.ok(js.includes('function resetOverlay()'));
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
  assert.equal(pkg.version, '493.0.0');
  assert.equal(lock.version, '493.0.0');
  assert.equal(lock.packages[''].version, '493.0.0');
  assert.ok(readme.includes('Current release: AFV493'));
  assert.ok(history.includes('AFV493 — Keep Loading Screen Separate Until Homepage Is Ready'));
  assert.ok(history.includes('AFV492 — Fix Homepage Loading Replay and Return-to-Tab Lifecycle'));
  assert.ok(history.includes('AFV490 — Remove Duplicate Story Viewer Empty-State Rules'));
  assert.ok(history.includes('AFV489 — Fix Standalone Loading Redirect Loop'));
});
