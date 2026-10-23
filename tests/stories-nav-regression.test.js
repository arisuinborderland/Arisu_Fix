'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'story-viewer.js'), 'utf8');

test('Stories navigation stays visible when stories are empty or the API fails', () => {
  assert.doesNotMatch(source, /mobileStoriesButton\.hidden\s*=\s*true/);
  assert.match(source, /must never hide the bottom-navigation button/);
  assert.match(source, /if \(!stories\.length\) await load\(\)/);
});
