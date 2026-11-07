'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV514 keeps all startup labels visible and animates only row indicators/statuses', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.match(html, /data-check="dom"><span class="boot-mark">○<\/span><span class="boot-message">Initializing homepage<\/span>/);
  assert.match(html, /data-check="styles"><span class="boot-mark">○<\/span><span class="boot-message">Verifying page styles<\/span>/);
  assert.match(html, /data-check="final"><span class="boot-mark">○<\/span><span class="boot-message">Finalizing interface\.\.\.<\/span>/);
  assert.doesNotMatch(css, /\.boot-log li\[data-state="pending"\]/);
  assert.doesNotMatch(css, /\.boot-log li\[data-state="running"\]\s*\{\s*animation:/);
  assert.match(css, /\.boot-log \.boot-mark,[\s\S]*?\.boot-log \.boot-status\s*\{[\s\S]*?transition:/);
  assert.match(js, /function typeMessage\(element\)/);
  assert.doesNotMatch(js, /target\.textContent\s*=\s*""|target\.textContent\s*\+=/);
  assert.match(js, /\.boot-status"\)\.textContent = "RUN"/);
  assert.match(js, /\.boot-status"\)\.textContent = ok \? "DONE" : "CHECK"/);
  assert.doesNotMatch(js, /200 OK|boot-footnote/);
  assert.doesNotMatch(html, /boot-footnote/);
  assert.match(css, /\.boot-subtitle\s*\{[\s\S]*?white-space:\s*nowrap/);
  assert.match(css, /\.boot-log\s*\{[\s\S]*?color:\s*#45536b/);
  assert.ok(css.includes('font: 800 13px/1 Arial'));
  assert.match(js, /const STATUS_CHECK_DELAY = 550/);
  assert.match(js, /const STATUS_ROW_GAP = 180/);
});

test('AFV514 preserves loading dimensions, refresh guard, readiness, and exit lifecycle', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.match(css, /#arisu-loading-screen \.boot-window\s*\{[^}]*width:\s*min\(100%,\s*760px\)/);
  assert.match(css, /@media \(max-width:\s*480px\)[\s\S]*?#arisu-loading-screen \.boot-window\s*\{\s*width:\s*100%/);
  assert.match(css, /html\.arisu-loading-first-run,[\s\S]*?html\.arisu-loading-active\s*\{\s*overscroll-behavior-y:\s*none/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV514/);
  assert.match(html, /loading-screen\.css\?v=AFV514&sessionguard=1&firstpaint=11&pullrefresh=1&statusrows=visible1&readability=1&completionbadge=1&doneplain=3/);
  assert.match(html, /loading-screen\.js\?v=AFV514&failsafe=15s&cancel=1&duration=2500&exitfade=440/);
  assert.match(js, /await waitForLoad\(\)/);
  assert.match(js, /async function countProgress\(\)/);
  assert.match(js, /window\.sessionStorage\.setItem\(sessionKey, "1"\)/);
  assert.match(js, /const MIN_STARTUP_DURATION = 2500/);
  assert.match(js, /const EXIT_FADE_DURATION = 440/);
  assert.match(js, /MIN_STARTUP_DURATION - EXIT_FADE_DURATION - \(Date\.now\(\) - startupStartedAt\)/);
  assert.match(js, /window\.setTimeout\(\(\) => \{[\s\S]*?\}, EXIT_FADE_DURATION\)/);
});


test('AFV514 renders a plain text-only COMPLETE badge', () => {
  const html = read('index.html');
  const js = read('loading-screen.js');
  const css = read('loading-screen.css');
  assert.match(html, /boot-progress-complete" hidden>COMPLETE/);
  assert.match(js, /const progressComplete = overlay\.querySelector\("\.boot-progress-complete"\)/);
  assert.match(js, /progressWaiting\.hidden = true/);
  assert.match(js, /progressComplete\.hidden = false/);
  assert.doesNotMatch(css, /\.boot-log li\[data-state="ok"\] \.boot-status::before/);
  assert.match(css, /\.boot-progress-complete\[hidden\]\s*\{\s*display:\s*none/);
});


test('AFV514 applies SYSTEM CHECK branding and places the live percentage inside the progress bar', () => {
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


test('AFV514 refinement removes the progress-bar check and tones down oversized gradient treatments', () => {
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


test('AFV514 DONE badges are plain green labels without generated icons', () => {
  const css = read('loading-screen.css');
  assert.match(css, /\.boot-log li\[data-state="ok"\] \.boot-status\s*\{[\s\S]*?background:\s*#d5f3df/);
  assert.doesNotMatch(css, /\.boot-log li\[data-state="ok"\] \.boot-status::before/);
});

test('AFV514 COMPLETE badge is text-only without pseudo-element icon styling', () => {
  const css = read('loading-screen.css');
  assert.match(css, /\.boot-progress-complete\s*\{[\s\S]*?gap:\s*0;[\s\S]*?padding:\s*4px 10px/);
  assert.doesNotMatch(css, /\.boot-progress-complete::before/);
});


test('AFV514 preloads the original Startup Screen logo at high priority without altering its source asset', () => {
  const html = read('index.html');
  assert.match(html, /<link rel="preload" as="image" href="\/assets\/images\/arisu-fix-alice-borderland-logo-transparent\.png\?v=AFV460" fetchpriority="high">/);
  assert.match(html, /class="boot-logo" src="assets\/images\/arisu-fix-alice-borderland-logo-transparent\.png\?v=AFV460"[^>]*loading="eager" fetchpriority="high" decoding="sync"/);
  assert.match(html, /class="boot-logo"[^>]*width="150" height="150"/);
});


test('AFV514 approved Startup Screen visual baseline is preserved', () => {
  const html = read('index.html');
  const css = read('loading-screen.css');
  const js = read('loading-screen.js');

  // Approved copy and hierarchy.
  assert.match(html, /ARISU FIX \/ SYSTEM STARTUP/);
  assert.match(html, /RECOVERY CONTACT &amp; ASSISTANCE/);
  assert.match(html, /<span>SYSTEM CHECK<\/span>/);
  assert.match(html, /Initializing homepage/);
  assert.match(html, /Verifying page styles/);
  assert.match(html, /Finalizing interface\.\.\./);

  // Approved brand treatment and compact section heading.
  assert.match(css, /\.boot-subtitle\s*\{[\s\S]*?background:\s*linear-gradient\(105deg,\s*#365fae 0%,\s*#4b58ad 58%,\s*#6653aa 100%\)/);
  assert.match(css, /\.boot-section\s*\{[\s\S]*?background:\s*linear-gradient\(105deg,\s*#365fae 0%,\s*#4b58ad 58%,\s*#6653aa 100%\)/);

  // Approved compact progress bar with percentage inside and no check icons.
  assert.match(html, /boot-progress-track[\s\S]*?boot-progress-fill[\s\S]*?boot-progress-value[\s\S]*?boot-progress-percent/);
  assert.match(css, /\.boot-progress-track\s*\{[\s\S]*?width:\s*94%[\s\S]*?height:\s*21px/);
  assert.doesNotMatch(css, /\.boot-progress-complete::before|\.boot-log li\[data-state="ok"\] \.boot-status::before/);

  // Preserve logo quality and the accepted startup lifecycle.
  assert.match(html, /arisu-fix-alice-borderland-logo-transparent\.png\?v=AFV460/);
  assert.match(html, /width="150" height="150"/);
  assert.match(js, /const MIN_STARTUP_DURATION = 2500/);
  assert.match(js, /const EXIT_FADE_DURATION = 440/);
});


test('AFV514 keeps release metadata aligned with startup cache-busting tokens', () => {
  const html = read('index.html');
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version, '518.0.0');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.match(html, /loading-screen\.css\?v=AFV514/);
  assert.match(html, /loading-screen\.js\?v=AFV514/);
});

test('AFV514 preserves desktop and consolidated mobile Startup Screen dimensions', () => {
  const css = read('loading-screen.css');
  assert.match(css, /#arisu-loading-screen \.boot-window \{[\s\S]*?width: min\(100%, 760px\)/);
  assert.match(css, /@media \(max-width: 480px\) \{[\s\S]*?#arisu-loading-screen \.boot-window \{ width: 100%; border-radius: 22px; \}/);
  assert.match(css, /@media \(max-width: 360px\) \{[\s\S]*?#arisu-loading-screen \.boot-logo \{ width: 78px; height: 78px; flex-basis: 78px; \}/);
  assert.equal((css.match(/@media \(max-width: 480px\)/g) || []).length, 1);
  assert.equal((css.match(/@media \(max-width: 360px\)/g) || []).length, 1);
});
