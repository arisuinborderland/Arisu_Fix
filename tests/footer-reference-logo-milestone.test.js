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
const pageClasses = ['home-page', 'reviews-document', 'proofs-document', 'about-page'];

test('All shared-footer pages use the official shared-header logo asset', () => {
  const headerLogo = partial.match(/<img src="([^"]+)" alt="Official Arisu Fix logo"/)?.[1];
  assert.ok(headerLogo);
  for (const [file, source] of Object.entries(pageHtml)) {
    const aboutLogo = source.match(/<img class="reference-about-profile" src="([^"]+)"/)?.[1];
    assert.ok(aboutLogo, file);
    assert.equal(aboutLogo.split('?')[0], headerLogo.split('?')[0], file);
    assert.match(aboutLogo, /AFV477/, file);
  }
});

test('About footer logo aligns with the title and uses a circular frame on mobile', () => {
  assert.match(css, /border-radius: 50% !important/);
  assert.match(css, /align-self: flex-start !important/);
  assert.match(css, /margin-top: 0 !important/);
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
    assert.match(source, /footer-reference\.css\?v=AFV477/, file);
  }
  assert.match(css, /grid-template-areas: "copy check" "action action"/);
  assert.match(css, /justify-content: center !important/);
  for (const pageClass of pageClasses) {
    assert.ok(css.includes(`html body.${pageClass} .reference-footer .reference-about-created`), pageClass);
    assert.ok(css.includes(`html body.${pageClass} .reference-footer .reference-about-action-row`), pageClass);
  }
});


test('Desktop shared-footer pages constrain the calendar icon and center the milestone CTA', () => {
  assert.match(css, /@media screen and \\(min-width: 601px\\)/);
  assert.match(css, /grid-template-areas: "copy check" "action action"/);
  assert.match(css, /\.reference-about-calendar[\\s\\S]*?width: 34px !important/);
  assert.match(css, /\.reference-about-action-row[\\s\\S]*?justify-content: center !important/);
  for (const pageClass of pageClasses) {
    assert.ok(css.includes(`html body.${pageClass} .reference-footer .reference-about-calendar`), pageClass);
    assert.ok(css.includes(`html body.${pageClass} .reference-footer .reference-about-action-row`), pageClass);
  }
});
