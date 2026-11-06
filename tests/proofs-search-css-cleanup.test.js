'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('proofs.html');
const css = read('proofs.css');
const runtime = read('proofs.js');

test('Recovery Proofs no longer contains the retired search field', () => {
  assert.doesNotMatch(html, /proof-search/);
  assert.doesNotMatch(runtime, /proof-search/);
  assert.doesNotMatch(css, /\.proof-search\b/);
});

test('Recovery Proofs retains active gallery, category filter, pagination, and focus styles', () => {
  assert.match(css, /\.proof-gallery-v2\s*\{/);
  assert.match(css, /\.proof-filters\s*\{/);
  assert.match(css, /\.proof-filter:focus-visible/);
  assert.match(css, /\.proof-pagination\s*\{/);
  assert.match(css, /\.proof-page-button:focus-visible/);
});

test('AFV487 refreshes the Proofs stylesheet and release metadata', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');
  assert.match(html, /proofs\.css\?v=AFV487&prooffull=2/);
  assert.equal(pkg.version, '496.0.0');
  assert.equal(lock.version, '496.0.0');
  assert.equal(lock.packages[''].version, '496.0.0');
  assert.ok(readme.includes('Current release: AFV496'));
  assert.ok(history.includes('AFV487 — Remove Retired Recovery Proof Search CSS'));
});
