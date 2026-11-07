'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');

const styles = stripComments(read('styles.css'));
const proofsStyles = stripComments(read('proofs.css'));
const proofsRuntime = read('proofs.js');

test('AFV517 removes the retired proof-status CSS component', () => {
  assert.doesNotMatch(styles, /\.proof-status-[a-z0-9_-]+/i);
  assert.doesNotMatch(proofsStyles, /\.proof-status-[a-z0-9_-]+/i);
  assert.doesNotMatch(proofsRuntime, /proof-status-/);
});

test('AFV517 removes the orphaned Proofs status-list override', () => {
  assert.doesNotMatch(
    proofsStyles,
    /\.proof-gallery-v2\s+\.proof-card\s+\.proof-status-list\b/
  );
});

test('AFV517 preserves active proof-card styling and responsive padding', () => {
  assert.match(
    styles,
    /\.proof-card \.proof-image-link\s*\{\s*border-top:1px solid #e8edf6\s*\}/
  );

  assert.match(
    styles,
    /\.proof-card-copy\s*\{\s*padding:15px 15px 13px\s*\}/
  );

  assert.match(
    styles,
    /@media\s*\(max-width:460px\)\s*\{\s*\.proof-card-copy\s*\{\s*padding:12px\s*\}\s*\}/
  );

  assert.match(
    proofsStyles,
    /\.proof-gallery-v2 \.proof-card \.proof-card-copy\s*\{\s*order:1;padding:15px\s*\}/
  );

  assert.match(
    proofsRuntime,
    /copy\.className\s*=\s*["']proof-card-copy["']/
  );
});

test('AFV517 refreshes only the affected stylesheet cache keys', () => {
  for (const page of [
    'index.html',
    'reviews.html',
    'proofs.html',
    'about.html',
    'privacy.html'
  ]) {
    assert.match(read(page), /styles\.css\?v=AFV517(?:&[^"']*)?/);
  }

  assert.match(read('proofs.html'), /proofs\.css\?v=AFV517&prooffull=2/);

  // Loading-screen assets remain on their independently validated release.
  assert.match(read('index.html'), /loading-screen\.css\?v=AFV514/);
  assert.match(read('index.html'), /loading-screen\.js\?v=AFV514/);
});

test('AFV517 package, README, and release history metadata are synchronized', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const readme = read('README.txt');
  const history = read('RELEASE_HISTORY.txt');

  assert.equal(pkg.version, '517.0.0');
  assert.equal(lock.version, '517.0.0');
  assert.equal(lock.packages[''].version, '517.0.0');

  assert.match(readme, /^Version: AFV517$/m);
  assert.match(readme, /^Current release: AFV517$/m);
  assert.match(readme, /^Package version: 517\.0\.0$/m);
  assert.match(readme, /AFV517: removes the retired proof-status CSS component/);

  assert.ok(history.startsWith('AFV517 — Remove Retired Proof Status CSS'));
});
