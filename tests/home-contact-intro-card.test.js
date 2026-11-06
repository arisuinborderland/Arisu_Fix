'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('Homepage Let’s Connect card keeps its approved markup and existing contact sections', () => {
  const start = html.indexOf('<section class="compact-intro contact-intro-card"');
  const end = html.indexOf('</section>', start);
  assert.ok(start >= 0 && end > start, 'combined contact intro card exists');
  const card = html.slice(start, end);
  assert.ok(card.includes('ACCOUNT RECOVERY ASSISTANCE'));
  assert.ok(card.includes('EST. 2018'));
  assert.ok(card.includes('Let’s Connect.'));
  assert.ok(card.includes('Get personal assistance directly from Arisu.'));
  assert.ok(html.includes('id="whatsappFeatureTitle"'));
  assert.ok(html.includes('id="serviceStatus"'));
});

test('AFV484 desktop Let’s Connect card overrides the legacy 900px max-width rule', () => {
  const marker = '/* AFV484 desktop width restoration — match the WhatsApp contact card edges. */';
  const start = css.lastIndexOf(marker);
  assert.ok(start >= 0, 'desktop width restoration rule exists at the end of the stylesheet');
  const desktopBlock = css.slice(start);
  assert.match(desktopBlock, /@media\s*\(min-width:\s*900px\)/);
  assert.match(desktopBlock, /html body\.home-page main > \.compact-intro\.contact-intro-card\s*\{[^}]*width:\s*100%\s*!important;[^}]*max-width:\s*100%\s*!important;/);
  assert.match(desktopBlock, /margin:\s*0 auto clamp\(14px, 1\.2vw, 20px\)\s*!important/);
  assert.match(desktopBlock, /padding:\s*14px 24px\s*!important/);
  assert.match(desktopBlock, /contact-intro-icon\s*\{[^}]*width:\s*54px\s*!important;[^}]*height:\s*54px\s*!important;/);
  assert.doesNotMatch(desktopBlock, /@media\s*\(max-width:/);
});

test('Mobile Let’s Connect dimensions remain governed by the existing mobile-only rules', () => {
  const marker = '/* AFV484 desktop width restoration — match the WhatsApp contact card edges. */';
  const desktopStart = css.lastIndexOf(marker);
  assert.ok(desktopStart > 0);
  const cardStyles = css.slice(css.indexOf('/* AFV484 — Restore the approved homepage'), desktopStart);
  assert.match(cardStyles, /@media\s*\(max-width:\s*899px\)/);
  assert.match(cardStyles, /padding:8px 13px\s*!important/);
  assert.match(cardStyles, /padding-bottom:4px\s*!important/);
  assert.match(cardStyles, /@media\s*\(max-width:\s*360px\)/);
});
