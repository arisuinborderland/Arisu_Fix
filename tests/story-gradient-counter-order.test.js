const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('all Story Viewer pages expose an accessible current/total counter', () => {
  for (const page of ['index.html', 'about.html', 'privacy.html', 'proofs.html', 'reviews.html']) {
    const html = read(page);
    assert.match(html, /class="story-viewer-counter"[^>]*aria-live="polite"/, page);
    assert.match(html, /story-viewer\.css\?v=AFV388/, page);
    assert.match(html, /story-viewer\.js\?v=AFV367/, page);
  }
});

test('Story progress uses the animated gradient sheen and respects reduced motion', () => {
  const css = read('story-viewer.css');
  const js = read('story-viewer.js');
  assert.match(css, /linear-gradient\(90deg,#7c3aed 0%,#d946ef 52%,#22d3ee 100%\)/);
  assert.match(css, /story-viewer-progress-sheen/);
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
  assert.ok(css.includes('.story-viewer-progress-fill::after{animation:none!important;opacity:0!important}'));
  assert.ok(!css.includes('.story-viewer-progress-fill{transition:none!important}.story-viewer-progress-fill::after'));
  assert.ok(!css.includes('html body .story-viewer .story-viewer-progress-fill{transition:none!important}'));
  assert.match(js, /segment\.classList\.toggle\('is-active', fillIndex === index\)/);
});

test('Story counter updates for the active story and after a background refresh', () => {
  const js = read('story-viewer.js');
  assert.match(js, /function updateStoryCounter\(\)/);
  assert.match(js, /storyCounter\.textContent = total/);
  assert.match(js, /index = freshIndex;\s*updateStoryCounter\(\)/);
});

test('new uploads and newly published drafts append; legacy ties sort oldest first', () => {
  const api = read('functions/api/stories.js');
  assert.match(api, /async function getNextStorySortOrder\(/);
  assert.match(api, /sort_order: nextSortOrder/);
  assert.match(api, /patch\.sort_order = await getNextStorySortOrder\(config, id\)/);
  assert.equal((api.match(/order=sort_order\.asc,published_at\.asc,id\.asc/g) || []).length, 2);
});
