'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const css = read('site-header.css');
const pages = ['index.html', 'reviews.html', 'proofs.html', 'privacy.html', 'about.html'];

test('Shared desktop header uses one shell, logo, brand typography, and badge contract', () => {
 assert.match(css,/min-height:96px!important/); assert.match(css,/flex:0 0 66px!important/);
 assert.match(css,/gap:12px!important/); assert.match(css,/font:800 16px\/1\.15 Manrope,sans-serif!important/);
 assert.match(css,/flex:0 0 22px!important/); assert.match(css,/padding:8px clamp\(20px,2vw,36px\)!important/);
});
test('All five source pages use the same build-time shared header placeholder', () => {
 for(const page of pages){const html=read(page);assert.equal((html.match(/<!-- SHARED_SITE_HEADER -->/g)||[]).length,1,page+' must contain one marker');assert.doesNotMatch(html,/<header\b/i,page+' must not duplicate header markup');}
 const partial=read('partials/site-header.html');assert.equal((partial.match(/<header\b/g)||[]).length,1);assert.equal((partial.match(/{{HEADER_ACTIONS}}/g)||[]).length,1);
});
test('Homepage-only header actions are isolated in the shared component slot', () => {
 const actions=read('partials/site-header-home-actions.html');assert.match(actions,/proofs-header-link/);assert.match(actions,/webtools-header-link/);assert.doesNotMatch(read('partials/site-header.html'),/proofs-header-link|webtools-header-link/);
});
test('Build injects the shared header into all five static pages before deployment', () => {
 const build=read('build.js');assert.match(build,/function injectSharedSiteHeader\(\)/);assert.match(build,/injectSharedSiteHeader\(\);/);assert.match(build,/shared header was not rendered exactly once/);assert.match(build,/"site-header\.css"/);assert.doesNotMatch(build,/"desktop-header\.css", "homepage-header-theme\.css"/);
});
test('Shared mobile header dimensions and text/badge sizes are identical across pages', () => {
 assert.match(css,/@media\(max-width:700px\)/);assert.match(css,/min-height:58px!important/);assert.match(css,/flex:0 0 44px!important/);assert.match(css,/font-size:16px!important/);assert.match(css,/flex-basis:18px!important/);assert.match(css,/@media\(max-width:380px\)[\s\S]*?flex-basis:42px!important/);assert.match(css,/@media\(max-width:380px\)[\s\S]*?font-size:14px!important/);
});
test('Homepage mobile header stays one row and matches the 58px shared page height', () => {
 const homeMobile = css.slice(css.indexOf('html body.home-page header.topbar.site-header {', css.indexOf('@media(max-width:700px)')));
 assert.match(homeMobile,/display:flex!important/);
 assert.match(homeMobile,/min-height:58px!important;height:58px!important/);
 assert.match(homeMobile,/padding:0 12px!important/);
 assert.match(css,/html body\.home-page header\.topbar\.site-header>\.header-meta \{display:none!important\}/);
 assert.doesNotMatch(homeMobile,/display:grid|grid-template-rows:58px auto|padding:0 12px 6px|row-gap:2px/);
});
test('All public pages load the shared header stylesheet last', () => {
 for(const page of pages){const html=read(page);const links=[...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];assert.equal(links.at(-1)?.[1],'site-header.css?v=AFV465&shared=1',page+' must load shared header stylesheet last');}
});
test('Shared header uses the Arisu Fix wordmark and uppercase service descriptor', () => {
 const partial = read('partials/site-header.html');
 const css = read('site-header.css');
 assert.ok(partial.includes('<b class="brand-title-arisu">Arisu</b><b class="brand-title-fix">Fix</b>'));
 assert.match(partial, /RECOVERY CONTACT &amp; ASSISTANCE/);
 assert.doesNotMatch(partial, /arisu-verified-badge|brand-subtitle-pill|subtitle-sparkle/);
 assert.match(css, /brand-title-fix[\s\S]*?linear-gradient\(110deg,#3678f5 0%,#6550e8 100%\)/);
 assert.match(css, /brand-subtitle[\\s\\S]*?letter-spacing/);
 assert.match(css, /\.logo img \{[^}]*object-fit:contain!important/);
});
test('AFV422 cleanup leaves one authoritative header layout layer', () => {
 assert.match(css,/AFV422 — Approved shared header baseline/);
 assert.match(css,/AFV463 — Use the left-side reference blue uniformly across the full header/);
  assert.match(css,/color: #24365b !important/);
  assert.match(css,/color: #586783 !important/);
  assert.match(css,/background: none !important;\s*box-shadow: none !important;/);
 assert.match(css,/AFV420 — One authoritative header contract/);
 assert.doesNotMatch(css,/AFV412 shared desktop header normalization|AFV412 — One shared header shell|privacy-about-link|about-header-link/);
 const build=read('build.js');
 assert.doesNotMatch(build,/desktop-header\.css|homepage-header-theme\.css/);
 for(const page of pages){const html=read(page);assert.doesNotMatch(html,/desktop-header\.css|homepage-header-theme\.css/);}
});
test('Production build allowlist includes the shared header stylesheet', () => {assert.match(read('build.js'),/"site-header\.css"/);});

test('AFV323 desktop homepage proof previews mask cyan rails and keep square source composites intact', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV323 desktop-only preview polish.')[1];
  assert.ok(desktopFix, 'AFV323 desktop preview block must exist');
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /aspect-ratio:\s*1 \/ 1 !important/);
  assert.match(desktopFix, /object-fit:\s*contain !important/);
  assert.match(desktopFix, /recovery-proof-preview-item::after/);
  assert.match(desktopFix, /background-size:\s*4\.2% 67%, 5\.5% 67%, 4\.2% 67%/);
  const afv323Block = desktopFix.split('AFV323 desktop thumbnail top alignment:')[0];
  assert.doesNotMatch(afv323Block, /(?:height|min-height|max-height):\s*410px !important/);
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
  assert.match(html, /styles\.css\?v=AFV424&desktoplayout=1/);
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
  assert.match(read('index.html'), /styles\.css\?v=AFV424&desktoplayout=1/);
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
  assert.match(read('index.html'), /styles\.css\?v=AFV424&desktoplayout=1/);
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
  assert.match(read('index.html'), /styles\.css\?v=AFV424&desktoplayout=1/);
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


test('Desktop homepage composite Recovery Proofs card starts 4px lower and extends 2px farther at the bottom', () => {
  const homeStyles = read('styles.css');
  const desktopFix = homeStyles.split('AFV327 desktop-only composite recovery preview.')[1];
  assert.ok(desktopFix, 'desktop composite preview rule must exist');
  assert.match(desktopFix, /@media \(min-width: 761px\)/);
  assert.match(desktopFix, /\.recovery-proof-preview-composite\s*\{[\s\S]*?height:\s*calc\(100% - 2px\) !important;[\s\S]*?margin-top:\s*4px !important/);
  assert.doesNotMatch(desktopFix, /clip-path:\s*inset\(/);
  assert.match(desktopFix, /\.recovery-proofs-button\s*\{[\s\S]*?flex:\s*0 0 48px !important/);
});


test('Desktop Customer Reviews CTA is visually shortened at top and bottom without changing its layout slot', () => {
  const homeStyles = read('styles.css');
  const buttonFix = homeStyles.split('Visually shorten only the Customer Reviews CTA by 2px at top and bottom.')[1];
  assert.ok(buttonFix, 'desktop Customer Reviews CTA sizing rule must exist');
  assert.match(buttonFix, /@media \(min-width: 761px\)/);
  assert.match(buttonFix, /\.social-feedback-view-all\s*\{[\s\S]*?transform:\s*scaleY\(0\.84\) !important;[\s\S]*?transform-origin:\s*center center !important/);
  assert.match(buttonFix, /\.social-feedback-view-all:hover,[\s\S]*?transform:\s*translateY\(-2px\) scaleY\(0\.84\) !important/);
});


test('AFV418 Privacy mobile content uses a compact icon/text layout and tighter section rhythm', () => {
  const privacy = read('privacy.css');
  assert.match(privacy, /AFV418 — Compact Privacy Policy rhythm/);
  assert.match(privacy, /grid-template-columns: 44px minmax\(0, 1fr\) !important/);
  assert.match(privacy, /column-gap: 10px !important/);
  assert.match(privacy, /padding: 18px 0 !important/);
  assert.match(privacy, /margin-top: 18px !important/);
});

test('AFV431 About mobile heading spacing uses the compact Process Flow layout', () => {
  const about = read('about-page.css');
  assert.match(about, /AFV431 — approved compact mobile heading rhythm/);
  assert.match(about, /padding-top: 8px/);
  assert.match(about, /margin-bottom: 2px/);
});

test('AFV423 desktop homepage verified check is not pinned to its hidden SVG dash offset', () => {
  const homeStyles = read('styles.css');
  const desktopBadgeBlock = homeStyles.split('AFV423 — Restore the desktop homepage verified check animation.')[1];
  assert.ok(desktopBadgeBlock, 'AFV423 desktop badge animation block must exist');
  const desktopRule = desktopBadgeBlock.split('/* Restore the WhatsApp CTA')[0];
  assert.match(desktopRule, /@media \(min-width: 701px\) and \(prefers-reduced-motion: no-preference\)/);
  assert.match(desktopRule, /arisu-brand-check-draw 2s ease-in-out infinite !important/);
  assert.doesNotMatch(desktopRule, /stroke-dashoffset:\s*24\s*!important/);
  assert.match(homeStyles, /\.arisu-verified-badge svg path\{stroke-dasharray:24;stroke-dashoffset:24;animation:arisu-brand-check-draw 2s ease-in-out infinite\}/);
});


test('AFV425 removes superseded Reviews and Proofs mobile header layers', () => {
 const reviews = read('reviews.css');
 const proofs = read('proofs.css');
 assert.doesNotMatch(reviews, /Final mobile header alignment: keep both actions side-by-side beside the brand/);
 assert.doesNotMatch(reviews, /Match the homepage profile header sizing and alignment on Customer Reviews/);
 assert.doesNotMatch(proofs, /refined compact profile header; preserve the existing header links and gradient/);
 assert.doesNotMatch(proofs, /Match the homepage profile header sizing and alignment on Recovery Proofs/);
 assert.doesNotMatch(proofs, /AFV273 — final scoped reset/);
 assert.doesNotMatch(proofs, /AFV276 — match homepage header action sizing exactly/);
 assert.match(proofs, /AFV279 — final canonical header sizing/);
 assert.match(proofs, /Preserve the Reviews\/Proofs brand-row and verified-badge alignment/);
 assert.match(reviews, /match homepage mobile header geometry exactly/);
});
