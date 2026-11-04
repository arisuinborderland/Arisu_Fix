"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const accordion = read("home-accordion.js");
const styles = read("home-accordion.css");
const html = read("index.html");
const footer = read("footer-reference.css");
const build = read("build.js");

test("homepage accordion sections are created in Services, Why, How order and start closed", () => {
  assert.ok(accordion.indexOf('getElementById("services")') < accordion.indexOf('getElementById("why-choose-arisu")'));
  assert.ok(accordion.includes("setOpen(null)"));
  assert.ok(accordion.includes("initiallyOpen = false"));
  assert.ok(accordion.includes('button.setAttribute("aria-expanded", String(initiallyOpen))'));
});

test("all source elements are validated before the homepage DOM is mutated", () => {
  const validation = accordion.indexOf("!processTitle || !processIntro || !processGrid || !processNote");
  const mutation = accordion.indexOf('services.dataset.accordionReady = "true"');
  assert.ok(validation >= 0 && mutation > validation);
});

test("generated accordion headings preserve IDs and native h2 semantics", () => {
  assert.ok(accordion.includes('createElement("h2", "home-accordion-semantic-heading")'));
  assert.ok(accordion.includes("semanticHeading.id = title.id"));
  assert.ok(accordion.includes('button.setAttribute("aria-labelledby", semanticHeading.id)'));
  assert.ok(accordion.includes('copy.setAttribute("aria-hidden", "true")'));
  assert.ok(styles.includes(".home-accordion-semantic-heading"));
  assert.ok(styles.includes("clip: rect(0, 0, 0, 0)"));
});

test("accordion panels expose labelled regions and inert collapsed content", () => {
  assert.ok(accordion.includes('panel.setAttribute("role", "region")'));
  assert.ok(accordion.includes('panel.setAttribute("aria-labelledby", button.id)'));
  assert.ok(accordion.includes("panel.inert = !initiallyOpen"));
  assert.ok(accordion.includes("item.panel.inert = !open"));
});

test("opening one section closes the previous section and tapping it again closes it", () => {
  assert.ok(accordion.includes('const isOpen = item.button.getAttribute("aria-expanded") === "true"'));
  assert.ok(accordion.includes("const nextItem = isOpen ? null : item"));
  assert.ok(accordion.includes("setOpen(nextItem)"));
});

test("opening an accordion panel scrolls into view and respects reduced motion", () => {
  assert.ok(accordion.includes('window.matchMedia("(prefers-reduced-motion: reduce)")'));
  assert.ok(accordion.includes("nextItem.panel.scrollIntoView({"));
  assert.ok(accordion.includes('behavior: reduceMotion ? "auto" : "smooth"'));
  assert.ok(accordion.includes('block: "nearest"'));
});

test("mobile accordion preserves natural heading wrapping and approved compact controls", () => {
  assert.ok(styles.includes("padding: 10px 13px"));
  assert.ok(styles.includes("font-size: 18px"));
  assert.ok(styles.includes("font-size: 12px"));
  assert.ok(styles.includes("min-width: 86px"));
  assert.ok(styles.includes("margin: 4px 0 !important"));
});

test("expanded accordion panel retains compact content spacing and How card safeguards", () => {
  assert.ok(styles.includes("font-size: 11.5px"));
  assert.ok(styles.includes("html body.home-page .how-assistance-section .why-arisu-card > .why-arisu-grid"));
  assert.ok(styles.includes("margin-top: 2px !important"));
});

test("mobile homepage footer clears the accordion section without changing shared page rules", () => {
  assert.ok(footer.includes("AFV459 — Keep the homepage footer clear"));
  assert.ok(footer.includes("margin-top: 8px !important"));
});

test("homepage references the isolated accordion assets and production build allowlists them", () => {
  assert.ok(html.includes("home-accordion.css?v=AFV459"));
  assert.ok(html.includes("home-accordion.js?v=AFV453"));
  assert.ok(build.includes('"home-accordion.css"'));
  assert.ok(build.includes('"home-accordion.js"'));
});

test("retired safety reminder is absent from the homepage markup", () => {
  assert.ok(!html.includes("Remember: Keep Your Account Safe!"));
});
