const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'bottom-nav.css'), 'utf8');

test('AFV503 keeps the shared mobile Stories avatar, halo, and count badge unclipped', () => {
  const rule = css.slice(css.indexOf('/* AFV503:'));
  assert.ok(rule.includes('/* AFV503:'), 'AFV503 mobile overflow rule exists');

  assert.ok(rule.includes('nav.mobile-bottom-nav') && rule.includes('overflow: visible !important;'));
  assert.ok(rule.includes('.mobile-nav-stories') && rule.includes('overflow: visible !important;'));
  assert.ok(rule.includes('.mobile-nav-story-avatar') && rule.includes('overflow: visible !important;'));
  assert.ok(rule.includes('.mobile-nav-story-count') && rule.includes('overflow: visible !important;'));
  for (const page of ['home-page', 'reviews-document', 'proofs-document', 'about-page', 'privacy-page']) {
    assert.ok(rule.includes(`body.${page}`), `rule covers ${page}`);
  }
});

test('AFV503 release metadata and changed navigation cache tokens stay synchronized', () => {
  const root = path.resolve(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const readme = fs.readFileSync(path.join(root, 'README.txt'), 'utf8');

  assert.equal(pkg.version, '503.0.0');
  assert.equal(lock.version, '503.0.0');
  assert.equal(lock.packages[''].version, '503.0.0');
  assert.match(readme, /^Version: AFV503$/m);
  assert.match(readme, /^Current release: AFV503$/m);
  assert.match(readme, /^Package version: 503\.0\.0$/m);

  for (const page of ['index.html', 'reviews.html', 'proofs.html', 'about.html', 'privacy.html']) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /bottom-nav\.css\?v=AFV503[^\"']*storyavatar=headerref2/, `${page} must load the latest AFV503 Stories avatar stylesheet`);
  }
});

test('AFV503 renders transparent Stories logo artwork like the shared header logo', () => {
  const refinement = css.slice(css.indexOf('/* AFV503 refinement 2:'));
  assert.ok(refinement.includes('/* AFV503 refinement 2:'), 'direct transparent-logo refinement exists');
  assert.ok(refinement.includes('object-fit: contain !important;'));
  assert.ok(refinement.includes('object-position: center !important;'));
  assert.ok(refinement.includes('border: 0 !important;'));
  assert.ok(refinement.includes('border-radius: 0 !important;'));
  assert.ok(refinement.includes('background: transparent !important;'));
  assert.ok(refinement.includes('clip-path: none !important;'));
  assert.ok(refinement.includes('animation: arcStoriesHaloPulse 2.1s ease-in-out infinite !important;'));
  for (const page of ['home-page', 'reviews-document', 'proofs-document', 'about-page', 'privacy-page']) {
    assert.ok(refinement.includes(`body.${page}`), `header-matched artwork treatment covers ${page}`);
  }
});
