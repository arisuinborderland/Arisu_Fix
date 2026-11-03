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
  assert.doesNotMatch(accordion, /services\.classList\.add\("home-accordion-item", "is-open"\)/);
  assert.match(accordion, /makeTrigger\(services,[^;]*, 1\)/);
  assert.match(accordion, /initiallyOpen = false/);
  assert.match(accordion, /makePanel\(services, "homeAccordionServicesPanel", serviceButton\)/);
  assert.match(accordion, /setOpen\(null\)/);
  assert.match(accordion, /button\.setAttribute\("aria-expanded", String\(initiallyOpen\)\)/);
  assert.match(accordion, /panel\.inert = !initiallyOpen/);
  assert.match(accordion, /setAttribute\("aria-expanded", String\(open\)\)/);
});

test("services subtitle is moved into the trigger instead of being duplicated in the panel", () => {
  assert.match(accordion, /serviceIntro\.remove\(\)/);
});

test("accordion-wrapped Why and How cards cancel the legacy visual lift", () => {
  assert.match(styles, /html body\.home-page \.home-accordion-item \.why-arisu-card\s*\{[^}]*translate:\s*none !important;/);
  assert.match(styles, /html body\.home-page #desktopSocialDestination > #why-choose-arisu\s*\{\s*margin-bottom:\s*0 !important;/);
});

test("mobile homepage footer no longer uses the legacy negative overlap margin", () => {
  assert.match(footer, /margin-top: -44px !important;/);
  assert.match(footer, /margin-top: 8px !important;/);
});

test("How accordion first card is not clipped by the legacy mobile grid lift", () => {
  assert.match(styles, /html body\.home-page \.how-assistance-section \.why-arisu-card > \.why-arisu-grid\s*\{\s*transform: none !important;/);
});

test("collapsed accordion headers use a visibly smaller compact size and one-line text", () => {
  assert.match(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger\s*\{[^}]*min-height:\s*54px/);
  assert.match(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger \.home-accordion-trigger-title\s*\{[^}]*font-size:\s*17px/);
  assert.match(styles, /\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger \.home-accordion-trigger-subtitle\s*\{[^}]*font-size:\s*11\.5px/);
  assert.match(styles, /white-space:\s*nowrap/);
  assert.match(styles, /text-overflow:\s*ellipsis/);
  assert.match(styles, /@media \(max-width:\s*640px\)\s*\{[\s\S]*?\.home-accordion-item:not\(\.is-open\) > \.home-accordion-trigger\s*\{[^}]*min-height:\s*48px/);
  assert.match(styles, /font-size:\s*16px/);
  assert.match(styles, /font-size:\s*10\.5px/);
});

test("expanded accordion content retains its compact panel spacing", () => {
  assert.match(styles, /\.home-accordion-panel \.service-issue-list li\s*\{[^}]*font-size:\s*11\.5px/);
});

test("opening a section closes the previous section", () => {
  assert.match(accordion, /setOpen\(isOpen \? null : item\)/);
  assert.match(accordion, /item\.panel\.inert = !open/);
  assert.match(accordion, /items\.forEach\(\(item\) => \{/);
});

test("accordion assets are cache-busted and respect reduced motion", () => {
  assert.match(html, /home-accordion\.css\?v=AFV432/);
  assert.match(html, /home-accordion\.js\?v=AFV432/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
