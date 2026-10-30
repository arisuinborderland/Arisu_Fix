'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV357 preloads the Daily Bible Verse background as a high-priority image', () => {
  const index = read('index.html');
  const preload = index.match(/<link\\b(?=[^>]*rel="preload")(?=[^>]*as="image")[^>]*>/i);
  assert.ok(preload, 'homepage must preload the LCP banner image');
  assert.match(preload[0], /href="\\/verse-lake-photo\\.jpg\\?v=AFV266"/);
  assert.match(preload[0], /fetchpriority="high"/i);
  assert.ok(index.indexOf(preload[0]) < index.indexOf('rel="stylesheet"'), 'preload must appear before stylesheet requests');
  assert.match(index, /scroll-reveal\\.js\\?v=AFV357/);
});

test('AFV357 keeps the first-viewport Bible Verse visible and preserves scroll reveal', () => {
  const reveal = read('scroll-reveal.js');
  assert.match(reveal, /main > #daily-bible-verse/);
  assert.match(reveal, /el\\.id === "daily-bible-verse"/);
  assert.match(reveal, /el\\.getBoundingClientRect\\(\\)/);
  assert.match(reveal, /el\\.classList\\.add\\("arc-scroll-reveal-visible"\\)/);
  assert.match(reveal, /target\\.classList\\.remove\\("arc-scroll-reveal-visible"\\)/);
  assert.match(reveal, /target\\.classList\\.add\\("arc-scroll-reveal-visible"\\)/);
});

test('AFV357 release metadata is synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.equal(pkg.version, '357.0.0');
  assert.equal(lock.version, '357.0.0');
  assert.equal(lock.packages[''].version, '357.0.0');
  assert.match(readme, /Current release: AFV357/);
  assert.match(history, /^AFV357 — LCP First-Paint Optimization/);
});
