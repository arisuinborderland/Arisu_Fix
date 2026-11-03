'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV427 About Process Flow keeps a single parent card and the approved five-step order', () => {
  const html = read('about.html');
  const flow = html.slice(html.indexOf('class="about-process-flow"'), html.indexOf('class="site-section terms-section about-terms-section"'));
  assert.ok(flow.length > 0, 'unified process card should precede Terms & limitations');
  assert.equal((flow.match(/class="about-process-step"/g) || []).length, 5);
  const order = ['About Arisu Recovery Service', 'Why I Built This Site', 'My Mission', 'My Values', 'About the Creator'];
  let cursor = -1;
  for (const title of order) {
    const next = flow.indexOf(title);
    assert.ok(next > cursor, `expected "${title}" after the previous step`);
    cursor = next;
  }
  assert.ok(flow.includes('It is not affiliated with or endorsed by Meta, Facebook, or Instagram.'));
  assert.ok(flow.includes('Less searching. More transparency. Better-informed decisions.'));
  assert.ok(flow.includes('Arisu Ryohei'));
  assert.ok(html.includes('about-page.css?v=AFV427'));
  assert.ok(html.includes('id="termsTitle"'), 'terms and limitations stay available');
  const css = read('about-page.css');
  assert.ok(css.includes('.about-process-flow'));
  assert.ok(css.includes('.about-process-step:not(:last-child)::before'));
  assert.ok(css.includes('@media (max-width: 380px)'));
});
