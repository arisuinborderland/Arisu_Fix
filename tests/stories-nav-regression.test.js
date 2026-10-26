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
