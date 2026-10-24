const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('Story Viewer no longer carries the disabled blurred-backdrop implementation', () => {
  const css = read('story-viewer.css');
  const js = read('story-viewer.js');

  assert.doesNotMatch(css, /story-viewer-card::before/);
  assert.doesNotMatch(css, /--story-image-bg/);
  assert.doesNotMatch(css, /filter:\s*blur\(24px\)/);
  assert.match(css, /background:\s*radial-gradient\(ellipse at 50% 42%/);
  assert.doesNotMatch(js, /--story-image-bg/);
});

test('Proofs page updates its footer year only through the shared script', () => {
  const proofs = read('proofs.html');
  const shared = read('script.js');
  const privacy = read('privacy.html');

  assert.match(proofs, /script\.js\?v=AFV263/);
  assert.doesNotMatch(proofs, /privacy-year\.js/);
  assert.match(shared, /getElementById\("year"\)/);
  assert.match(privacy, /privacy-year\.js\?v=AFV263/);
});

test('staging fixture uses a version-neutral missing-object label', () => {
  const smoke = read('scripts/staging-stories-smoke.js');
  assert.match(smoke, /stories\/audit-missing-\$\{crypto\.randomUUID\(\)\}\.jpg/);
  assert.doesNotMatch(smoke, /afv179/i);
});


test('Story Admin keeps one global story-view-label font-size declaration', () => {
  const css = read('story-admin.css');
  const matches = css.match(/\.story-view-label\s*\{\s*font-size:\s*9px\s*!important;?\s*\}/g) || [];
  assert.equal(matches.length, 1);
});

test('Proofs CSS retains one copy of exact duplicate declarations', () => {
  const css = read('proofs.css');
  const hiddenRule = '.button.secondary.proofs-back-to-site[hidden]{display:none!important}';
  const pairBaseRule = '.proof-image-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:stretch;gap:2px;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;background:#e8edf5}';
  const redundantPairRule = '.proof-image-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:stretch;gap:2px;width:100%;height:100%;overflow:hidden}';

  assert.equal(css.split(hiddenRule).length - 1, 1);
  assert.equal(css.split(pairBaseRule).length - 1, 1);
  assert.equal(css.includes(redundantPairRule), false);
  assert.equal((css.match(/@media\(max-width:600px\)\{\.proof-image-pair\{gap:2px\}\}/g) || []).length, 0);
});
