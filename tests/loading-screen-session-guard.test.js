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
  assert.ok(html.includes('animation:none!important'), 'first-paint overlay must not be hidden by the CSS fade-in animation');
  assert.ok(html.includes('body>:not(#arisu-loading-screen){display:none!important}'), 'homepage content must stay hidden until the loading overlay is ready');
  assert.ok(html.includes('display:grid;place-items:center'), 'critical guard must render the loading overlay before external CSS');
  assert.ok(html.includes('html.arisu-loading-first-run #arisu-loading-screen{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center'), 'critical first-paint rule must render the overlay immediately');
  assert.ok(html.includes('opacity:1;visibility:visible;pointer-events:auto;animation:none!important'), 'critical first-paint rule must show the overlay without an entrance animation');
  assert.ok(html.includes('loading-screen.css?v=AFV411&sessionguard=1&firstpaint=5'));
  assert.ok(html.includes('loading-screen.js?v=AFV411&sessionguard=2'));
  const guardPosition = html.indexOf('id="loading-screen-first-paint-guard"');
  const firstStylesheetPosition = html.indexOf('<link rel="stylesheet"');
  assert.ok(guardPosition >= 0 && guardPosition < firstStylesheetPosition, 'session guard must run before the first stylesheet');
  const criticalGuardPosition = html.indexOf('id="loading-screen-critical-guard"');
  assert.ok(criticalGuardPosition > guardPosition && criticalGuardPosition < firstStylesheetPosition, 'critical visibility CSS must precede render-blocking stylesheets');
});

test('AFV411 records the session only after loading completes and releases scroll lock', () => {
  const js = read('loading-screen.js');
  assert.ok(js.includes('document.documentElement.classList.add("arisu-loading-active")'));
  assert.ok(js.includes('window.sessionStorage.setItem(sessionKey, "1")'));
  assert.ok(js.includes('document.documentElement.classList.remove("arisu-loading-active")'));
  assert.ok(js.includes('document.documentElement.classList.remove("arisu-loading-first-run")'), "homepage is revealed as the exit fade begins");
  assert.ok(js.indexOf('setItem(sessionKey, "1")') > js.indexOf('async function runSequence()'));
  const css = read('loading-screen.css');
  assert.ok(css.includes('html.arisu-loading-active body'));
  assert.ok(css.includes('overscroll-behavior: none'));
  assert.ok(!css.includes('arisu-loading-fade-in'), 'loading overlay must not use an entrance fade');
  assert.ok(!css.includes('arisu-loading-card-fade-in'), 'loading card must not use an entrance fade');
  assert.ok(css.includes('arisu-loading-card-fade-out'), 'existing loading card exit fade must remain');
  assert.ok(css.includes('transition: opacity .42s ease-in, visibility .42s ease-in'), 'existing overlay exit fade must remain');
  assert.ok(!/^\s*transition:\s*opacity \.24s ease, visibility \.24s ease;/m.test(css), 'default overlay state must not transition into view');
});

test('AFV449 release metadata stays synchronized while preserving AFV412, AFV411, and AFV410', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '449.0.0');
  assert.equal(lock.version, '449.0.0');
  assert.equal(lock.packages[''].version, '449.0.0');
  assert.ok(readme.includes('Current release: AFV449'));
  assert.ok(readme.includes('AFV410 applies the Soft Curve'));
  assert.ok(history.startsWith('AFV449 — Match Mobile Accordion Top and Bottom Insets to Why Choose'));
  assert.ok(history.includes('AFV412 — Restore footer milestone and unify public-page header'));
  assert.ok(history.includes('AFV410 — Compact Mobile Footer and Soft Curve Navigation'));
});
