'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('AFV485 keeps one authoritative scenic Daily Bible Verse background rule', () => {
  assert.match(css, /one authoritative Daily Bible Verse layout\/background rule/);
  assert.match(css, /html body\.home-page main > #daily-bible-verse\.daily-verse-card\s*\{[\s\S]*?background-image:[\s\S]*?verse-lake-photo\.webp\?v=AFV358/);
  assert.doesNotMatch(css, /html body #daily-bible-verse\.daily-verse-card\s*\{/);
  assert.doesNotMatch(css, /authoritative scenic Bible Verse background/);
  assert.match(html, /styles\.css\?v=AFV485&desktoplayout=1&contactintro=5&dailyversecleanup=1/);
});

test('AFV485 removes superseded system-theme overrides and duplicate verse pseudo-element styling', () => {
  assert.doesNotMatch(css, /Adaptive Daily Bible Verse card: match the user's system\/browser theme/);
  assert.doesNotMatch(css, /\.daily-verse-card:before\s*\{/);
  const pseudoRules = [...css.matchAll(/\.daily-verse-card::before\s*\{([^}]*)\}/g)];
  assert.equal(pseudoRules.length, 1, 'only the authoritative disabled pseudo-element rule remains');
  assert.match(pseudoRules[0][1], /content:\s*none\s*!important/);
});

test('AFV485 preserves approved desktop and mobile verse card geometry and crop', () => {
  assert.match(css, /@media\s*\(min-width:\s*900px\)[\s\S]*?html body\.home-page main > #daily-bible-verse\.daily-verse-card\s*\{[\s\S]*?padding-top:\s*42px\s*!important;[\s\S]*?padding-bottom:\s*40px\s*!important/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)[\s\S]*?html body\.home-page main > #daily-bible-verse\.daily-verse-card\s*\{[\s\S]*?background-size:\s*auto 112%\s*!important;[\s\S]*?background-position:\s*100% 52%\s*!important/);
  assert.match(css, /html body\.home-page main > #daily-bible-verse\.daily-verse-card\s*\{\s*padding-top:\s*5px\s*!important;\s*padding-bottom:\s*5px\s*!important;/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)\s*\{\s*html body\.home-page main > #daily-bible-verse\.daily-verse-card\s*\{\s*padding-top:\s*6px\s*!important;\s*padding-bottom:\s*6px\s*!important;/);
});

test('AFV485 release metadata is synchronized', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const readme = fs.readFileSync(path.join(root, 'README.txt'), 'utf8');
  const history = fs.readFileSync(path.join(root, 'RELEASE_HISTORY.txt'), 'utf8');
  assert.equal(pkg.version, '485.0.0');
  assert.equal(lock.version, '485.0.0');
  assert.equal(lock.packages[''].version, '485.0.0');
  assert.ok(readme.includes('Current release: AFV485'));
  assert.ok(history.includes('AFV485 — Daily Bible Verse CSS Dead-Rule Cleanup'));
});
