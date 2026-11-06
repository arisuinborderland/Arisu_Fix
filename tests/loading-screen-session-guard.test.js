'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV491 standalone loading page keeps the one-time session guard before startup work', () => {
  const html = read('loading.html');
  const js = read('loading-screen.js');
  const home = read('index.html');
  assert.ok(html.includes('id="arisu-loading-screen" class="is-visible"'));
  assert.ok(html.includes('/loading-screen.css?v=AFV489'));
  assert.ok(html.includes('/loading-screen.js?v=AFV491'));
  assert.ok(html.includes('arisu-fix-alice-borderland-logo-transparent.png'));
  assert.ok(!home.includes('id="arisu-loading-screen"'));
  assert.ok(!home.includes('loading-screen-first-paint-guard'));
  assert.ok(!home.includes('loading-screen-critical-guard'));
  assert.ok(!home.includes('loading-screen.css'));
  assert.ok(!home.includes('loading-screen.js'));

  const storageRead = js.indexOf('window.sessionStorage.getItem(sessionKey)');
  const storageWrite = js.indexOf('window.sessionStorage.setItem(sessionKey, "1")');
  const startupWork = js.indexOf('const rows = [');
  assert.ok(storageRead >= 0 && storageWrite > storageRead);
  assert.ok(startupWork > storageWrite, 'session must be marked before startup animation begins');
  assert.ok(js.includes('const sessionKey = "arisuFixHomepageLoadingShown"'));
  assert.ok(js.includes('if (alreadyShown)'));
  assert.ok(js.includes('window.location.replace("/home")'));
  assert.ok(js.includes('catch (error)'), 'blocked storage must bypass the splash instead of repeating it');
});

test('AFV491 root route and homepage rewrite avoid the previous canonical redirect loop', () => {
  const redirects = read('_redirects').trim().split(/\r?\n/);
  assert.deepEqual(redirects, ['/home /homepage.html 200', '/ /loading.html 302']);
  const build = read('build.js');
  assert.ok(build.includes('"loading.html"'));
  assert.ok(build.includes('"_redirects"'));
  assert.ok(build.includes('fs.copyFileSync(path.join(output, "index.html"), path.join(output, "homepage.html"))'));
  assert.ok(build.includes('expected.push("homepage.html")'));
});

test('AFV491 startup script preserves the existing checks and exits without polling reloads', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('document.readyState !== "loading"'));
  assert.ok(js.includes('row.key === "styles" && document.readyState !== "complete"'));
  assert.ok(js.includes('link[rel="stylesheet"]'));
  assert.ok(js.includes('window.location.replace("/home")'));
  assert.doesNotMatch(js, /location\.(reload|assign)\s*\(/, 'startup must not force a page reload or assign loop');
  assert.doesNotMatch(js, /setInterval\s*\(/, 'startup must not poll by repeatedly navigating');
  const css = read('loading-screen.css');
  assert.ok(css.includes('arisu-loading-card-fade-out'));
  assert.ok(css.includes('transition: opacity .42s ease-in, visibility .42s ease-in'));
  assert.equal((css.match(/prefers-reduced-motion: reduce/g) || []).length, 1);
  assert.doesNotMatch(css, /arisu-loading-active|overscroll-behavior: none/);
});

test('AFV491 package metadata and release notes are synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '491.0.0');
  assert.equal(lock.version, '491.0.0');
  assert.equal(lock.packages[''].version, '491.0.0');
  assert.ok(readme.includes('Current release: AFV491'));
  assert.ok(history.includes('AFV491 — Restore Loading Session Guard and Prevent Repeat Splash'));
  assert.ok(history.includes('AFV489 — Fix Standalone Loading Redirect Loop'));
  assert.ok(history.includes('AFV488 — Standalone Loading Page and Root Startup Route'));
});
