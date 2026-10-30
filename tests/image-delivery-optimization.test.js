'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV355 production build generates all seven optimized WebP delivery assets', () => {
  const build = read('build.js');
  const expected = [
    'assets/performance/arisu-profile-thumb.webp',
    'assets/performance/tiktok-profile-preview.webp',
    'assets/performance/facebook-page-preview.webp',
    'proofs/arisu-suspended-account-180-days-preview.webp',
    'proofs/file_0000000089048211995f9a93297d1146-preview.webp',
    'reviews/review-slot-1-thumb.webp',
    'reviews/review-slot-1.webp'
  ];
  for (const output of expected) assert.ok(build.includes(output), `build must generate ${output}`);
  assert.match(build, /await sharp\(input\)[\s\S]*?\.webp\(/);
  assert.match(build, /expected\.push\(\.\.\.generatedImageAssets\.map/);
});

test('AFV355 homepage and Reviews page use optimized WebP image URLs', () => {
  const index = read('index.html');
  const reviews = read('reviews.html');
  for (const asset of [
    'assets/performance/arisu-profile-thumb.webp?v=AFV355',
    'assets/performance/tiktok-profile-preview.webp?v=AFV355',
    'assets/performance/facebook-page-preview.webp?v=AFV355',
    'proofs/arisu-suspended-account-180-days-preview.webp?v=AFV355',
    'proofs/file_0000000089048211995f9a93297d1146-preview.webp?v=AFV355'
  ]) assert.ok(index.includes(asset), `homepage must reference ${asset}`);
  assert.match(index, /reviews\/review-slot-1-thumb\.webp\?v=AFV355/);
  assert.match(reviews, /reviews\/review-slot-1-thumb\.webp\?v=AFV355/);
  assert.match(reviews, /data-full-src="reviews\/review-slot-1\.webp\?v=AFV355"/);
});

test('AFV355 review lightbox loads the full-size source and latest main features remain', () => {
  const lightbox = read('review-lightbox.js');
  const index = read('index.html');
  assert.match(lightbox, /image\.dataset\.fullSrc \|\| image\.currentSrc \|\| image\.src/);
  assert.ok(index.includes('Message Me on WhatsApp'), 'latest singular WhatsApp CTA must remain');
  assert.ok(index.includes('story-viewer.js?v=AFV357'), 'latest AFV346 Stories Viewer must remain');
});

test('AFV356 ships a valid plain-text robots.txt instead of the homepage fallback', () => {
  const build = read('build.js');
  const robots = read('robots.txt');
  assert.match(build, /"_headers", "robots\.txt", "index\.html"/);
  assert.match(robots, /^User-agent: \*\s*$/m);
  assert.match(robots, /^Allow: \/\s*$/m);
  assert.match(robots, /^Disallow: \/story-admin\.html\s*$/m);
  assert.doesNotMatch(robots, /<!doctype html|<html/i);
});
