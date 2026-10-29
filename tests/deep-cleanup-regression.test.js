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

  assert.match(proofs, /script\.js\?v=AFV\d+/);
  assert.doesNotMatch(proofs, /privacy-year\.js/);
  assert.match(shared, /getElementById\("year"\)/);
  assert.match(privacy, /privacy-year\.js\?v=AFV\d+/);
});

test('Production build uses an explicit allowlist and excludes internal project files', () => {
  const build = read('build.js');
  assert.match(build, /const publicRootFiles = new Set/);
  assert.match(build, /const publicAssetDirectories = new Set/);
  assert.match(build, /verifyExactPublicOutput\(\)/);
  assert.match(build, /Cloudflare Pages Functions/);
  assert.match(build, /\.sql/);
});


test('Story Admin keeps one global story-view-label font-size declaration', () => {
  const css = read('story-admin.css');
  const matches = css.match(/\.story-view-label\s*\{\s*font-size:\s*9px\s*!important;?\s*\}/g) || [];
  assert.equal(matches.length, 1);
});

test('Proofs CSS keeps one narrow topbar horizontal-padding declaration', () => {
  const css = read('proofs.css');
  const rule = /html body\.proofs-document \.topbar\s*\{\s*padding-left:\s*9px;\s*padding-right:\s*9px;\s*\}/g;
  assert.equal([...css.matchAll(rule)].length, 1);
});

  const css = read('proofs.css');
  const selector = /html body\.proofs-document \.topbar > \.header-meta\s*\{\s*gap:\s*6px !important;\s*\}/g;
  assert.equal([...css.matchAll(selector)].length, 1);
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

  const css = read('proofs.css');
  const selector = /html body\.proofs-document \.topbar > \.header-meta\s*\{\s*gap:\s*6px !important;\s*\}/g;
  assert.equal([...css.matchAll(selector)].length, 1);
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
