'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('AFV486 removes WhatsApp selectors that no longer match the live markup', () => {
  const contentStart = html.indexOf('<div class="whatsapp-feature-content">');
  const actionStart = html.indexOf('<a class="button primary full whatsapp-button"', contentStart);
  assert.ok(contentStart >= 0 && actionStart > contentStart);
  const content = html.slice(contentStart, actionStart);
  assert.match(content, /class="whatsapp-feature-top"/);
  assert.match(content, /id="whatsappFeatureTitle"/);
  assert.doesNotMatch(content, /<p\b/);
  assert.doesNotMatch(css, /\.whatsapp-feature-content\s+p\b/);
  const recommendation = html.match(/<span class="whatsapp-recommended">([\s\S]*?)<\/span>/);
  assert.ok(recommendation);
  assert.match(recommendation[1], /class="recommended-bolt"/);
  assert.doesNotMatch(recommendation[1], /<span\b/);
  assert.doesNotMatch(css, /\.whatsapp-recommended\s+span\b/);
});

test('AFV486 preserves the active WhatsApp icon, CTA, motion, and Service Status styles', () => {
  assert.match(css, /\.whatsapp-feature-icon::before/);
  assert.match(css, /\.whatsapp-feature-content\s+h2/);
  assert.match(css, /\.whatsapp-recommended\s*\{/);
  assert.match(css, /\.whatsapp-feature-card\s+\.whatsapp-button\s*\{/);
  assert.match(css, /\.whatsapp-feature-card\s+\.whatsapp-button::before/);
  assert.match(css, /\.whatsapp-feature-card\s+\.whatsapp-button::after/);
  assert.match(html, /id="whatsappLink"/);
  assert.match(html, /id="serviceStatus"/);
});

test('AFV492 release metadata is synchronized', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const readme = fs.readFileSync(path.join(root, 'README.txt'), 'utf8');
  const history = fs.readFileSync(path.join(root, 'RELEASE_HISTORY.txt'), 'utf8');
  assert.equal(pkg.version, '512.0.0');
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[''].version, pkg.version);
  assert.ok(readme.includes('Current release: AFV512'));
  assert.ok(history.includes('AFV492 — Restore Approved Mobile Homepage UI Details'));
});
