'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV459 homepage social previews use blur-up loading without changing image frames', () => {
  const css = read('styles.css');
  const script = read('script.js');
  const index = read('index.html');

  for (const selector of [
    '.tiktok-showcase .preview-original',
    '.facebook-showcase .preview-original',
    '.recovery-proofs-showcase .recovery-proofs-preview img',
    '.social-feedback-card .reviews-grid-featured .review-proof-image img'
  ]) {
    assert.ok(css.includes(selector), `CSS must cover ${selector}`);
    assert.ok(script.includes(selector.replace('body.home-page ', '')), `load handler must cover ${selector}`);
  }
  assert.match(css, /filter:\s*blur\(10px\)/);
  assert.match(css, /filter:\s*blur\(0\)/);
  assert.match(css, /transition:[^;]*250ms ease/);
  assert.match(script, /image\.naturalWidth > 0/);
  assert.match(index, /social-collage/);
});

test('AFV459 desktop hover zoom is image-only, centered, clipped, and limited to 1.05x', () => {
  const css = read('styles.css');
  assert.match(css, /@media\s*\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/);
  assert.match(css, /transform-origin:\s*center center/);
  assert.match(css, /transform:\s*scale\(1\.05\)/);
  assert.match(css, /social-profile-preview[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /recovery-proofs-preview[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /review-proof-image[\s\S]*?overflow:\s*hidden/);
  assert.match(css, /border-color:\s*#cbbcf0/);
  assert.match(css, /transform:\s*none !important/);
});
