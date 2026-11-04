"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

test("AFV460 uses the approved simple Connect with Arisu header", () => {
  assert.equal(pkg.version, "460.0.0");
  assert.match(html, /class="contact-divider connect-arisu-heading"/);
  assert.match(html, /Connect with <span class="connect-arisu-name">Arisu<\/span>/);
  assert.match(html, /class="connect-arisu-verified"/);
  assert.match(html, /class="connect-arisu-mascot" src="assets\/story-viewer\/a_high_quality_vibrant_anime_style_png_illustrati\.png\?v=AFV460"/);
  assert.doesNotMatch(html, /OR VISIT MY OTHER SOCIAL MEDIA ACCOUNTS/);
});

test("Connect with Arisu header has no divider lines or boxed check treatment", () => {
  const start = styles.indexOf("/* AFV460 — Simple Connect with Arisu header.");
  assert.ok(start >= 0, "AFV460 header styles exist");
  const headerStyles = styles.slice(start);
  assert.match(headerStyles, /\.connect-arisu-heading::before[\s\S]*?display:\s*none\s*!important/);
  assert.match(headerStyles, /\.connect-arisu-heading::after[\s\S]*?display:\s*none\s*!important/);
  assert.match(headerStyles, /background:\s*transparent/);
  assert.match(headerStyles, /\.connect-arisu-verified[\s\S]*?border:\s*0/);
  assert.match(headerStyles, /\.connect-arisu-verified[\s\S]*?box-shadow:\s*none/);
});
