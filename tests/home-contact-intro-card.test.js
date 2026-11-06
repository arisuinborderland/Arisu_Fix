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
  assert.ok(css.includes('padding-bottom:4px !important'));
  assert.ok(css.includes('margin:0 auto 10px !important'), 'mobile contact intro has a 2px larger gap before WhatsApp');
  assert.ok(css.includes('padding:10px 16px !important'));
  assert.ok(css.includes('padding-top:10px !important'));
  assert.ok(css.includes('padding-bottom:10px !important'));
  assert.ok(css.includes('contact-intro-est'));
  assert.ok(css.includes('contact-intro-icon'));
  assert.ok(css.includes('@media (max-width:600px)'));
  assert.ok(css.includes('@media (max-width:360px)'));
  assert.ok(html.includes('styles.css?v=AFV482'));
});


test('Homepage mobile micro-adjustments stay in existing responsive rules and preserve desktop layout', () => {
  const mobileBlock = css.slice(css.lastIndexOf('/* AFV479 mobile micro-adjustment'));
  assert.ok(mobileBlock.includes('@media (max-width:600px)'));
  assert.ok(mobileBlock.includes('main > #daily-bible-verse.daily-verse-card'));
  assert.match(mobileBlock, /margin:2px auto 6px !important/);
  assert.match(css, /html body\.home-page main > \.compact-intro\.contact-intro-card #introTitle\{font-size:calc\(clamp\(20px,5\.5vw,25px\) - 3px\) !important/);
  assert.match(css, /html body\.home-page main > \.compact-intro\.contact-intro-card \.contact-intro-copy p\{position:relative;top:-2px !important;/);
  assert.match(css, /body\.home-page main > \.compact-intro\.contact-intro-card\{gap:10px;margin:0 auto 10px !important;padding:8px 13px !important;padding-top:8px !important;padding-bottom:4px !important/);
  assert.match(css, /body\.home-page \.compact-intro\.contact-intro-card\{padding:8px !important;padding-bottom:4px !important/);
  const alignmentBlock = css.slice(css.lastIndexOf('/* AFV482 mobile contact icon balance'));
  assert.match(alignmentBlock, /\.contact-intro-icon\s*\{[^}]*width:\s*41px\s*!important;/);
  assert.match(alignmentBlock, /\.contact-intro-icon svg\s*\{[^}]*width:\s*24px\s*!important;/);
  assert.match(alignmentBlock, /@media \(max-width:360px\)[\s\S]*?\.contact-intro-icon\s*\{[^}]*width:\s*39px\s*!important;/);
  assert.ok(html.includes('styles.css?v=AFV482&desktoplayout=1&contactintro=4&mobilepolish=9'));
});

test('WhatsApp icon aligns horizontally with the Let’s Connect icon on mobile', () => {
  const alignmentBlock = css.slice(css.lastIndexOf('/* AFV482 mobile contact icon balance'));
  assert.match(alignmentBlock, /\.whatsapp-feature-icon\s*\{[^}]*width:\s*41px\s*!important;[^}]*height:\s*41px\s*!important;/);
  assert.match(alignmentBlock, /\.whatsapp-feature-icon\s*>\s*svg\s*\{[^}]*width:\s*24px\s*!important;[^}]*height:\s*24px\s*!important;/);
  assert.match(alignmentBlock, /\.whatsapp-feature-icon\s*\{[^}]*margin-left:\s*2px\s*!important;/);
  assert.match(alignmentBlock, /\.whatsapp-feature-icon\s*\{[^}]*width:\s*39px\s*!important;[^}]*height:\s*39px\s*!important;/);
  assert.match(alignmentBlock, /\.whatsapp-feature-icon\s*>\s*svg\s*\{[^}]*width:\s*23px\s*!important;[^}]*height:\s*23px\s*!important;/);
  assert.match(alignmentBlock, /\.whatsapp-feature-icon\s*\{[^}]*margin-left:\s*-1\.5px\s*!important;/);
  assert.ok(html.includes('styles.css?v=AFV482&desktoplayout=1&contactintro=4&mobilepolish=9'));
});


test('WhatsApp uses the clean official filled glyph in both contact locations', () => {
  const icons = [...html.matchAll(/<(?:div class="whatsapp-feature-icon"|span class="wa-icon")[\s\S]*?<svg viewBox="0 0 24 24"[\s\S]*?<path d="([^"]+)" fill="#fff"\/><\/svg>/g)];
  assert.equal(icons.length, 2, 'feature tile and WhatsApp button both use the filled white logo');
  assert.equal(icons[0][1], icons[1][1], 'both WhatsApp marks use the same official glyph');
  assert.ok(!html.includes('stroke-width="2.4"'), 'old thin outlined WhatsApp mark is removed');
  assert.match(css, /AFV483 WhatsApp official glyph/);
  assert.match(css, /whatsapp-feature-icon::before[\s\S]*?display:\s*none\s*!important/);
});
