const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('Homepage mobile footer padding is declared once in the adjacent 700px media-query block', () => {
  const matches = css.match(/@media\s*\(max-width:\s*700px\)\s*\{[\s\S]*?html body\.home-page \.site-footer\s*\{\s*padding-bottom:\s*6px\s*!important;\s*\}/g) || [];
  assert.equal(matches.length, 1);
  assert.equal((css.match(/html body\.home-page \.site-footer\s*\{\s*padding-bottom:\s*6px\s*!important;\s*\}/g) || []).length, 1);
});

test('Homepage mobile footer cleanup retains safe-area bottom navigation clearance', () => {
  assert.match(css, /@media \(max-width: 700px\) \{\s*html body\.home-page \.site-footer \{\s*padding-bottom: 6px !important;\s*\}\s*html body\.home-page \{\s*padding-bottom: calc\(88px \+ env\(safe-area-inset-bottom\)\) !important;/);
});

test('Desktop footer cleanup does not reintroduce identical repeated layout rules', () => {
  const repeatedRules = [
    /html body\.home-page \.site-footer > \.about-link-section\s*\{\s*box-sizing: border-box !important;\s*width: min\(100%, 824px\) !important;\s*max-width: 824px !important;\s*margin: 0 auto !important;\s*padding: 0 !important;\s*align-self: center !important;\s*\}/g,
    /html body\.home-page \.site-footer > \.about-link-section \.about-page-cta\s*\{\s*box-sizing: border-box !important;\s*display: flex !important;\s*width: 100% !important;\s*max-width: 100% !important;\s*margin: 0 auto !important;\s*\}/g,
    /html body\.home-page \.site-footer > \.footer-location \.footer-location-item svg\s*\{\s*display: block !important;\s*width: 16px !important;\s*height: 16px !important;\s*flex: 0 0 16px !important;\s*fill: none !important;\s*stroke: currentColor !important;\s*stroke-width: 1\.7 !important;\s*stroke-linecap: round !important;\s*stroke-linejoin: round !important;\s*\}/g,
    /html body\.home-page \.site-footer > \.footer-links > a svg\s*\{\s*display: block !important;\s*width: 14px !important;\s*height: 14px !important;\s*flex: 0 0 14px !important;\s*fill: none !important;\s*stroke: currentColor !important;\s*stroke-width: 1\.8 !important;\s*stroke-linecap: round !important;\s*stroke-linejoin: round !important;\s*\}/g,
    /html body\.home-page \.site-footer > \.footer-links > a span\s*\{\s*min-width: 0 !important;\s*\}/g
  ];
  for (const rule of repeatedRules) assert.equal((css.match(rule) || []).length, 1);
});


test('Compact header logo sizing is declared once after removing the redundant 420px copy', () => {
  assert.equal((css.match(/\.topbar \.logo\{width:39px;height:39px\}/g) || []).length, 1);
});
