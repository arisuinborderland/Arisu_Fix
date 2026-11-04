'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('AFV432 About Process Flow keeps a single parent card and the approved six-step order', () => {
  const html = read('about.html');
  const flow = html.slice(html.indexOf('class="about-process-flow"'), html.indexOf('</main>'));
  assert.ok(flow.length > 0, 'unified process card should precede Terms & limitations');
  assert.equal((flow.match(/class="about-process-step"/g) || []).length, 6);
  const order = ['About Arisu Recovery Service', 'Why I Built This Site', 'My Mission', 'My Values', 'About the Creator', 'Terms &amp; limitations'];
  let cursor = -1;
  for (const title of order) {
    const next = flow.indexOf(title);
    assert.ok(next > cursor, `expected "${title}" after the previous step`);
    cursor = next;
  }
  assert.ok(flow.includes('It is not affiliated with or endorsed by Meta, Facebook, or Instagram.'));
  assert.ok(!flow.includes('arisu-verified-badge'), 'About service heading has no blue badge markup');
  assert.ok(flow.includes('Less searching. More transparency. Better-informed decisions.'));
  assert.ok(flow.includes('Arisu Ryohei'));
  assert.ok(html.includes('about-page.css?v=AFV432'));
  assert.ok(html.includes('id="termsTitle"'), 'terms and limitations stay available as step 06');
  assert.ok(flow.includes('aria-hidden="true">06</span>'), 'Terms & limitations is numbered 06');
  assert.ok(!flow.includes('terms-security'), 'nested Legitimate Account Recovery Only notice is removed for a compact Terms step');
  assert.ok(!html.includes('Established September 08, 2018'), 'the established-date line is removed from the About page');
  const css = read('about-page.css');
  assert.ok(css.includes('.about-process-flow'));
  assert.ok(css.includes('.about-process-step:not(:last-child)::before'));
  assert.ok(css.includes('@media (max-width: 380px)'));
  assert.ok(!css.includes('AFV428 —') && !css.includes('AFV429 —'), 'superseded responsive override blocks are consolidated');
  assert.equal((css.match(/@media \(max-width: 700px\)/g) || []).length, 2, 'only Process Flow and page-heading mobile blocks remain');
  assert.ok(css.includes('AFV432 — consolidated responsive Process Flow rules'));
});
