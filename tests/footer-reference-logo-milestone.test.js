'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const pages = ['index.html', 'reviews.html', 'proofs.html', 'about.html'];
const pageHtml = Object.fromEntries(pages.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const partial = fs.readFileSync(path.join(root, 'partials', 'site-header.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'footer-reference.css'), 'utf8');
const headerCss = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const pageClasses = ['home-page', 'reviews-document', 'proofs-document', 'about-page'];

test('All shared-footer pages use the official shared-header logo asset', () => {
  const headerLogo = partial.match(/<img\b(?=[^>]*\bclass="[^"]*\blogo\b[^"]*\bprofile-logo\b")[^>]*\bsrc="([^"]+)"[^>]*\balt="Official Arisu Fix logo"/)?.[1];
  assert.ok(headerLogo);
  assert.match(headerLogo, /\?v=AFV502$/, 'shared header logo cache token is current');
  assert.doesNotMatch(partial, /<span class="logo profile-logo">[\s\S]*?<img/, 'header logo must not use the clipping wrapper');
  for (const [file, source] of Object.entries(pageHtml)) {
    const aboutLogo = source.match(/<img class="reference-about-artwork-image" src="([^"]+)"/)?.[1];
    assert.ok(aboutLogo, file);
    assert.equal(aboutLogo.split('?')[0], headerLogo.split('?')[0], file);
    assert.match(aboutLogo, /AFV504/, file);
  }
});

test('AFV503 removes obsolete nested-image logo selectors', () => {
  const baseCss = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  const sharedHeaderCss = fs.readFileSync(path.join(root, 'site-header.css'), 'utf8');
  assert.equal(baseCss.includes('.profile-logo img{'), false);
  assert.equal(sharedHeaderCss.includes('>.logo img {'), false);
});

test('AFV502 shared header logo renders the full transparent artwork without clipping', () => {
  assert.match(headerCss, /html body \.topbar > \.brand \{[\s\S]*?overflow: visible !important/);
  assert.match(headerCss, /html body \.topbar\.site-header > a\.brand > img\.logo\.profile-logo \{[\s\S]*?object-fit: contain !important/);
  assert.match(headerCss, /clip-path: none !important/);
});

test('About footer logo aligns with the title and uses a circular frame on mobile', () => {
  assert.match(css, /\.reference-about-artwork::before[\s\S]*?border-radius: 50%/);
  assert.match(css, /\.reference-about-artwork[\s\S]*?align-self: flex-start/);
  assert.match(css, /\.reference-about-artwork[\s\S]*?margin: 0/);
  for (const pageClass of pageClasses) {
    assert.ok(css.includes(`html body.${pageClass} .reference-footer .reference-about-profile`), pageClass);
  }
});

test('All shared-footer pages use the approved calendar, date, description, centered CTA, and verified mark', () => {
  for (const [file, source] of Object.entries(pageHtml)) {
    assert.match(source, /class="reference-about-created"/, file);
    assert.match(source, /class="reference-about-created-heading"[\s\S]*?Created on October 14, 2026/, file);
    assert.match(source, /class="reference-about-calendar"/, file);
    assert.match(source, /A small milestone marking the beginning of Arisu Fix\./, file);
    assert.match(source, /class="reference-about-action-row"[\s\S]*?class="reference-about-action"/, file);
    assert.match(source, /class="reference-about-created-check"/, file);
    assert.doesNotMatch(source, /class="reference-about-arrow"/, file);
    assert.match(source, /footer-reference\.css\?v=AFV504&footerart=1/, file);
  }
  assert.match(css, /grid-template-areas: "copy check" "action action"/);
  assert.match(css, /justify-content: center !important/);
  for (const pageClass of pageClasses) {
    assert.ok(css.includes(`html body.${pageClass} .reference-footer .reference-about-created`), pageClass);
    assert.ok(css.includes(`html body.${pageClass} .reference-footer .reference-about-action-row`), pageClass);
  }
});


test('Desktop shared-footer pages constrain the calendar icon and center the milestone CTA', () => {
  const desktopCss = css.slice(css.indexOf("@media screen and (min-width: 601px)"));
  assert.ok(desktopCss.length > 0);
  assert.ok(desktopCss.includes(".reference-about-calendar"));
  assert.ok(desktopCss.includes("flex: 0 0 34px !important;"));
  assert.ok(desktopCss.includes("width: 34px !important;"));
  assert.ok(desktopCss.includes(".reference-about-action-row"));
  assert.ok(desktopCss.includes("justify-content: center !important;"));
  for (const pageClass of pageClasses) {
    assert.ok(desktopCss.includes(`html body.${pageClass} .reference-footer .reference-about-calendar`), pageClass);
    assert.ok(desktopCss.includes(`html body.${pageClass} .reference-footer .reference-about-action-row`), pageClass);
  }
});
