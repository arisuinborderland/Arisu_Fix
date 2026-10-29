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
  assert.match(source, /if \(refreshed && stories\.length\) showAt\(0\)/);
});


test('every page with Stories navigation loads the viewer stylesheet and script', () => {
  for (const page of ['index.html', 'reviews.html', 'proofs.html', 'about.html', 'privacy.html']) {
    const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf8');
    assert.match(html, /id="mobileNavStories"/, `${page} should have Stories navigation`);
    assert.match(html, /id="recoveryStoryViewer"/, `${page} should have the Story Viewer markup`);
    assert.match(html, /story-viewer\.css\?v=AFV\d+/, `${page} should load Story Viewer styles`);
    assert.match(html, /story-viewer\.js\?v=AFV\d+/, `${page} should load Story Viewer behavior`);
  }
});

test('Story navigation never wraps from the final story back to the first', () => {
  assert.match(source, /const targetIndex = index \+ direction;/);
  assert.match(source, /if \(targetIndex < 0 \|\| targetIndex >= stories\.length\) return;/);
  assert.doesNotMatch(source, /const targetIndex = \(index \+ direction \+ stories\.length\) % stories\.length/);
  assert.match(source, /const nextIndex = fromIndex \+ 1;\s*if \(nextIndex >= stories\.length\) return;/);
});


test('Stories button opens cached stories immediately and never displays a loading modal', () => {
  assert.match(source, /if \(stories\.length\) \{\s*showAt\(0\);/);
  assert.match(source, /load\(\)\.then\(refreshed =>/);
  assert.match(source, /const refreshed = await load\(\);\s*if \(requestId !== storyOpenRequestId\) return;\s*if \(refreshed && stories\.length\) showAt\(0\);/);
  assert.match(source, /else showEmptyState\(refreshed \? 'empty' : 'unavailable'\)/);
  assert.doesNotMatch(source, /showEmptyState\(['"]loading['"]\)/);
  assert.doesNotMatch(source, /state === ['"]loading['"][\s\S]*?Loading Stories/);
});

test('Story progress continues animating after background refresh and avatar stays compact on mobile', () => {
  assert.match(source, /const elapsed = Math\.min\(DURATION, Math\.max\(0, Date\.now\(\) - started\)\);[\s\S]*?const remaining = Math\.max\(0, DURATION - elapsed\);[\s\S]*?setProgress\(elapsed \/ DURATION \* 100, remaining > 0, remaining \|\| DURATION\);/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.css'), 'utf8');
  assert.match(css, /\.story-viewer-avatar \{ width: 46px !important; height: 46px !important; min-width: 46px !important; \}/);
});

test('Story images reuse recent signed URLs across reloads and wait for refreshed images before swapping', () => {
  assert.match(source, /const STORY_LIST_CACHE_KEY = 'arisuFixStoriesList\\.v1';/);
  assert.match(source, /const STORY_SIGNED_URL_REUSE_MS = 40 \\* 60 \\* 1000;/);
  assert.match(source, /function readCachedStories\\(\\)/);
  assert.match(source, /function mergeFreshStories\\(freshStories, previousStories, fetchedAt = Date\\.now\\(\\)\\)/);
  assert.match(source, /stories = readCachedStories\\(\\);[\\s\\S]*?stories\\.slice\\(0, 2\\)\\.forEach\\(story => preloadImage\\(story\\.imageUrl\\)\\);[\\s\\S]*?loadCount\\(\\);[\\s\\S]*?load\\(\\);/);
  assert.match(source, /preloadImage\\(refreshedImageUrl\\)\\.then\\(ready =>/);
  assert.match(source, /Keep the visible image on screen until a renewed signed URL is ready/);
});

test('Desktop empty-state Story Viewer is centered and width-constrained', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.css'), 'utf8');
  const desktopFix = css.split('Desktop empty-state Story Viewer: constrain the modal width instead of stretching across the screen.')[1];
  assert.ok(desktopFix, 'desktop empty-state width rule must exist');
  assert.match(desktopFix, /@media \(min-width: 701px\)/);
  assert.match(desktopFix, /\.story-viewer\.story-viewer-empty-open \.story-viewer-card\s*\{[\s\S]*?width:\s*min\(560px, calc\(100vw - 48px\)\) !important;[\s\S]*?max-width:\s*560px !important;[\s\S]*?margin-inline:\s*auto !important/);
});
