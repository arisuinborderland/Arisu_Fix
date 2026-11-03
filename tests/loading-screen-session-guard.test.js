'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV411 first-paint guard shows the loading overlay only for a new tab session', () => {
  const html = read('index.html');
  assert.ok(html.includes('id="loading-screen-first-paint-guard"'));
  assert.ok(html.includes('arisu-loading-first-run #arisu-loading-screen'));
  assert.ok(html.includes('loading-screen.css?v=AFV411&sessionguard=1'));
  assert.ok(html.includes('loading-screen.js?v=AFV411&sessionguard=1'));
});

test('AFV411 records the session only after loading completes and releases scroll lock', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('document.documentElement.classList.add("arisu-loading-active")'));
  assert.ok(js.includes('window.sessionStorage.setItem(sessionKey, "1")'));
  assert.ok(js.includes('document.documentElement.classList.remove("arisu-loading-active")'));
  assert.ok(js.indexOf('setItem(sessionKey, "1")') > js.indexOf('async function runSequence()'));
  const css = read('loading-screen.css');
  assert.ok(css.includes('html.arisu-loading-active body'));
  assert.ok(css.includes('overscroll-behavior: none'));
});

test('AFV423 release metadata stays synchronized while preserving AFV412, AFV411, and AFV410', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '423.0.0');
  assert.equal(lock.version, '423.0.0');
  assert.equal(lock.packages[''].version, '423.0.0');
  assert.ok(readme.includes('Current release: AFV423'));
  assert.ok(readme.includes('AFV410 applies the Soft Curve'));
  assert.ok(history.startsWith('AFV423 — Shared Header Cleanup and Approved Layout Baseline'));
  assert.ok(history.includes('AFV412 — Restore footer milestone and unify public-page header'));
  assert.ok(history.includes('AFV410 — Compact Mobile Footer and Soft Curve Navigation'));
});
