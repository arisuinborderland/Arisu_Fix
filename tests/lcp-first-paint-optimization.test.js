'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV358 generates and preloads the optimized Daily Bible Verse WebP as a high-priority image', () => {
  const index = read('index.html');
  const preloadTag = '<link rel="preload" as="image" href="/verse-lake-photo.webp?v=AFV358" fetchpriority="high">';
  assert.ok(index.includes(preloadTag), 'homepage must preload the LCP banner image at high priority');
  assert.ok(index.indexOf(preloadTag) < index.indexOf('rel="stylesheet"'), 'preload must appear before stylesheet requests');
  const build = read('build.js');
  const styles = read('styles.css');
  assert.ok(build.includes('output: "verse-lake-photo.webp"'), 'production build must generate the optimized LCP asset');
  assert.ok(styles.includes('verse-lake-photo.webp?v=AFV358'), 'CSS must use the same optimized asset as the preload');
  assert.ok(!styles.includes('verse-lake-photo.jpg?v=AFV266'), 'old JPEG background references must be replaced');
  assert.ok(index.includes('scroll-reveal.js?v=AFV357'), 'homepage must refresh the changed script cache token');
});

test('AFV357 keeps the first-viewport Bible Verse visible and preserves scroll reveal', () => {
  const reveal = read('scroll-reveal.js');
  assert.ok(reveal.includes('"main > #daily-bible-verse"'), 'the verse remains a scroll-reveal target');
  assert.ok(reveal.includes('el.id === "daily-bible-verse"'), 'the initial-paint exception is scoped to the verse');
  assert.ok(reveal.includes('const rect = el.getBoundingClientRect();'), 'initial viewport visibility is checked before reveal is enabled');
  assert.ok(reveal.includes('el.classList.add("arc-scroll-reveal-visible")'), 'the initially visible verse is not hidden on first paint');
  assert.ok(reveal.includes('target.classList.remove("arc-scroll-reveal-visible")'), 'the observer can still hide it after scrolling away');
  assert.ok(reveal.includes('target.classList.add("arc-scroll-reveal-visible")'), 'the observer can still reveal it when scrolling back');
});

test('AFV406 keeps loading visible after interrupted refresh and locks background scrolling', () => {
  const script = read('loading-screen.js');
  const styles = read('loading-screen.css');
  const sequenceStart = script.indexOf('async function runSequence()');
  const sessionMark = script.indexOf('window.sessionStorage.setItem(sessionKey, "1")');
  assert.notEqual(sequenceStart, -1, 'loading sequence must exist');
  assert.ok(sessionMark > sequenceStart, 'session is marked only after the loading sequence completes');
  assert.ok(script.includes('document.documentElement.classList.add("arisu-loading-active")'), 'active loading state must lock page scrolling');
  assert.ok(script.includes('document.documentElement.classList.remove("arisu-loading-active")'), 'scroll lock must be released when the overlay is removed');
  assert.ok(styles.includes('html.arisu-loading-active body'), 'body scrolling must be disabled while loading is active');
  assert.ok(styles.includes('overscroll-behavior: none;'), 'overscroll gestures must not scroll the page behind the overlay');
});

test('AFV406 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '406.0.0');
  assert.equal(lock.version, '406.0.0');
  assert.equal(lock.packages[''].version, '406.0.0');
  assert.ok(readme.includes('Current release: AFV406'));
  assert.ok(history.startsWith('AFV406 — Loading Screen Cache Refresh'));
});

test('AFV357 restores the three branded animations at mobile widths', () => {
  const styles = read('styles.css');
  const mobileBlockStart = styles.indexOf('/* AFV357 — restore the three branded motion accents on narrow/mobile layouts.');
  assert.notEqual(mobileBlockStart, -1, 'mobile animation restoration block must exist');
  const mobileBlock = styles.slice(mobileBlockStart);
  assert.ok(mobileBlock.startsWith('/* AFV357'), 'mobile block must be appended at the end of the stylesheet');
  assert.ok(mobileBlock.includes('@media (max-width: 700px)'), 'mobile-only media query must be scoped to 700px and below');
  assert.ok(mobileBlock.includes('arisu-brand-badge-pop 2s ease-in-out infinite !important'));
  assert.ok(mobileBlock.includes('status-heartbeat 1.15s ease-in-out infinite !important'));
  assert.ok(mobileBlock.includes('status-ripple 1.5s ease-out infinite !important'));
  assert.ok(mobileBlock.includes('wa-border-trace 2.8s linear infinite !important'));
  assert.ok(mobileBlock.includes('wa-border-trace-reverse 3.2s linear infinite !important'));
});

test('AFV406 shows the loading overlay on first paint without waiting for the deferred script', () => {
  const index = read('index.html');
  const guardScript = index.indexOf('id="loading-screen-first-paint-guard"');
  const firstStylesheet = index.indexOf('href="styles.css');
  const criticalGuard = index.indexOf('html.arisu-loading-first-run #arisu-loading-screen');
  assert.notEqual(guardScript, -1, 'a synchronous first-paint session guard must exist');
  assert.ok(guardScript < firstStylesheet, 'session state must be checked before stylesheet and page rendering');
  assert.notEqual(criticalGuard, -1, 'critical CSS must show the overlay for a first run before deferred JavaScript executes');
  assert.ok(index.includes('document.documentElement.classList.add("arisu-loading-first-run")'));
  assert.ok(index.includes('storage.getItem(sessionKey) !== "1"'));
});

test('AFV406 skips the loading overlay when the browser switches from mobile to desktop site mode', () => {
  const index = read('index.html');
  assert.ok(index.includes('arisuFixLastViewportWidth'), 'the previous viewport width must be tracked in this tab session');
  assert.match(index, /previousWidth <= 760 && currentWidth > 760/);
  assert.match(index, /storage\.setItem\(sessionKey, "1"\)/);
  assert.ok(index.indexOf('previousWidth <= 760 && currentWidth > 760') < index.indexOf('document.documentElement.classList.add("arisu-loading-first-run")'), 'desktop-site switch must be detected before first-paint overlay activation');
});

test('AFV406 applies the shared header theme to all public pages', () => {
  const theme = read('homepage-header-theme.css');
  const headerTest = read('tests/desktop-header-layout.test.js');
  for (const pageClass of ['home-page', 'reviews-document', 'proofs-document', 'privacy-page', 'about-page']) {
    assert.ok(theme.includes('html body.' + pageClass + ' .topbar'), pageClass + ' must receive the shared header theme');
  }
  assert.ok(headerTest.includes('homepage-header-theme.css?v=AFV406&navywave=approved3'), 'all public pages must load the cache-busted shared theme');
});
