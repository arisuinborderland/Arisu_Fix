"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const accordion = fs.readFileSync(path.join(root, "home-accordion.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "home-accordion.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const footer = fs.readFileSync(path.join(root, "footer-reference.css"), "utf8");

const count = (source, pattern) => (source.match(pattern) || []).length;

test("homepage accordion defaults to all sections closed and uses the approved order", () => {
  assert.ok(accordion.indexOf('getElementById("services")') < accordion.indexOf('getElementById("why-choose-arisu")'));
  assert.match(accordion, /services\.classList\.add\("home-accordion-item"\)/);
  assert.doesNotMatch(accordion, /services\.classList\.add\("home-accordion-item",\s*"is-open"\)/);
  assert.match(accordion, /makeTrigger\(services,[^;]*, 1\)/);
  assert.match(accordion, /initiallyOpen = false/);
  assert.match(accordion, /makePanel\(services, "homeAccordionServicesPanel", serviceButton\)/);
  assert.match(accordion, /setOpen\(null\)/);
  assert.match(accordion, /button\.setAttribute\("aria-expanded", String\(initiallyOpen\)\)/);
  assert.match(accordion, /panel\.inert = !initiallyOpen/);
});

test("generated accordion headings preserve source IDs used by aria-labelledby and scroll targets", () => {
  assert.match(accordion, /if \(title\.id\) heading\.id = title\.id/);
  assert.match(accordion, /button\.setAttribute\("aria-controls", panelId\)/);
  assert.match(accordion, /panel\.setAttribute\("aria-labelledby", button\.id\)/);
});

test("all required source elements are validated before the accordion mutates the DOM", () => {
  const validation = accordion.indexOf("!processTitle || !processIntro || !processGrid || !processNote || !safety");
  const mutation = accordion.indexOf('services.dataset.accordionReady = "true"');
  assert.notEqual(validation, -1);
  assert.ok(mutation > validation);
  assert.ok(accordion.indexOf("services.classList.add") > mutation);
  assert.ok(accordion.indexOf("why.classList.add") > mutation);
});

test("services subtitle is moved into the trigger instead of being duplicated in the panel", () => {
  assert.match(accordion, /serviceIntro\.remove\(\)/);
});

test("opening a section closes the previous section and updates accessibility state", () => {
  assert.match(accordion, /const isOpen = item\.button\.getAttribute\("aria-expanded"\) === "true"/);
  assert.match(accordion, /const nextItem = isOpen \? null : item/);
  assert.match(accordion, /setOpen\(nextItem\)/);
  assert.match(accordion, /item\.panel\.inert = !open/);
  assert.match(accordion, /items\.forEach\(\(item\) => \{/);
  assert.match(accordion, /setAttribute\("aria-expanded", String\(open\)\)/);
});

test("opening an accordion smoothly scrolls the new panel into view and closing does not scroll", () => {
  assert.match(accordion, /if \(nextItem\) \{/);
  assert.match(accordion, /window\.setTimeout\(\(\) => \{/);
  assert.match(accordion, /nextItem\.panel\.scrollIntoView\(\{/);
  assert.match(accordion, /behavior: reduceMotion \? "auto" : "smooth"/);
  assert.match(accordion, /block: "nearest"/);
  assert.match(accordion, /\}, 360\)/);
});

test("desktop accordion geometry and typography retain the approved baseline", () => {
  assert.match(styles, /\.home-accordion-trigger\s*\{[^}]*min-height:\s*78px/);
  assert.match(styles, /\.home-accordion-trigger\s*\{[^}]*padding:\s*16px 20px/);
  assert.match(styles, /\.home-accordion-trigger-title\s*\{[^}]*font-size:\s*clamp\(20px, 3vw, 27px\)/);
  assert.match(styles, /\.home-accordion-trigger-subtitle\s*\{[^}]*font-size:\s*clamp\(13px, 1\.8vw, 16px\)/);
  assert.doesNotMatch(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger/);
  assert.doesNotMatch(styles, /\.home-accordion-item:not\(\.is-open\).*home-accordion-trigger-(?:title|subtitle|copy|chevron)/);
});

test("mobile accordion keeps natural height, 5px vertical inset, and a 2px title/subtitle gap", () => {
  assert.match(styles, /height:\s*auto/);
  assert.match(styles, /min-height:\s*0/);
  assert.match(styles, /max-height:\s*none/);
  assert.match(styles, /padding:\s*5px 13px/);
  assert.match(styles, /\.home-accordion-trigger-copy\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*justify-content:\s*center[^}]*gap:\s*2px/);
  assert.match(styles, /\.home-accordion-trigger-subtitle\s*\{[^}]*display:\s*block[^}]*height:\s*auto[^}]*min-height:\s*0[^}]*margin:\s*0[^}]*padding:\s*0/);
  assert.match(styles, /\.home-accordion-trigger-title\s*\{[^}]*font-size:\s*18px[^}]*line-height:\s*1\.12[^}]*white-space:\s*nowrap/);
  assert.match(styles, /\.home-accordion-trigger-subtitle\s*\{[^}]*font-size:\s*12px[^}]*line-height:\s*1\.18/);
  assert.match(styles, /\.home-accordion-trigger-subtitle-text\s*\{[^}]*-webkit-line-clamp:\s*2/);
  assert.doesNotMatch(styles, /height:\s*(?:64|68)px|min-height:\s*(?:64|68)px|max-height:\s*(?:64|68)px/);
});

test("mobile accordion CSS has one authoritative rule per repeated layout selector", () => {
  assert.equal(count(styles, /^\.home-accordion-trigger-copy\s*\{/gm), 1);
  assert.equal(count(styles, /^  \.home-accordion-trigger-copy\s*\{/gm), 1);
  assert.equal(count(styles, /^\.home-accordion-trigger-subtitle-text\s*\{/gm), 0);
  assert.equal(count(styles, /^  \.home-accordion-trigger-subtitle-text\s*\{/gm), 1);
  assert.equal(count(styles, /^\.home-accordion-panel-inner\s*\{/gm), 1);
  assert.equal(count(styles, /^  \.home-accordion-panel-inner\s*\{/gm), 1);
  assert.equal(count(styles, /^  \.home-accordion-item\.is-open > \.home-accordion-panel \.home-accordion-panel-inner\s*\{/gm), 1);
});

test("accordion stylesheet contains no redundant wrapper no-op overrides", () => {
  assert.doesNotMatch(styles, /\.home-accordion-item \.services-heading\s*\{\s*margin-top:\s*0/);
  assert.doesNotMatch(styles, /\.home-accordion-item \.why-arisu-card\s*\{\s*margin-top:\s*0/);
  assert.doesNotMatch(styles, /\.how-assistance-section \.why-arisu-card\s*\{\s*width:\s*100%/);
});

test("mobile accordion preserves the approved 4px inter-card spacing", () => {
  assert.match(styles, /html body\.home-page #desktopSocialDestination > \.home-accordion-item\s*\{\s*margin:\s*4px 0 !important;/);
  assert.doesNotMatch(styles, /margin-block:\s*6px|margin-block:\s*4px !important/);
});

test("expanded accordion content retains compact panel spacing without clipping the How card", () => {
  assert.match(styles, /\.home-accordion-panel \.service-issue-list li\s*\{[^}]*font-size:\s*11\.5px/);
  assert.match(styles, /\.home-accordion-panel-inner\s*\{[^}]*overflow:\s*hidden/);
  assert.match(styles, /html body\.home-page \.how-assistance-section \.why-arisu-card > \.why-arisu-grid\s*\{\s*transform:\s*none !important;/);
});

test("accordion-wrapped Why and How cards cancel the legacy visual lift", () => {
  assert.match(styles, /html body\.home-page \.home-accordion-item \.why-arisu-card\s*\{[^}]*translate:\s*none !important;/);
  assert.match(styles, /html body\.home-page #desktopSocialDestination > #why-choose-arisu\s*\{\s*margin-bottom:\s*0 !important;/);
  const legacyStyles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.doesNotMatch(legacyStyles, /#desktopSocialDestination\s*>\s*#why-choose-arisu\s*\{[^}]*margin-top:\s*8px\s*!important;/);
});

test("mobile homepage footer retains its approved spacing and remains outside accordion cleanup", () => {
  assert.match(footer, /margin-top:\s*-44px !important;[\s\S]*AFV428[\s\S]*margin-top:\s*8px !important;/);
});

test("accordion assets are cache-busted to AFV452 and respect reduced motion", () => {
  assert.match(html, /home-accordion\.css\?v=AFV452/);
  assert.match(html, /home-accordion\.js\?v=AFV452/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test("mobile homepage removes the legacy trailing main padding below the accordion", () => {
  const source = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(source, /@media\s*\(max-width:\s*600px\)[\s\S]*?html body\.home-page main \{ padding-bottom: 0 !important; \}/);
});
