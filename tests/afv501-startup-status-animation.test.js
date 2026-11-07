'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV502 keeps all startup labels visible and animates only row indicators/statuses', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.match(html, /data-check="dom"><span class="boot-mark">○<\/span><span class="boot-message">Initializing homepage<\/span>/);
  assert.match(html, /data-check="styles"><span class="boot-mark">○<\/span><span class="boot-message">Verifying page styles<\/span>/);
  assert.match(html, /data-check="final"><span class="boot-mark">○<\/span><span class="boot-message">Finalizing interface\.\.\.<\/span>/);
  assert.match(css, /\.boot-log li\[data-state="pending"\]\s*\{\s*display:\s*grid/);
  assert.match(css, /\.boot-log li\[data-state="running"\]\s*\{\s*animation:\s*none/);
  assert.match(css, /\.boot-log \.boot-mark,[\s\S]*?\.boot-log \.boot-status\s*\{[\s\S]*?transition:/);
  assert.match(js, /async function typeMessage\(element\)/);
  assert.doesNotMatch(js, /target\.textContent\s*=\s*""|target\.textContent\s*\+=/);
  assert.match(js, /\.boot-status"\)\.textContent = "RUN"/);
  assert.match(js, /\.boot-status"\)\.textContent = ok \? "DONE" : "CHECK"/);
  assert.doesNotMatch(js, /200 OK|boot-footnote/);
  assert.doesNotMatch(html, /boot-footnote/);
  assert.match(css, /\.boot-subtitle\s*\{[\s\S]*?white-space:\s*nowrap/);
  assert.match(css, /\.boot-log\s*\{[\s\S]*?color:\s*#45536b/);
  assert.match(css, /\.boot-progress-value\s*\{[\s\S]*?font-weight:\s*900/);
  assert.match(js, /const STATUS_CHECK_DELAY = 550/);
  assert.match(js, /const STATUS_ROW_GAP = 180/);
});

test('AFV502 preserves loading dimensions, refresh guard, readiness, and exit lifecycle', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.match(css, /\.boot-window\s*\{[^}]*width:\s*min\(100%,\s*760px\)/);
  assert.match(css, /@media \(max-width:\s*480px\)[\s\S]*?\.boot-window\s*\{\s*width:\s*100%/);
  assert.match(css, /html\.arisu-loading-first-run,[\s\S]*?html\.arisu-loading-active\s*\{\s*overscroll-behavior-y:\s*none/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV491/);
  assert.match(html, /loading-screen\.css\?v=AFV505&sessionguard=1&firstpaint=10&pullrefresh=1&statusrows=visible1&readability=1&completionbadge=1/);
  assert.match(html, /loading-screen\.js\?v=AFV505&sessionguard=4&statusrows=visible1&duration=2500&statusdone=1&minimalstatus=1&completionbadge=1/);
  assert.match(js, /await waitForLoad\(\)/);
  assert.match(js, /async function countProgress\(\)/);
  assert.match(js, /window\.sessionStorage\.setItem\(sessionKey, "1"\)/);
  assert.match(js, /const MIN_STARTUP_DURATION = 2500/);
  assert.match(js, /const EXIT_FADE_DURATION = 440/);
  assert.match(js, /MIN_STARTUP_DURATION - EXIT_FADE_DURATION - \(Date\.now\(\) - startupStartedAt\)/);
  assert.match(js, /await waitForLoad\(\)/);
  assert.match(js, /window\.setTimeout\(\(\) => \{[\s\S]*?\}, EXIT_FADE_DURATION\)/);
});


test('AFV505 renders refined circular completion icons and an overall COMPLETE badge', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.match(html, /boot-progress-complete" hidden>COMPLETE/);
  assert.match(js, /const progressComplete = overlay\.querySelector\("\.boot-progress-complete"\)/);
  assert.match(js, /if \(progressComplete\) progressComplete\.hidden = false/);
  assert.match(css, /\.boot-log li\[data-state="ok"\] \.boot-status::before/);
  assert.match(css, /\.boot-progress-complete::before/);
  assert.match(css, /border-radius:\s*50%/);
  assert.match(css, /linear-gradient\(145deg, #35d979 0%, #0d9e4b 100%\)/);
  assert.match(css, /\.boot-progress-complete\[hidden\]\s*\{\s*display:\s*none/);
});


test('AFV505 applies SYSTEM CHECK branding and places the live percentage inside the progress bar', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.match(html, /boot-section-icon[\s\S]*?SYSTEM CHECK/);
  assert.doesNotMatch(html, /INITIALIZATION SEQUENCE/);
  assert.match(html, /boot-subtitle/);
  assert.match(html, /boot-progress-track[\s\S]*?boot-progress-fill[\s\S]*?boot-progress-value[\s\S]*?boot-progress-percent/);
  const progressRow = html.match(/<div class="boot-progress-row">[\s\S]*?<\/div>/)?.[0] || "";
  assert.doesNotMatch(progressRow, /boot-progress-value/);
  assert.match(js, /progressPercent\.textContent = value \+ "%"/);
  assert.match(js, /progressText\.classList\.toggle\("is-filled", value >= 50\)/);
  assert.doesNotMatch(js, /progressCheck|is-complete/);
  assert.match(js, /track\.setAttribute\("aria-valuetext"/);
  assert.match(css, /\.boot-section\s*\{[\s\S]*?padding:\s*6px 10px[\s\S]*?box-shadow:\s*none/);
  assert.match(css, /\.boot-subtitle\s*\{[\s\S]*?border-radius:\s*7px[\s\S]*?box-shadow:\s*none/);
  assert.match(css, /\.boot-progress-track\s*\{[\s\S]*?width:\s*94%[\s\S]*?height:\s*21px/);
  assert.match(css, /\.boot-progress-fill\s*\{[\s\S]*?width:\s*0/);
  assert.doesNotMatch(html, /boot-progress-check/);
});


test('AFV505 refinement removes the progress-bar check and tones down oversized gradient treatments', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.doesNotMatch(html, /boot-progress-check/);
  assert.doesNotMatch(js, /progressCheck|is-complete/);
  assert.match(css, /\.boot-subtitle\s*\{[\s\S]*?border-radius:\s*7px[\s\S]*?box-shadow:\s*none/);
  assert.match(css, /\.boot-section\s*\{[\s\S]*?padding:\s*6px 10px[\s\S]*?box-shadow:\s*none/);
  assert.match(css, /\.boot-progress-track\s*\{[\s\S]*?width:\s*94%[\s\S]*?height:\s*21px/);
  assert.match(css, /\.boot-progress-fill\s*\{[\s\S]*?box-shadow:\s*none[\s\S]*?animation:\s*none/);
});


test('AFV505 DONE badges are plain green labels without a check icon', () => {
  const css = read('loading-screen.css');
  assert.match(css, /\.boot-log li\[data-state="ok"\] \.boot-status::before\s*\{[\s\S]*?display:\s*none !important/);
  assert.match(css, /\.boot-log li\[data-state="ok"\] \.boot-status\s*\{[\s\S]*?background:\s*#d5f3df/);
});
