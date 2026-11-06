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
  assert.ok(html.includes('loading-screen-session-guard'));
  assert.ok(html.includes('sessionStorage.getItem(sessionKey)'));
  assert.ok(html.includes('document.cookie.split(";")'));
  assert.ok(html.includes('window.location.replace("/home")'));
  assert.ok(html.includes('loading-screen-session-guard'));
  assert.ok(html.includes('sessionStorage.getItem(sessionKey)'));
  assert.ok(html.includes('document.cookie.split(";")'), 'first-paint guard must recognize the persistent cookie fallback');
  assert.ok(html.includes('window.location.replace("/home")'));
  assert.ok(html.includes('/loading-screen.css?v=AFV489'));
  assert.ok(html.includes('/loading-screen.js?v=AFV488'));
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

test('AFV489 standalone script performs splash-page checks then opens the homepage through /home', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('document.readyState !== "loading"'));
  assert.ok(js.includes('waitForLoad'), 'AFV487 waits for the document load event before completing checks');
  assert.ok(js.includes('const waitForLoad = () => document.readyState === "complete"'));
  assert.ok(js.includes("link[rel=\"stylesheet\"]"));
  assert.ok(js.includes('window.location.replace("/home")'));
  assert.ok(!js.includes('window.location.replace("/index.html")'));
  assert.ok(js.includes('sessionStorage.getItem(sessionKey)'));
  assert.ok(js.includes('sessionStorage.setItem(sessionKey, "1")'));
  assert.ok(js.includes('document.cookie = sessionKey + "=1; Max-Age=86400; Path=/; SameSite=Lax; Secure"'));
  assert.ok(js.includes('document.cookie.split(";")'));
  assert.ok(js.includes('arisuFixHomepageLoadingShown'));
  const css = read('loading-screen.css');
  assert.ok(css.includes('arisu-loading-card-fade-out'));
  assert.ok(css.includes('transition: opacity .42s ease-in, visibility .42s ease-in'));
  assert.equal((css.match(/prefers-reduced-motion: reduce/g) || []).length, 1, 'reduced-motion rules should be consolidated');
  assert.doesNotMatch(css, /arisu-loading-active|overscroll-behavior: none/, 'standalone loading must not retain the retired homepage scroll lock');
  assert.ok(css.includes('#arisu-loading-screen .boot-status { padding: 2px 5px; }'), 'status pill padding remains unchanged after removing the superseded breakpoint block');
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
