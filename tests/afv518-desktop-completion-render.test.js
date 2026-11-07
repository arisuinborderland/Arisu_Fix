'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('AFV518 gives desktop COMPLETE one paint frame before the existing exit fade, with no fixed delay', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');

  assert.match(js, /const isDesktopViewport = typeof window\.matchMedia === "function"/);
  assert.match(js, /window\.matchMedia\("\(min-width: 481px\)"\)\.matches/);
  assert.doesNotMatch(js, /DESKTOP_COMPLETE_HOLD_DURATION|showDesktopCompletion|completehold=1500/);
  assert.doesNotMatch(js, /await wait\(\s*1500\s*\)/);

  const completeShown = js.indexOf('progressComplete.hidden = false;');
  const desktopPaintGate = js.indexOf('if (isDesktopViewport) {');
  const firstPaintCallback = js.indexOf('window.requestAnimationFrame(() => {', desktopPaintGate);
  const fallbackArmed = js.indexOf('exitFrameFallbackTimer = window.setTimeout(beginExit, EXIT_FRAME_FALLBACK_DELAY);', firstPaintCallback);
  const nestedPaintFrame = js.indexOf('window.requestAnimationFrame(beginExit);', fallbackArmed);
  const desktopBlockEnd = js.indexOf('} else {', desktopPaintGate);
  const mobileFallback = js.indexOf('exitFrameFallbackTimer = window.setTimeout(beginExit, EXIT_FRAME_FALLBACK_DELAY);', desktopBlockEnd);
  const mobileFrame = js.indexOf('window.requestAnimationFrame(beginExit);', mobileFallback);

  assert.ok(completeShown >= 0, 'the success badge must be revealed after all startup checks');
  assert.ok(desktopPaintGate > completeShown, 'desktop paint scheduling must follow COMPLETE becoming visible');
  assert.ok(firstPaintCallback > desktopPaintGate && firstPaintCallback < fallbackArmed,
    'desktop must wait for the first completion-paint frame before arming exit recovery');
  assert.ok(fallbackArmed > firstPaintCallback && fallbackArmed < nestedPaintFrame && nestedPaintFrame < desktopBlockEnd,
    'desktop exit must be scheduled from the next animation frame after the first paint opportunity');
  assert.ok(mobileFallback > desktopBlockEnd && mobileFrame > mobileFallback,
    'mobile must keep its original bounded single-frame exit scheduling');

  assert.match(html, /loading-screen\.js\?v=AFV518[^"']*desktoppaint=1/);
  assert.match(html, /loading-screen\.css\?v=AFV514/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV514/);
});

test('AFV518 preserves the approved startup and exit durations', () => {
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');

  assert.match(js, /const MIN_STARTUP_DURATION = 2500/);
  assert.match(js, /const EXIT_FADE_DURATION = 440/);
  assert.match(css, /@media \(max-width: 480px\)/);
});

test('AFV518 release metadata and package lock are synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');

  assert.equal(pkg.version, '518.0.0');
  assert.equal(lock.version, '518.0.0');
  assert.equal(lock.packages[''].version, '518.0.0');
  assert.match(readme, /^Version: AFV518$/m);
  assert.match(readme, /^Current release: AFV518$/m);
  assert.match(readme, /^Package version: 518\.0\.0$/m);
  assert.ok(history.startsWith('AFV518 — Desktop COMPLETE Badge Visibility Fix'));
});
