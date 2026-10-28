'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const css = read('desktop-header.css');
const pages = ['index.html', 'reviews.html', 'proofs.html', 'privacy.html', 'about.html'];

test('Desktop header spans the viewport with responsive outer gutters', () => {
  assert.match(css, /@media\s*\(min-width:\s*701px\)/);
  assert.match(css, /padding:\s*8px clamp\(20px, 2vw, 36px\) !important/);
  for (const pageClass of ['home-page', 'reviews-document', 'proofs-document', 'privacy-page', 'about-page']) {
    assert.match(css, new RegExp('body\\.' + pageClass + ' header\\.topbar'));
  }
});

test('Desktop header actions share the same size, palette, icon dimensions, and focus treatment', () => {
  assert.match(css, /height:\s*44px !important/);
  assert.match(css, /width:\s*164px !important/);
  assert.match(css, /width:\s*124px !important/);
  assert.match(css, /border-radius:\s*14px !important/);
  assert.match(css, /background:\s*linear-gradient\(135deg, rgba\(255,255,255,\.98\), rgba\(239,243,255,\.96\)\) !important/);
  assert.match(css, /width:\s*18px !important;\s*height:\s*18px !important;\s*flex:\s*0 0 18px !important/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /header SVG icons visible on pale desktop buttons/);
  assert.match(css, /\.header-icon \*[,\s\S]*stroke: #263a61 !important/);
});

test('All public pages load the shared header stylesheet after page-specific stylesheets', () => {
  for (const page of pages) {
    const html = read(page);
    const links = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
    const last = links.at(-1)?.[1];
    assert.equal(last, 'desktop-header.css?v=AFV319', page + ' must load the common header stylesheet last');
  }
});

test('Production build allowlist includes the shared header stylesheet', () => {
  assert.match(read('build.js'), /"desktop-header\.css"/);
});

test('Mobile header styles are not declared in the desktop-only override', () => {
  assert.doesNotMatch(css, /@media\s*\(max-width:/);
});

test('AFV323 desktop homepage proof previews mask cyan rails and keep square source composites intact', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV323 desktop-only preview polish.')[1];
  assert.ok(desktopFix, 'AFV323 desktop preview block must exist');
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /aspect-ratio:\s*1 \/ 1 !important/);
  assert.match(desktopFix, /object-fit:\s*contain !important/);
  assert.match(desktopFix, /recovery-proof-preview-item::after/);
  assert.match(desktopFix, /background-size:\s*4\.2% 67%, 5\.5% 67%, 4\.2% 67%/);
  assert.match(desktopFix, /height:\s*410px !important/);
});


test('Desktop homepage proof previews align at the top with no extra inset', () => {
  const homeStyles = read('styles.css');
  const alignFix = homeStyles.split('AFV323 desktop thumbnail top alignment: remove the extra top inset and align each source at the top.')[1];
  assert.ok(alignFix, 'desktop-only proof thumbnail alignment block must exist');
  assert.match(alignFix, /@media \(min-width: 761px\)/);
  assert.match(alignFix, /align-items:\s*start !important/);
  assert.match(alignFix, /margin-top:\s*0 !important/);
  assert.match(alignFix, /object-position:\s*top center !important/);
});
test('Homepage cache key refreshes desktop proof thumbnail alignment', () => {
  const html = read('index.html');
  assert.match(html, /styles\.css\?v=AFV327&desktoplayout=1/);
});


test('AFV324 desktop proof preview cards stretch to 2px above the action button', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV324 desktop proof thumbnails extend to 2px above the View Recovery Proofs button.')[1];
  assert.ok(desktopFix, 'AFV324 desktop bottom-gap block must exist');
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /flex:\s*1 1 auto !important/);
  assert.match(desktopFix, /grid-template-rows:\s*minmax\(0, 1fr\) !important/);
  assert.match(desktopFix, /margin:\s*0 0 2px !important/);
  assert.match(desktopFix, /aspect-ratio:\s*auto !important/);
  assert.match(desktopFix, /object-fit:\s*cover !important/);
});
test('Homepage cache key refreshes the 2px desktop proof-preview spacing', () => {
  assert.match(read('index.html'), /styles\.css\?v=AFV327&desktoplayout=1/);
});


test('AFV325 desktop homepage previews do not mask source pixels and show complete images', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV325 desktop homepage proof-image integrity.')[1];
  assert.ok(desktopFix, 'AFV325 desktop image-integrity block must exist');
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /aspect-ratio:\s*1 \/ 1 !important/);
  assert.match(desktopFix, /object-fit:\s*contain !important/);
  assert.match(desktopFix, /\.recovery-proof-preview-item::before,[\s\S]*?\.recovery-proof-preview-item::after\s*\{[\s\S]*?content: none !important;[\s\S]*?display: none !important/);
  assert.match(desktopFix, /margin:\s*0 0 2px !important/);
  assert.match(desktopFix, /height:\s*48px !important/);
});
test('Homepage cache key refreshes AFV325 desktop proof-image rules', () => {
  assert.match(read('index.html'), /styles\.css\?v=AFV327&desktoplayout=1/);
});


test('AFV326 desktop homepage uses matched fixed-height cards and constrains the reviews preview', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV326 desktop layout correction: keep Recovery Proofs and Customer Feedback the same fixed height.')[1];
  assert.ok(desktopFix, 'AFV326 desktop layout override must exist');
  assert.match(desktopFix, /@media \(min-width: 1101px\)/);
  assert.match(desktopFix, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(desktopFix, /\.recovery-proofs-showcase,[\s\S]*?\.social-feedback-card\s*\{[\s\S]*?height:\s*446px !important;[\s\S]*?min-height:\s*446px !important;[\s\S]*?max-height:\s*446px !important/);
  assert.match(desktopFix, /recovery-proofs-preview\s*\{[\s\S]*?flex:\s*1 1 auto !important;[\s\S]*?margin:\s*0 0 2px !important/);
  assert.match(desktopFix, /\.social-feedback-card \.reviews-grid-featured[\s\S]*?max-height:\s*100% !important;[\s\S]*?overflow:\s*hidden !important/);
  assert.match(desktopFix, /object-fit:\s*contain !important/);
});
test('Homepage cache key refreshes AFV326 desktop layout correction', () => {
  assert.match(read('index.html'), /styles\.css\?v=AFV327&desktoplayout=1/);
});


test('AFV327 desktop homepage uses the single composite recovery preview while mobile retains original previews', () => {
  const html = read("index.html");
  const homeStyles = read("styles.css");
  assert.match(html, /recovery-proof-preview-composite[^>]*>\s*<img src="60309\.png\?v=AFV327"/);
  assert.match(homeStyles, /Keep the composite hidden by default[\s\S]*?recovery-proof-preview-composite\s*\{\s*display: none !important;/);
  const desktopFix = homeStyles.split("AFV327 desktop-only composite recovery preview.")[1];
  assert.ok(desktopFix, "desktop-only composite preview rules must exist");
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /recovery-proof-preview-item:not\(\.recovery-proof-preview-composite\)[\s\S]*?display: none !important/);
  assert.match(desktopFix, /\.recovery-proof-preview-composite[\s\S]*?display: block !important/);
  assert.match(read("build.js"), /"60309\.png"/);
});


test('Desktop homepage Recovery Proofs button is visually 42px tall without changing preview layout space', () => {
  const homeStyles = read('styles.css');
  const baselineFix = homeStyles.split('Align the homepage Recovery Proofs CTA with Customer Reviews on desktop.')[1];
  assert.ok(baselineFix, 'desktop CTA alignment rule must exist');
  assert.match(baselineFix, /@media \(min-width: 761px\)/);
  assert.match(baselineFix, /\.recovery-proofs-showcase > \.recovery-proofs-button\s*\{[\s\S]*?flex:\s*0 0 48px !important;[\s\S]*?height:\s*48px !important;[\s\S]*?transform:\s*translateY\(7px\) scaleY\(0\.875\) !important;[\s\S]*?transform-origin:\s*top center !important/);
});


test('Desktop homepage composite Recovery Proofs card starts 4px lower without cropping the image content', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV327 desktop-only composite recovery preview.')[1];
  assert.ok(desktopFix, 'desktop composite preview rule must exist');
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /\.recovery-proof-preview-composite\s*\{[\s\S]*?height:\s*calc\(100% - 4px\) !important;[\s\S]*?margin-top:\s*4px !important/);
  assert.doesNotMatch(desktopFix, /clip-path:\s*inset\(/);
  assert.match(desktopFix, /\.recovery-proofs-button\s*\{[\s\S]*?flex:\s*0 0 48px !important/);
});
