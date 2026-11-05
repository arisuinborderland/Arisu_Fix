'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const partial = fs.readFileSync(path.join(root, 'partials', 'site-header.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'footer-reference.css'), 'utf8');

test('About footer uses the same official logo asset as the shared site header', () => {
  const headerLogo = partial.match(/<img src="([^"]+)" alt="Official Arisu Fix logo"/)?.[1];
  const aboutLogo = html.match(/<img class="reference-about-profile" src="([^"]+)"/)?.[1];
  assert.ok(headerLogo);
  assert.ok(aboutLogo);
  assert.equal(aboutLogo.split('?')[0], headerLogo.split('?')[0]);
  assert.match(aboutLogo, /AFV476/);
});

test('About footer logo aligns with the title and uses a circular frame on mobile', () => {
  assert.match(css, /\.reference-about-profile \{[\s\S]*?align-self: flex-start !important/);
  assert.match(css, /border-radius: 50% !important/);
  assert.match(css, /margin-top: 0 !important/);
});

test('Created milestone card retains its date, description, CTA, and compact Option A sizing', () => {
  assert.match(html, /class="reference-about-created"/);
  assert.match(html, /Created on October 14, 2026/);
  assert.match(html, /class="reference-about-action"/);
  assert.match(html, /class="reference-about-created-check"/);
  assert.match(css, /padding: 4px 6px !important/);
});
