const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('bottom Reviews navigation opens the dedicated reviews page directly', () => {
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /<a class="mobile-nav-item" href="reviews\.html" aria-label="Customer Reviews">/);
  assert.doesNotMatch(html, /<a class="mobile-nav-item" href="#customer-reviews" aria-label="Customer Reviews">/);
  assert.equal(fs.existsSync(path.join(root, 'reviews.html')), true);
});


test('Reviews navigation remains relative on both homepage and Reviews page for Preview deployments', () => {
  const root = path.resolve(__dirname, '..');
  for (const file of ['index.html', 'reviews.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /href="reviews\.html" aria-label="Customer Reviews"/);
    assert.doesNotMatch(html, /href="https:\/\/arisufix\.vercel\.app\/reviews\.html" aria-label="Customer Reviews"/);
  }
});
