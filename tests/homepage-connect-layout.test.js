'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('Approved Connect layout replaces the old standalone Scam Awareness and social collage blocks', () => {
  const html = read('index.html');
  assert.equal((html.match(/class="homepage-connect-layout"/g) || []).length, 1);
  assert.equal((html.match(/class="scam-awareness-card connect-scam-card"/g) || []).length, 1);
  assert.doesNotMatch(html, /OR VISIT MY OTHER SOCIAL MEDIA ACCOUNTS/);
  assert.doesNotMatch(html, /class="social-collage"/);
  const connect = html.indexOf('class="homepage-connect-layout"');
  const cards = html.indexOf('class="connect-social-grid"', connect);
  const explore = html.indexOf('class="connect-explore-banner"', cards);
  const scam = html.indexOf('class="scam-awareness-card connect-scam-card"', explore);
  const services = html.indexOf('id="services"', scam);
  assert.ok(connect >= 0 && cards > connect && explore > cards && scam > explore && services > scam);
});

test('All four destination cards preserve their real destinations and existing proof/review functionality', () => {
  const html = read('index.html');
  assert.match(html, /href="https:\/\/www\.tiktok\.com\/@arisuryohei2020"/);
  assert.match(html, /href="https:\/\/www\.facebook\.com\/share\/19gap1qLBf\//);
  assert.match(html, /href="proofs\.html"/);
  assert.match(html, /href="reviews\.html"/);
  assert.match(html, /id="reviewsGrid"/);
  assert.match(html, /id="reviewLightbox"/);
  assert.match(html, /data-full-src="reviews\/review-slot-1\.webp\?v=AFV355"/);
});

test('Existing upper homepage sections and lower approved accordion/footer remain in the document', () => {
  const html = read('index.html');
  for (const selector of ['id="daily-bible-verse"', 'class="compact-intro"', 'id="whatsappFeatureTitle"', 'id="serviceStatus"', 'id="services"', 'id="why-choose-arisu"', 'class="reference-footer"', 'class="mobile-bottom-nav"']) {
    assert.ok(html.includes(selector), 'Expected preserved homepage element: ' + selector);
  }
});

test('Desktop layout moves the new Connect + Scam Awareness wrapper as one unit', () => {
  const js = read('desktop-layout.js');
  assert.match(js, /querySelector\("\.homepage-connect-layout"\)/);
  assert.match(js, /destination\.append\(connectSection, services, whyArisu\)/);
  assert.doesNotMatch(js, /querySelector\("\.scam-awareness-card"\)/);
  assert.doesNotMatch(js, /querySelector\("\.contact-divider"\)/);
  assert.doesNotMatch(js, /querySelector\("\.social-collage"\)/);
});

test('Connect stylesheet is included in the production allowlist and cache-busted from Home', () => {
  const build = read('build.js');
  const html = read('index.html');
  assert.match(build, /"homepage-connect\.css"/);
  assert.match(html, /homepage-connect\.css\?v=AFV460/);
  assert.match(html, /desktop-layout\.js\?v=AFV460/);
});

test('Connect layout includes responsive card, banner, and Scam Awareness rules', () => {
  const css = read('homepage-connect.css');
  assert.match(css, /\.connect-social-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*420px\)/);
  assert.match(css, /\.connect-explore-banner/);
  assert.match(css, /\.connect-scam-grid\s*\{[\s\S]*?repeat\(4/);
  assert.match(css, /\.connect-scam-item/);
});

test('Mobile Connect cards retain the approved horizontal image-and-copy layout', () => {
  const html = read('index.html');
  const css = read('homepage-connect.css');
  assert.match(html, /connect-heading-title/);
  assert.ok(html.includes("assets/connect/arisu-connect-mascot.webp?v=AFV460"));
  assert.doesNotMatch(html, /Official social channels and community resources/);
  const mobile = css.split('@media (max-width: 900px)')[1].split('@media (max-width: 420px)')[0];
  assert.match(mobile, /grid-template-columns:\\s*minmax\\(0,\\.86fr\\) minmax\\(0,1\\.14fr\\)/);
  assert.match(mobile, /grid-auto-rows:\\s*174px/);
  assert.match(mobile, /\\.connect-card-copy p\\s*\\{\\s*display:\\s*block/);
  assert.doesNotMatch(mobile, /grid-template-columns:\\s*minmax\\(0,1fr\\);/);
});

test('Relocated Scam Awareness does not inherit the old homepage vertical offset', () => {
  const css = read('homepage-connect.css');
  assert.match(css, /\\.connect-scam-card\\s*\\{[\\s\\S]*?transform:\\s*none !important/);
  assert.match(css, /--arc-reveal-offset:\\s*0px !important/);
  assert.match(css, /\\.connect-scam-watermark/);
  assert.match(css, /\\.connect-scam-subtitle\\s*\\{[\\s\\S]*?margin:\\s*9px 0 17px 68px/);
});
