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
    assert.match(html, /bottom-nav\\.css\\?v=AFV503\\b/, `${page} must load the AFV503 navigation stylesheet`);
  }
});
