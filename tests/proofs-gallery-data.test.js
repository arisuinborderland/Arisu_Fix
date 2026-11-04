'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'proofs.js'), 'utf8');

function readProofData() {
  const match = source.match(/const recoveryProofs = (\[[\s\S]*?\]);/);
  assert.ok(match, 'recoveryProofs data array must exist');
  return vm.runInNewContext(match[1]);
}

test('Recovery Proofs data contains only supported album categories', () => {
  const supported = new Set(['suspended', 'disabled', '2fa', 'instagram-hacked']);
  const proofs = readProofData();

  assert.ok(proofs.length > 0, 'at least one proof record should be configured');
  for (const proof of proofs) {
    assert.ok(proof && proof.title, 'each proof must have a title');
    assert.ok(proof.image || proof.video, `proof "${proof.title}" must define image or video media`);
    assert.ok(supported.has(proof.category), `unsupported category: ${proof.category}`);
  }
});

test('every locally referenced proof image exists in the repository', () => {
  const proofs = readProofData();
  const imagePaths = proofs.flatMap((proof) => [
    ...(proof.image ? [proof.image] : []),
    ...(Array.isArray(proof.images) ? proof.images : []),
    ...(proof.coverImage ? [proof.coverImage] : [])
  ]);

  for (const imagePath of imagePaths) {
    const localPath = imagePath.split('?')[0];
    assert.ok(
      fs.existsSync(path.join(root, localPath)),
      `missing proof image asset: ${localPath}`
    );
  }
});

test('proof records have unique titles and do not reuse the same primary media path', () => {
  const proofs = readProofData();
  const titles = proofs.map((proof) => proof.title);
  const primaryMedia = proofs.flatMap((proof) => [
    ...(proof.image ? [proof.image.split('?')[0]] : []),
    ...(Array.isArray(proof.images) ? proof.images.map((item) => item.split('?')[0]) : []),
    ...(proof.video ? [proof.video] : [])
  ]);

  assert.equal(new Set(titles).size, titles.length, 'proof titles must be unique');
  assert.equal(new Set(primaryMedia).size, primaryMedia.length, 'primary proof media paths must be unique');
});
