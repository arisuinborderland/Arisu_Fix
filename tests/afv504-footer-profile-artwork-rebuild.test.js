'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const sharedFooterPages = ['index.html', 'reviews.html', 'proofs.html', 'about.html'];
const pageClasses = ['home-page', 'reviews-document', 'proofs-document', 'about-page'];
const css = fs.readFileSync(path.join(root, 'footer-reference.css'), 'utf8');

test('AFV504 uses the dedicated footer artwork component on all shared-footer pages', () => {
  for (const file of sharedFooterPages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /class="reference-about-artwork"/, file);
    assert.match(html, /class="reference-about-artwork-image"[^>]*width="88"[^>]*height="88"/, file);
    assert.match(html, /footer-reference\.css\?v=AFV504&footerart=1/, file);
    assert.doesNotMatch(html, /class="reference-about-profile"/, file);
  }
});

test('Footer artwork is independently enlarged, centered, transparent, and unclipped', () => {
  const component = css.slice(css.indexOf('/* AFV504 — Dedicated footer profile artwork component.'));
  assert.ok(component.length > 0);
  assert.match(component, /\.reference-about-artwork\s*\{[\s\S]*?overflow:\s*visible/);
  assert.match(component, /\.reference-about-artwork-image\s*\{[\s\S]*?position:\s*absolute/);
  assert.match(component, /width:\s*88px/);
  assert.match(component, /height:\s*88px/);
  assert.match(component, /transform:\s*translate\(-50%, -50%\)/);
  assert.match(component, /object-fit:\s*contain/);
  assert.match(component, /border:\s*0/);
  assert.match(component, /border-radius:\s*0/);
  assert.match(component, /background:\s*transparent/);
  assert.match(component, /clip-path:\s*none/);
  assert.match(component, /width:\s*78px/);
  assert.match(component, /height:\s*78px/);
});

test('AFV504 removes superseded footer profile image override blocks', () => {
  assert.doesNotMatch(css, /html body\.(?:home-page|reviews-document|proofs-document|about-page) \.reference-footer \.reference-about-profile/);
  assert.doesNotMatch(css, /\.reference-footer \.reference-about-profile\s*\{\s*flex:\s*0 0 52px/);
});

test('The fifth public page keeps its independent footer; shared Stories navigation remains untouched', () => {
  const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
  assert.doesNotMatch(privacy, /reference-about-artwork/);
  assert.match(privacy, /<footer><a class=\"brand\"[\\s\\S]*?arisu-profile\\.jpg/, 'Privacy footer keeps its existing profile implementation');
  const nav = fs.readFileSync(path.join(root, 'bottom-nav.css'), 'utf8');
  assert.doesNotMatch(nav, /AFV504|reference-about-artwork/);
  assert.equal((css.match(/\\.reference-about-profile/g) || []).length, 0, 'obsolete footer profile image selectors are removed');
  for (const file of sharedFooterPages) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /<nav class="mobile-bottom-nav"/, file);
  }
});
