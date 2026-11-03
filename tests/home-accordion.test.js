"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const accordion = fs.readFileSync(path.join(root, "home-accordion.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "home-accordion.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

test("homepage accordion defaults to Services and uses the approved order", () => {
  assert.ok(accordion.indexOf('getElementById("services")') < accordion.indexOf('getElementById("why-choose-arisu")'));
  assert.match(accordion, /setOpen\(items\[0\]\)/);
  assert.match(accordion, /setAttribute\("aria-expanded", String\(open\)\)/);
});

test("services subtitle is moved into the trigger instead of being duplicated in the panel", () => {
  assert.match(accordion, /serviceIntro\.remove\(\)/);
});

test("How section cancels the legacy visual lift and stays in document flow", () => {
  assert.match(styles, /\.how-assistance-section > \.why-arisu-card[\\s\\S]*?translate: none !important/);
});

test("opening a section closes the previous section", () => {
  assert.match(accordion, /setOpen\(isOpen \? null : item\)/);
  assert.match(accordion, /item\.panel\.inert = !open/);
  assert.match(accordion, /items\.forEach\(\(item\) => \{/);
});

test("accordion assets are cache-busted and respect reduced motion", () => {
  assert.match(html, /home-accordion\.css\?v=AFV428/);
  assert.match(html, /home-accordion\.js\?v=AFV428/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
