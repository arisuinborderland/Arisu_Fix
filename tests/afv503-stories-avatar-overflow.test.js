const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'bottom-nav.css'), 'utf8');

test('AFV503 keeps the shared mobile Stories avatar, halo, and count badge unclipped', () => {
  const rule = css.slice(css.indexOf('/* AFV503:'));
  assert.ok(rule.includes('/* AFV503:'), 'AFV503 mobile overflow rule exists');

  assert.match(rule, /nav\\.mobile-bottom-nav[\\s\\S]*?overflow:\\s*visible\\s*!important/);
  assert.match(rule, /\\.mobile-nav-stories[\\s\\S]*?overflow:\\s*visible\\s*!important/);
  assert.match(rule, /\\.mobile-nav-story-avatar[\\s\\S]*?overflow:\\s*visible\\s*!important/);
  assert.match(rule, /\\.mobile-nav-story-count[\\s\\S]*?overflow:\\s*visible\\s*!important/);
  for (const page of ['home-page', 'reviews-document', 'proofs-document', 'about-page', 'privacy-page']) {
    assert.ok(rule.includes(`body.${page}`), `rule covers ${page}`);
  }
});
