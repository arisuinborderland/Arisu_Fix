'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('AFV492 restores the approved Daily Bible Verse mobile offset without changing desktop rules', () => {
  assert.match(css, /@media\s*\(max-width:\s*600px\)[\s\S]*?html body\.home-page main > #daily-bible-verse\.daily-verse-card\s*\{[^}]*margin-top:\s*2px !important/);
  assert.match(html, /styles\.css\?v=AFV517&desktoplayout=1/);
});

test('AFV492 restores the compact mobile Let’s Connect icon dimensions', () => {
  assert.match(css, /contact-intro-icon\{flex-basis:41px;width:41px;height:41px\}/);
  assert.match(css, /contact-intro-icon svg\{width:24px;height:24px\}/);
  assert.match(css, /@media \(max-width:360px\)[\s\S]*?contact-intro-icon\{flex-basis:39px;width:39px;height:39px\}/);
});

test('AFV492 restores the official filled WhatsApp glyph in both homepage locations', () => {
  const icons = [...html.matchAll(/<(?:div class="whatsapp-feature-icon"|span class="wa-icon")[\s\S]*?<svg viewBox="0 0 24 24"[\s\S]*?<path d="([^"]+)" fill="#fff"\/><\/svg>/g)];
  assert.equal(icons.length, 2);
  assert.equal(icons[0][1], icons[1][1]);
  assert.ok(!html.includes('stroke-width="2.4"'));
  assert.match(css, /width:\s*41px !important;[\s\S]*?height:\s*41px !important;/);
  assert.match(css, /whatsapp-feature-icon > svg\s*\{[^}]*width:\s*24px !important;[^}]*height:\s*24px !important;/);
  assert.match(css, /whatsapp-feature-icon > svg \{width:23px !important;height:23px !important\}/);
});

test('AFV492 keeps the desktop contact icon dimensions and loading-screen assets intact', () => {
  assert.match(css, /@media \(min-width: 900px\)[\s\S]*?contact-intro-icon \{\s*flex: 0 0 54px !important/);
  assert.match(html, /loading-screen\.css\?v=AFV514&sessionguard=1&firstpaint=11&pullrefresh=1&statusrows=visible1&readability=1&completionbadge=1&doneplain=3&waiting=1&successgate=1&a11y=1&exitfallback=1/);
  assert.match(html, /loading-screen\.js\?v=AFV514/);
  assert.match(html, /loading-first-paint-guard\.js\?v=AFV514/);
});



test('AFV502 presents Service Status schedule and Philippine time as two mobile cards', () => {
  assert.match(html, /styles\.css\?v=AFV517&desktoplayout=1[^"']*&servicestatus=2col/);
  assert.match(css, /@media \(max-width: 600px\)[\s\S]*?html body\.home-page #contact #serviceStatus \.service-status-details \{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(css, /#contact #serviceStatus \.service-status-detail \{[\s\S]*?flex-direction: row !important/);
  assert.match(css, /#contact #serviceStatus \.service-status-detail \+ \.service-status-detail \{[\s\S]*?border-top: 0 !important/);
  assert.match(html, /id="serviceStatusClock"/);
  assert.match(html, /id="serviceStatusPillText"/);
});
