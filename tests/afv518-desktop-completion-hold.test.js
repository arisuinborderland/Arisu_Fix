'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('AFV518 keeps the COMPLETE badge visible on desktop before the exit fade', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');

  assert.match(js, /const DESKTOP_COMPLETE_HOLD_DURATION = 1500/);
  assert.match(js, /window\.matchMedia\("\(min-width: 481px\)"\)\.matches/);
  assert.match(js, /if \(showDesktopCompletion\) await wait\(DESKTOP_COMPLETE_HOLD_DURATION\)/);

  const completeShown = js.indexOf('progressComplete.hidden = false;');
  const holdApplied = js.indexOf('if (showDesktopCompletion) await wait(DESKTOP_COMPLETE_HOLD_DURATION);');
  const exitStarted = js.indexOf('function beginExit()');

  assert.ok(completeShown >= 0, 'the success badge must be revealed after all startup checks');
  assert.ok(holdApplied > completeShown, 'the desktop hold must begin after COMPLETE is revealed');
  assert.ok(exitStarted > holdApplied, 'the exit fade must not start until the desktop hold finishes');

  assert.match(html, /loading-screen\.js\?v=AFV518[^"']*completehold=1500&desktop=481/);
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
