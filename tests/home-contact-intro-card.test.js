'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('Homepage combines recovery identity and contact invitation in one accessible card', () => {
  const start = html.indexOf('<section class="compact-intro contact-intro-card"');
  const end = html.indexOf('</section>', start);
  assert.ok(start >= 0 && end > start, 'combined contact intro card exists');
  const card = html.slice(start, end);
  assert.ok(card.includes('ACCOUNT RECOVERY ASSISTANCE'));
  assert.ok(card.includes('contact-intro-pulse'), 'animated blue pulse sits beside the assistance label');
  assert.ok(card.includes('EST. 2018'));
  assert.ok(card.includes('Let’s Connect.'));
  assert.ok(card.includes('Get personal assistance directly from Arisu.'));
  assert.ok(card.includes('aria-labelledby="introTitle"'));
  assert.ok(!html.includes('Need my help?'));
  assert.ok(!html.includes('Contact Arisu directly.'));
});

test('Existing WhatsApp and Service Status content remains in place', () => {
  assert.ok(html.includes('FASTEST CONTACT METHOD'));
  assert.ok(html.includes('WhatsApp</span> is the preferred contact method.'));
  assert.ok(html.includes('Message Me on WhatsApp'));
  assert.ok(html.includes('id="serviceStatus"'));
  assert.ok(html.includes('7:00 AM – 10:00 PM'));
});

test('Combined contact intro has responsive glass styling scoped to the homepage', () => {
  assert.ok(css.includes('body.home-page main > .compact-intro.contact-intro-card'));
  assert.ok(css.includes('contact-intro-label'));
  assert.ok(css.includes('@keyframes contact-intro-pulse'));
  assert.ok(css.includes('@keyframes contact-intro-ripple'));
  assert.ok(css.includes('top:-2px'));
  assert.ok(css.includes('padding:8px 13px !important'));
  assert.ok(css.includes('padding-top:8px !important'));
  assert.ok(css.includes('padding-bottom:8px !important'));
  assert.ok(css.includes('padding:10px 16px !important'));
  assert.ok(css.includes('padding-top:10px !important'));
  assert.ok(css.includes('padding-bottom:10px !important'));
  assert.ok(css.includes('contact-intro-est'));
  assert.ok(css.includes('contact-intro-icon'));
  assert.ok(css.includes('@media (max-width:600px)'));
  assert.ok(css.includes('@media (max-width:360px)'));
  assert.ok(html.includes('styles.css?v=AFV478'));
});


test('Homepage mobile micro-adjustments remain scoped and preserve the approved desktop layout', () => {
  const mobileBlock = css.slice(css.lastIndexOf('/* AFV478 mobile micro-adjustments'));
  assert.ok(mobileBlock.includes('@media (max-width:600px)'));
  assert.ok(mobileBlock.includes('main > #daily-bible-verse.daily-verse-card'));
  assert.match(mobileBlock, /margin:2px auto 6px !important/);
  assert.match(mobileBlock, /contact-intro-copy h1\s*\{\s*font-size:clamp\(20px,5\.5vw,25px\) !important/);
  assert.match(mobileBlock, /contact-intro-copy p\s*\{\s*position:relative;\s*top:-2px/);
  assert.match(mobileBlock, /contact-intro-card\s*\{\s*padding-bottom:6px !important/);
  assert.ok(mobileBlock.includes('@media (max-width:360px)'));
  assert.ok(html.includes('styles.css?v=AFV478&desktoplayout=1&contactintro=2&mobilepolish=1'));
});
