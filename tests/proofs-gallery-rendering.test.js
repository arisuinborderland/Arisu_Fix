'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'proofs.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'proofs.html'), 'utf8');

test('gallery count elements cover all album categories and the all-items total', () => {
  for (const id of [
    'allProofCount',
    'suspendedProofCount',
    'disabledProofCount',
    'twoFaProofCount',
    'instagramHackedProofCount'
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing count element: ${id}`);
    assert.ok(source.includes(`"${id}"`), `gallery does not update count element: ${id}`);
  }
});

test('gallery filters records by the selected category and calculates counts from valid proofs', () => {
  assert.match(source, /const validProofs = recoveryProofs\.filter\([\s\S]*?proof\.title[\s\S]*?proof\.image \|\| proof\.video/);
  assert.match(source, /activeProofCategory === "all" \|\| proof\.category === activeProofCategory/);
  assert.match(source, /const countFor = \(category\) => validProofs\.filter/);
});

test('gallery retains the six-item page size and paginates the filtered collection', () => {
  assert.match(source, /const PROOFS_PER_PAGE = 6/);
  assert.match(source, /Math\.ceil\(filtered\.length \/ PROOFS_PER_PAGE\)/);
  assert.match(source, /filtered\.slice\(startIndex, startIndex \+ PROOFS_PER_PAGE\)/);
});

test('gallery keeps the video, multiple-image, and single-image rendering branches', () => {
  assert.match(source, /if \(proof\.video\)/);
  assert.match(source, /Array\.isArray\(proof\.images\) && proof\.images\.length > 1/);
  assert.match(source, /media = document\.createElement\("video"\)/);
  assert.match(source, /media = document\.createElement\("div"\)/);
  assert.match(source, /media = document\.createElement\("img"\)/);
});

test('empty 2FA and Instagram albums remain available as intentional placeholders', () => {
  assert.match(source, /\["2fa", "instagram-hacked"\]\.includes\(album\.category\)/);
  assert.match(source, /This album is ready\. Add approved screenshots and customer-approved examples here when they are available\./);
  assert.match(source, /\["2fa", "instagram-hacked"\]\.includes\(activeProofCategory\)/);
});

test('media error handling remains present for single and multiple proof images', () => {
  assert.match(source, /image\.addEventListener\("error", \(\) => \{ image\.hidden = true; \}\)/);
  assert.match(source, /media\.addEventListener\("error", \(\) => \{ card\.hidden = true; \}\)/);
});
