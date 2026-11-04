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

test("collapsed and expanded accordion headers share identical geometry and typography", () => {
  assert.match(styles, /\.home-accordion-trigger\s*\{[^}]*min-height:\s*78px/);
  assert.match(styles, /\.home-accordion-trigger\s*\{[^}]*padding:\s*16px 20px/);
  assert.match(styles, /\.home-accordion-trigger-title\s*\{[^}]*font-size:\s*clamp\(20px, 3vw, 27px\)/);
  assert.match(styles, /\.home-accordion-trigger-subtitle\s*\{[^}]*font-size:\s*clamp\(13px, 1\.8vw, 16px\)/);
  assert.match(styles, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.home-accordion-trigger\s*\{[^}]*min-height:\s*68px[^}]*padding:\s*13px 15px/);
  assert.match(styles, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.home-accordion-trigger\s*\{[^}]*height:\s*64px[^}]*min-height:\s*64px[^}]*max-height:\s*64px[^}]*padding:\s*5px 13px/);
  assert.match(styles, /html body\.home-page #desktopSocialDestination > \.home-accordion-item\s*\{\s*margin:\s*4px 0 !important;/);
  assert.match(styles, /\.home-accordion-trigger-title\s*\{[^}]*font-size:\s*18px[^}]*white-space:\s*nowrap/);
  assert.match(styles, /\.home-accordion-trigger-subtitle\s*\{[^}]*font-size:\s*12px[^}]*-webkit-line-clamp:\s*2/);
  assert.doesNotMatch(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger/);
  assert.doesNotMatch(styles, /\.home-accordion-item:not\(\.is-open\).*home-accordion-trigger-(?:title|subtitle|copy|chevron)/);
});

test("mobile accordion reserves two subtitle lines so all trigger text blocks share the same vertical rhythm", () => {
  assert.match(styles, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.home-accordion-trigger-subtitle\s*\{[^}]*min-height:\s*2\.36em/);
});

test("mobile accordion spacing overrides the legacy high-specificity section margins", () => {
  assert.match(styles, /html body\.home-page #desktopSocialDestination > \.home-accordion-item\s*\{\s*margin:\s*4px 0 !important;/);
  assert.match(styles, /Root cause: styles\.css applies body\.home-page \.site-section/);
});

test("expanded accordion content retains compact panel spacing without clipping the How card", () => {
  assert.match(styles, /\.home-accordion-panel \.service-issue-list li\s*\{[^}]*font-size:\s*11\.5px/);
  assert.match(styles, /\.home-accordion-panel-inner\s*\{[^}]*overflow:\s*hidden/);
  assert.match(styles, /html body\.home-page \.how-assistance-section \.why-arisu-card > \.why-arisu-grid\s*\{\s*transform:\s*none !important;/);
});

test("accordion-wrapped Why and How cards cancel the legacy visual lift", () => {
  assert.match(styles, /html body\.home-page \.home-accordion-item \.why-arisu-card\s*\{[^}]*translate:\s*none !important;/);
  assert.match(styles, /html body\.home-page #desktopSocialDestination > #why-choose-arisu\s*\{\s*margin-bottom:\s*0 !important;/);
});

test("mobile homepage footer replaces the legacy overlap margin with the approved spacing", () => {
  assert.match(footer, /margin-top:\s*-44px !important;[\s\S]*AFV428[\s\S]*margin-top:\s*8px !important;/);
});

test("accordion assets are cache-busted to AFV444 and respect reduced motion", () => {
  assert.match(html, /home-accordion\.css\?v=AFV444/);
  assert.match(html, /home-accordion\.js\?v=AFV444/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});


test("mobile homepage removes the legacy trailing main padding below the accordion", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
  assert.match(source, /@media\s*\(max-width:\s*600px\)[\s\S]*?html body\.home-page main \{ padding-bottom: 0 !important; \}/);
});


test("AFV444 centers one-line subtitle text within the shared two-line slot without changing header geometry", () => {
  const js = fs.readFileSync(path.join(__dirname, "..", "home-accordion.js"), "utf8");
  const css = fs.readFileSync(path.join(__dirname, "..", "home-accordion.css"), "utf8");
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(js, /home-accordion-trigger-subtitle-text/);
  assert.match(css, /\.home-accordion-trigger-subtitle\s*\{[^}]*min-height:\s*2\.36em/);
  assert.match(css, /\.home-accordion-trigger-subtitle\s*\{[^}]*display:\s*grid[^}]*align-content:\s*center/);
  assert.match(css, /\.home-accordion-trigger-subtitle-text\s*\{[^}]*-webkit-line-clamp:\s*2/);
  assert.match(css, /#desktopSocialDestination > \.social-collage\s*\{\s*margin-bottom:\s*-26px !important;/);
  assert.match(html, /home-accordion\.css\?v=AFV444/);
  assert.match(html, /home-accordion\.js\?v=AFV444/);
});
