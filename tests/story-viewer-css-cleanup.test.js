'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('Story Viewer empty-state hidden-controls rule has one authoritative copy', () => {
  const css = read('story-viewer.css');
  const hiddenControlsRule = /html body \.story-viewer\.story-viewer-empty-open \.story-viewer-progress-track,\s*html body \.story-viewer\.story-viewer-empty-open \.story-viewer-meta,\s*html body \.story-viewer\.story-viewer-empty-open \.story-viewer-caption,\s*html body \.story-viewer\.story-viewer-empty-open \.story-viewer-image,\s*html body \.story-viewer\.story-viewer-empty-open \.story-viewer-nav\s*\{\s*display:none!important\s*\}/g;
  assert.equal([...css.matchAll(hiddenControlsRule)].length, 1);
});

test('Story Viewer empty-state Done-button active transform has one authoritative copy', () => {
  const css = read('story-viewer.css');
  const activeRule = /html body \.story-viewer\.story-viewer-empty-open \.story-viewer-empty-done:active\s*\{\s*transform:scale\(\.985\)!important\s*\}/g;
  assert.equal([...css.matchAll(activeRule)].length, 1);
});

test('AFV490 refreshes Story Viewer CSS cache keys on all five public pages', () => {
  for (const page of ['index.html', 'reviews.html', 'proofs.html', 'about.html', 'privacy.html']) {
    assert.match(read(page), /story-viewer\.css\?v=AFV490&card=5/, page);
  }
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '493.0.0');
  assert.equal(lock.version, '493.0.0');
  assert.equal(lock.packages[''].version, '493.0.0');
  assert.ok(readme.includes('Current release: AFV493'));
  assert.ok(history.includes('AFV490 — Remove Duplicate Story Viewer Empty-State Rules'));
});
