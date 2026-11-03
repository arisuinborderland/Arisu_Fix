const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');
const styles = stripComments(read('styles.css'));
const proofsStyles = stripComments(read('proofs.css'));
const aboutLinkStyles = stripComments(read('about-link.css'));
const reveal = read('scroll-reveal.js');

test('Retired site-footer selectors are removed from active stylesheets and reveal targets', () => {
  assert.doesNotMatch(styles, /\.site-footer|\.footer-(?:brand|note|links|copyright|location)/);
  assert.doesNotMatch(proofsStyles, /\.site-footer|\.proofs-footer/);
  assert.doesNotMatch(aboutLinkStyles, /\.site-footer|\.about-link-section|\.about-page-cta|\.about-cta-/);
  assert.doesNotMatch(reveal, /\.site-footer/);
});

test('The four shared pages retain the reference footer component', () => {
  for (const page of ['index.html', 'reviews.html', 'proofs.html', 'about.html']) {
    const html = read(page);
    assert.match(html, /<footer class="reference-footer"/, page);
    assert.match(html, /footer-reference\.css\?v=AFV\d+/, page);
  }
  assert.match(read('footer-reference.css'), /\.reference-footer\s*\{/);
});

test('Privacy Policy keeps its separate generic footer styling', () => {
  assert.match(read('privacy.html'), /<footer>/);
  assert.match(styles, /(?:^|\})\s*footer\s*\{/);
});

test('The homepage no longer ships the retired About CTA inline style block', () => {
  const home = read('index.html');
  assert.doesNotMatch(home, /about-cta-visibility-enhancement|\.about-link-section|\.about-page-cta/);
});

test('Retired How It Works section selectors are absent from the homepage stylesheet', () => {
  assert.doesNotMatch(styles, /\.how-section(?!\))/);
  assert.doesNotMatch(read('index.html'), /class=["'][^"']*\bhow-section\b/);
});
