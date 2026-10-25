'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('Story Admin upload cap matches server-side 3 MiB validation', () => {
  const admin = read('story-admin.js');
  const api = read('functions/api/stories.js');
  const html = read('story-admin.html');
  assert.match(admin, /file\.size <= 3 \* 1024 \* 1024/);
  assert.match(api, /MAX_IMAGE_BYTES = 3 \* 1024 \* 1024/);
  assert.match(html, /up to 3 MiB each/);
  assert.doesNotMatch(admin, /3\.5 \* 1024 \* 1024/);
});

test('Story Viewer refreshes signed image URLs before opening', () => {
  const viewer = read('story-viewer.js');
  const api = read('functions/api/stories.js');
  assert.match(viewer, /const refreshed = await load\(\);\s*if \(refreshed && stories\.length\) showAt\(0\);/);
  assert.match(viewer, /fetch\('\/api\/stories', \{ cache: 'no-store' \}\)/);
  assert.match(api, /expiresIn: 3600/);
});

test('Cleanup batch is bounded for Pages Functions subrequest usage', () => {
  const cleanup = read('functions/api/cleanup-stories.js');
  assert.match(cleanup, /const batchSize = 20;/);
});

test('Admin and backend read the Supabase URL from one config source', () => {
  const admin = read('story-admin.js');
  const config = read('functions/api/story-config.js');
  assert.doesNotMatch(admin, /const supabaseUrl = 'https:\/\/glivqrmyqwtbmlffghjo\.supabase\.co'/);
  assert.match(admin, /supabaseUrl = String\(config\.supabaseUrl\)/);
  assert.match(config, /JSON\.stringify\(\{ publishableKey, supabaseUrl \}\)/);
  assert.doesNotMatch(config, /JSON\.stringify\([^\n]*secretKey/);
});

test('Package metadata, Node version, and full test suite are aligned', () => {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  assert.equal(pkg.version, lock.version);
  assert.equal(pkg.version, lock.packages[''].version);
  assert.equal(pkg.engines.node, '24.x');
  assert.equal(read('.nvmrc').trim(), '24');
  assert.equal(pkg.scripts.test, 'node --test');
});

