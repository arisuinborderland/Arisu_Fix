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


test('Stories button opens immediately and reports API failures instead of appearing unclickable', () => {
  assert.match(source, /function showEmptyState\(state = 'empty'\)/);
  assert.match(source, /state === 'loading'[\s\S]*?Loading Stories/);
  assert.match(source, /state === 'unavailable'[\s\S]*?Stories Temporarily/);
  assert.match(source, /const requestId = \+\+storyOpenRequestId;[\s\S]*?showEmptyState\('loading'\);[\s\S]*?const refreshed = await load\(\);/);
  assert.match(source, /if \(requestId !== storyOpenRequestId \|\| viewer\.hidden\) return;/);
  assert.match(source, /else showEmptyState\(refreshed \? 'empty' : 'unavailable'\)/);
});


test('Desktop empty-state Story Viewer is centered and width-constrained', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.css'), 'utf8');
  const desktopFix = css.split('Desktop empty-state Story Viewer: constrain the modal width instead of stretching across the screen.')[1];
  assert.ok(desktopFix, 'desktop empty-state width rule must exist');
  assert.match(desktopFix, /@media \(min-width: 701px\)/);
  assert.match(desktopFix, /\.story-viewer\.story-viewer-empty-open \.story-viewer-card\s*\{[\s\S]*?width:\s*min\(560px, calc\(100vw - 48px\)\) !important;[\s\S]*?max-width:\s*560px !important;[\s\S]*?margin-inline:\s*auto !important/);
});
