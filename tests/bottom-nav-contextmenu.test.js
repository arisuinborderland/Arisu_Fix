'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const protection = fs.readFileSync(path.join(root, 'image-protection.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('bottom navigation suppresses context menus and drag actions without removing tap navigation', () => {
  assert.match(protection, /closest\("\.mobile-bottom-nav"\)/);
  assert.match(protection, /inProtectedArea\(event\.target\) \|\| inBottomNavigation\(event\.target\)/);
  assert.match(css, /mobile-bottom-nav \{[\s\S]{0,240}-webkit-touch-callout:none/);
  assert.match(css, /mobile-nav-story-avatar img \{[\s\S]{0,240}pointer-events:none/);
  assert.match(html, /id="mobileNavStories"/);
  assert.match(html, /href="reviews\.html" aria-label="Customer Reviews"/);
});


test('bottom Contact navigation uses a dedicated solid WhatsApp brand icon', () => {
  assert.match(html, /class="whatsapp-nav-icon" viewBox="0 0 24 24"/);
  assert.match(html, /aria-label="Contact Arisu"><svg class="whatsapp-nav-icon"[\s\S]*?<span>Contact<\/span><\/a>/);
  assert.match(css, /mobile-nav-item svg\.whatsapp-nav-icon[\s\S]*?fill: currentColor;[\s\S]*?stroke: none;/);
});
