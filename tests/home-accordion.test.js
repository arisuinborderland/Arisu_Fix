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
  assert.match(accordion, /setOpen\(isOpen \? null : item\)/);
  assert.match(accordion, /item\.panel\.inert = !open/);
  assert.match(accordion, /items\.forEach\(\(item\) => \{/);
  assert.match(accordion, /setAttribute\("aria-expanded", String\(open\)\)/);
});

test("collapsed accordion headers use compact dimensions and one-line ellipsis text", () => {
  assert.match(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger\s*\{[^}]*min-height:\s*48px/);
  assert.match(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger \.home-accordion-trigger-title\s*\{[^}]*font-size:\s*15px/);
  assert.match(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger \.home-accordion-trigger-subtitle\s*\{[^}]*font-size:\s*10px/);
  assert.match(styles, /white-space:\s*nowrap/);
  assert.match(styles, /text-overflow:\s*ellipsis/);
  assert.match(styles, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger\s*\{[^}]*min-height:\s*46px/);
  assert.match(styles, /font-size:\s*15px/);
  assert.match(styles, /font-size:\s*10\.5px/);
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

test("accordion assets are cache-busted to AFV434 and respect reduced motion", () => {
  assert.match(html, /home-accordion\.css\?v=AFV434/);
  assert.match(html, /home-accordion\.js\?v=AFV434/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});
