const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'bottom-nav.css'), 'utf8');

test('AFV503 keeps the shared mobile Stories avatar, halo, and count badge unclipped', () => {
  const rule = css.slice(css.indexOf('/* AFV503:'));
  assert.ok(rule.includes('/* AFV503:'), 'AFV503 mobile overflow rule exists');

  assert.match(rule, /nav\\.mobile-bottom-nav[\\s\\S]*?overflow:\\s*visible\\s*!important/);
  assert.ok(rule.includes('.mobile-nav-stories') && rule.includes('overflow: visible !important;'));
  assert.ok(rule.includes('.mobile-nav-story-avatar') && rule.includes('overflow: visible !important;'));
  assert.ok(rule.includes('.mobile-nav-story-count') && rule.includes('overflow: visible !important;'));
  for (const page of ['home-page', 'reviews-document', 'proofs-document', 'about-page', 'privacy-page']) {
    assert.ok(rule.includes(`body.${page}`), `rule covers ${page}`);
  }
});
