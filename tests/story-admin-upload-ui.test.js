const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'story-admin.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'story-admin.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'story-admin.js'), 'utf8');

test('Story Admin has a live selected-image summary and compact upload helper', () => {
  assert.match(html, /id="selectionSummary"/);
  assert.match(js, /totalBytes/);
  assert.match(css, /\.selection-summary/);
  assert.match(css, /@media\(max-width:440px\)/);
});

test('Publish action is disabled initially and reflects selected valid image count', () => {
  assert.match(html, /id="publishButton" disabled/);
  assert.match(js, /function updatePublishState\(\)/);
  assert.match(js, /button\.disabled = !valid/);
  assert.match(js, /\$\{label\} · \$\{files\.length\}/);
});

test('Publish action blocks duplicate submissions while processing and preserves matching per-image validation', () => {
  assert.match(js, /button\.dataset\.busy = 'true'/);
  assert.match(js, /if \(button\.disabled \|\| button\.dataset\.busy\) return/);
  assert.match(js, /file\.size <= 3 \* 1024 \* 1024/);
  assert.match(js, /delete button\.dataset\.busy; updatePublishState\(\)/);
});

test('Remember Me is opt-in and session persistence stores only a refresh token, never the password', () => {
  assert.match(html, /id="rememberMe" type="checkbox"(?! checked)/);
  assert.match(js, /localStorage\.setItem\(SESSION_KEY, token\)/);
  assert.match(js, /sessionStorage\.setItem\(TEMP_SESSION_KEY, token\)/);
  assert.match(js, /if \(!token\) return/);
  assert.doesNotMatch(js, /localStorage\.setItem\([^,\n]*(?:password|passwd)/i);
  assert.doesNotMatch(js, /sessionStorage\.setItem\([^,\n]*(?:password|passwd)/i);
});

test('Story Admin restores configuration from the public config endpoint', () => {
  assert.match(js, /fetch\('\/api\/story-config', \{ cache: 'no-store' \}\)/);
  assert.match(js, /supabaseUrl = String\(config\.supabaseUrl\)\.trim\(\)\.replace\(\/\\\/\$\/, ''\)/);
  assert.doesNotMatch(js, /const supabaseUrl = 'https:\/\/glivqrmyqwtbmlffghjo\.supabase\.co'/);
});
