'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV513 displays WAITING during progress and hides COMPLETE until success', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  const row = html.match(/<div class="boot-progress-row">[\s\S]*?<\/div>/)?.[0] || '';
  assert.match(row, /boot-progress-waiting"[^>]*>WAITING/);
  assert.match(row, /boot-progress-complete" hidden>COMPLETE/);
  assert.match(js, /const progressWaiting = overlay\.querySelector\("\.boot-progress-waiting"\)/);
  assert.match(js, /progressWaiting\.hidden = false/);
  assert.match(css, /\.boot-progress-waiting\[hidden\]\s*\{\s*display:\s*none/);
});

test('AFV513 sets COMPLETE and 100% only after every required check passes', () => {
  const js = read('loading-screen.js');
  const loop = js.indexOf('for (const row of rows)');
  const check = js.indexOf('const passed = row.check()', loop);
  const failure = js.indexOf('if (!passed)', check);
  const completion = js.indexOf('setProgress(100)', loop);
  const waitingOff = js.indexOf('progressWaiting.hidden = true', completion);
  const completeOn = js.indexOf('progressComplete.hidden = false', waitingOff);
  const persist = js.indexOf('sessionStorage.setItem(sessionKey, "1")', completeOn);
  assert.ok(loop >= 0 && check > loop && failure > check);
  assert.ok(completion > failure && waitingOff > completion && completeOn > waitingOff && persist > completeOn);
  assert.match(js.slice(failure, completion), /failOpen\(\);\s*return/);
  assert.match(js, /if \(signal\.aborted \|\| finished\) return/);
});

test('AFV513 preserves WAITING and COMPLETE as mutually exclusive states', () => {
  const js = read('loading-screen.js');
  assert.match(js, /progressWaiting\.hidden = false;[\s\S]*?progressComplete\.hidden = true/);
  assert.match(js, /progressWaiting\.hidden = true;[\s\S]*?progressComplete\.hidden = false/);
  assert.match(js, /value === 100 \? "100% complete"/);
});

test('AFV513 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '513.0.0');
  assert.equal(lock.version, '513.0.0');
  assert.equal(lock.packages[''].version, '513.0.0');
  assert.ok(readme.includes('Current release: AFV513'));
  assert.ok(history.includes('AFV513 — Loading Screen WAITING and Success-Gated Completion'));
});
