'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.js'), 'utf8');

test('Stories navigation stays visible when stories are empty or the API fails', () => {
  assert.doesNotMatch(source, /mobileStoriesButton\.hidden\s*=\s*true/);
  assert.match(source, /must never hide the bottom-navigation button/);
  assert.match(source, /const refreshed = await load\(\)/);
  assert.match(source, /if \(refreshed && stories\.length\) \{[\s\S]*?await preloadImage\(stories\[0\]\.imageUrl\);[\s\S]*?showAt\(0\);/);
});


test('every page with Stories navigation loads the viewer stylesheet and script', () => {
  for (const page of ['index.html', 'reviews.html', 'proofs.html', 'about.html', 'privacy.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
    assert.match(html, /id="mobileNavStories"/, `${page} should have Stories navigation`);
    assert.match(html, /id="recoveryStoryViewer"/, `${page} should have the Story Viewer markup`);
    assert.match(html, /story-viewer\.css\?v=AFV\d+/, `${page} should load Story Viewer styles`);
    assert.match(html, /story-viewer\.js\?v=AFV361/, `${page} should load Story Viewer behavior`);
  }
});

test('Story navigation never wraps from the final story back to the first', () => {
  assert.match(source, /const targetIndex = index \+ direction;/);
  assert.match(source, /if \(targetIndex < 0\) return;/);
  assert.match(source, /if \(targetIndex >= stories\.length\) \{ hide\(\); return; \}/);
  assert.match(source, /index = targetIndex;/);
  assert.doesNotMatch(source, /\(next \+ stories\.length\) % stories\.length/);
  assert.doesNotMatch(source, /const targetIndex = \(index \+ direction \+ stories\.length\) % stories\.length/);
  assert.match(source, /const nextIndex = fromIndex \+ 1;\s*if \(nextIndex >= stories\.length\) return;/);
});


test('Stories button opens cached stories immediately and never displays a loading modal', () => {
  assert.match(source, /if \(stories\.length\) \{[\s\S]*?await preloadImage\(stories\[0\]\.imageUrl\);[\s\S]*?showAt\(0\);/);
  assert.match(source, /load\(\)\.then\(refreshed =>/);
  assert.match(source, /const refreshed = await load\(\);\s*if \(requestId !== storyOpenRequestId\) return;\s*if \(refreshed && stories\.length\) \{\s*await preloadImage\(stories\[0\]\.imageUrl\);\s*if \(requestId !== storyOpenRequestId\) return;\s*showAt\(0\);/);
  assert.match(source, /else \{\s*showEmptyState\(refreshed \? 'empty' : 'unavailable'\);\s*\}/);
  assert.doesNotMatch(source, /showEmptyState\(['"]loading['"]\)/);
  assert.doesNotMatch(source, /state === ['"]loading['"][\s\S]*?Loading Stories/);
});

test('Story progress continues animating after background refresh and avatar stays compact on mobile', () => {
  assert.match(source, /const elapsed = Math\.min\(DURATION, Math\.max\(0, Date\.now\(\) - started\)\);[\s\S]*?const remaining = Math\.max\(0, DURATION - elapsed\);[\s\S]*?setProgress\(elapsed \/ DURATION \* 100, remaining > 0, remaining \|\| DURATION\);/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.css'), 'utf8');
  assert.match(css, /\.story-viewer-avatar \{ width: 46px !important; height: 46px !important; min-width: 46px !important; \}/);
});

test('Story images reuse recent signed URLs across reloads and wait for refreshed images before swapping', () => {
  assert.ok(source.includes("const STORY_LIST_CACHE_KEY = 'arisuFixStoriesList.v1';"));
  assert.ok(source.includes("const STORY_SIGNED_URL_REUSE_MS = 40 * 60 * 1000;"));
  assert.ok(source.includes("function readCachedStories()"));
  assert.ok(source.includes("function mergeFreshStories(freshStories, previousStories, fetchedAt = Date.now())"));
  assert.ok(source.includes("stories = readCachedStories();"));
  assert.doesNotMatch(source, /stories\.slice\(0, 2\)\.forEach\(story => preloadImage\(story\.imageUrl\)\)/, 'Story media must not preload during page startup');
  assert.ok(source.includes('await preloadImage(stories[0].imageUrl);'), 'the first Story is prepared when the viewer is opened');
  assert.ok(source.includes('image.src = story.imageUrl; warmNextImage(index)'), 'next-Story warming remains active');
  assert.ok(source.includes("preloadImage(refreshedImageUrl).then(ready =>"));
  assert.ok(source.includes("Keep the visible image on screen until a renewed signed URL is ready"));
});

test('Desktop empty-state Story Viewer is centered and width-constrained', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.css'), 'utf8');
  const desktopFix = css.split('Desktop empty-state Story Viewer: constrain the modal width instead of stretching across the screen.')[1];
  assert.ok(desktopFix, 'desktop empty-state width rule must exist');
  assert.match(desktopFix, /@media \(min-width: 701px\)/);
  assert.match(desktopFix, /\.story-viewer\.story-viewer-empty-open \.story-viewer-card\s*\{[\s\S]*?width:\s*min\(560px, calc\(100vw - 48px\)\) !important;[\s\S]*?max-width:\s*560px !important;[\s\S]*?margin-inline:\s*auto !important/);
});

test('AFV359 defers automatic Stories API requests until after load and idle time', () => {
  assert.match(source, /function scheduleInitialDataLoad\(\)/);
  assert.match(source, /window\.addEventListener\('load', scheduleIdleWork, \{ once: true \}\)/);
  assert.match(source, /window\.requestIdleCallback\(runInitialDataLoad, \{ timeout: 2500 \}\)/);
  assert.match(source, /window\.setTimeout\(runInitialDataLoad, 1200\)/);
  assert.match(source, /stories = readCachedStories\(\);\s*renderCachedCount\(\);\s*scheduleInitialDataLoad\(\);/);
  assert.match(source, /if \(!storyListLoadRequested\) load\(\)/);
  assert.match(source, /storyListLoadRequested = true;/);
  assert.match(source, /await preloadImage\(stories\[0\]\.imageUrl\)/, 'opening Stories before idle still loads the first image on demand');
});

test('AFV359 preconnects to both existing Google Fonts origins before stylesheets', () => {
  const home = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const googleFonts = '<link rel="preconnect" href="https://fonts.googleapis.com">';
  const gstatic = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
  assert.ok(home.includes(googleFonts));
  assert.ok(home.includes(gstatic));
  assert.ok(home.indexOf(googleFonts) < home.indexOf('rel="stylesheet"'));
  assert.ok(home.indexOf(gstatic) < home.indexOf('rel="stylesheet"'));
});

test('AFV360 exits on right tap at the last or only Story and never wraps', () => {
  assert.match(source, /if \(targetIndex >= stories\.length\) \{ hide\(\); return; \}/);
  assert.match(source, /if \(targetIndex < 0\) return;/);
  assert.match(source, /if \(!Number\.isInteger\(targetIndex\) \|\| targetIndex < 0 \|\| targetIndex >= stories\.length\) return hide\(\)/);
  assert.doesNotMatch(source, /index = \(next \+ stories\.length\) % stories\.length/);
});

test('AFV360 preserves rapid navigation taps while the next Story image loads', () => {
  assert.match(source, /if \(navigating\) \{[\s\S]*?pendingNavigation\.length < 12[\s\S]*?pendingNavigation\.push\(direction\)/);
  assert.ok(source.includes('const direction = pendingNavigation.shift();'));
  assert.match(source, /function processPendingNavigation\(\)[\s\S]*?pendingNavigation\.shift\(\)[\s\S]*?navigateBy\(direction\)/);
});

test('AFV360 quick taps do not pause progress; only a 160ms hold pauses and resumes it', () => {
  assert.match(source, /holdPauseTimer = window\.setTimeout\(pauseStoryProgress, 160\)/);
  assert.match(source, /function pauseStoryProgress\(\)[\s\S]*?progressPaused = true;[\s\S]*?clearTimeout\(timer\)/);
  assert.match(source, /function resumeStoryProgress\(\)[\s\S]*?started = Date\.now\(\) - pausedElapsed;[\s\S]*?setProgress\(pausedElapsed \/ DURATION \* 100, true, remaining \|\| DURATION\)/);
  assert.match(source, /window\.addEventListener\('pointercancel',[\s\S]*?resumeStoryProgress\(\)/);
  assert.doesNotMatch(source, /viewer\.addEventListener\('pointerdown', event => \{[^\n]*clearTimeout\(timer\)/);
});

test('AFV360 background Story refresh does not rebuild progress segments when count is unchanged', () => {
  assert.match(source, /if \(progressFills.length !== stories.length\) renderProgressSegments\(\)/);
});

test('AFV360 package metadata and release notes are synchronized', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package-lock.json'), 'utf8'));
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.txt'), 'utf8');
  const history = fs.readFileSync(path.join(__dirname, '..', 'RELEASE_HISTORY.txt'), 'utf8');
  assert.equal(pkg.version, '360.0.0');
  assert.equal(lock.version, '360.0.0');
  assert.equal(lock.packages[''].version, '360.0.0');
  assert.ok(readme.includes('Current release: AFV360'));
  assert.ok(history.startsWith('AFV360 — Story Navigation and Progress Polish'));
});

test('AFV361 progress bar uses a compositor-friendly transform animation and stays aligned to the 7-second Story timer', () => {
  assert.match(source, /fill\.style\.transform = `scaleX\(\$\{clamped\}\)`/);
  assert.match(source, /fill\.style\.transition = `transform \$\{Math\.max\(0, duration\)\}ms linear`/);
  assert.match(source, /fill\.style\.transform = 'scaleX\(1\)'/);
  assert.match(source, /requestAnimationFrame\(\(\) => requestAnimationFrame\(\(\) => setProgress\(0, true, DURATION\)\)\)/);
  assert.match(source, /timer = setTimeout\(\(\) => \{ if \(index \+ 1 < stories\.length\) showAt\(index \+ 1\); else hide\(\); \}, DURATION\)/);
  assert.doesNotMatch(source, /fill\.style\.transition = `width \$\{duration\}ms linear`/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.css'), 'utf8');
  assert.match(css, /\.story-viewer-progress-fill\{[^}]*transform:scaleX\(0\)[^}]*transform-origin:left center[^}]*will-change:transform/);
  assert.match(css, /\.story-viewer-progress-segment\.is-complete \.story-viewer-progress-fill\{transform:scaleX\(1\)\}/);
});
