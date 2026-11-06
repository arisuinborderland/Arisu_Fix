'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV489 uses a dedicated loading page and leaves the homepage free of the old overlay', () => {
  const html = read('loading.html');
  const home = read('index.html');
  assert.ok(html.includes('id="arisu-loading-screen" class="is-visible"'));
  assert.ok(html.includes('class="is-visible"'), 'standalone page must reveal the overlay immediately; its default CSS state is hidden');
  assert.ok(html.includes('/loading-screen.css?v=AFV489'));
  assert.ok(html.includes('/loading-screen.js?v=AFV489'), 'updated completion logic must bypass the stale AFV488 cached script');
  assert.ok(html.includes('arisu-fix-alice-borderland-logo-transparent.png'));
  assert.ok(!home.includes('id="arisu-loading-screen"'));
  assert.ok(!home.includes('loading-screen-first-paint-guard'));
  assert.ok(!home.includes('loading-screen-critical-guard'));
  assert.ok(!home.includes('loading-screen.css'));
  assert.ok(!home.includes('loading-screen.js'));
});

test('AFV489 root redirect is exact and does not intercept direct homepage access', () => {
  const redirects = read('_redirects').trim().split(/\r?\n/);
  assert.deepEqual(redirects, ['/home /homepage.html 200', '/ /loading.html 302']);
  const build = read('build.js');
  assert.ok(build.includes('"loading.html"'));
  assert.ok(build.includes('"_redirects"'));
  assert.ok(build.includes('fs.copyFileSync(path.join(output, "index.html"), path.join(output, "homepage.html"))'));
  assert.ok(build.includes('expected.push("homepage.html")'));
});

test('AFV490 prevents refresh attempts from interrupting the active loading screen', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('let startupActive = true;'));
  assert.ok(js.includes('window.addEventListener("beforeunload", guardPageExit);'));
  assert.ok(js.includes('event.preventDefault();'));
  assert.ok(js.includes('event.returnValue = "";'));
  assert.ok(js.includes('document.addEventListener("keydown", guardRefreshShortcut, true);'));
  assert.ok(js.includes('key === "f5"'));
  assert.ok(js.includes('event.ctrlKey || event.metaKey'));
  assert.ok(js.includes('document.documentElement.style.overscrollBehaviorY = "contain";'));
  assert.ok(js.includes('startupActive = false;'));
  assert.ok(js.includes('window.removeEventListener("beforeunload", guardPageExit);'));
  assert.ok(js.includes('document.removeEventListener("keydown", guardRefreshShortcut, true);'));
  assert.ok(js.includes('if (navigationStarted) return;'));
  assert.equal((js.match(/window\.location\.replace\("\/home"\)/g) || []).length, 1);
  assert.doesNotMatch(js, /location\.reload\s*\(|history\.go\s*\(/);
});

test('AFV489 release metadata stays synchronized and historical milestones remain', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '489.0.0');
  assert.equal(lock.version, '489.0.0');
  assert.equal(lock.packages[''].version, '489.0.0');
  assert.ok(readme.includes('Current release: AFV489'));
  assert.ok(readme.includes('AFV410 applies the Soft Curve'));
  assert.ok(history.includes('AFV489 — Fix Standalone Loading Redirect Loop'));
  assert.ok(history.includes('AFV459 — Homepage Accordion Feature Isolation'));
  assert.ok(history.includes('AFV412 — Restore footer milestone and unify public-page header'));
  assert.ok(history.includes('AFV410 — Compact Mobile Footer and Soft Curve Navigation'));
});


test('AFV491 remembers completion only after the startup sequence finishes', () => {
  const html = read('loading.html');
  const js = read('loading-screen.js');
  assert.ok(html.includes('sessionStorage.getItem("arisuFixLoadingCompleted") === "1"'));
  assert.ok(html.includes('skip-completed-startup body{display:none!important}'));
  assert.ok(js.includes('function openHomepageOnce(completed = false)'));
  assert.ok(js.includes('if (completed)'));
  assert.ok(js.includes('sessionStorage.setItem("arisuFixLoadingCompleted", "1")'));
  assert.ok(js.includes('await wait(440);\n    openHomepageOnce(true);'));
  assert.ok(!js.includes('openHomepageOnce(true);\n    return;'));
});
