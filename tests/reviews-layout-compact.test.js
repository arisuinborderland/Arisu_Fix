"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "reviews.html"), "utf8");
const css = fs.readFileSync(path.join(root, "reviews.css"), "utf8");
const lightbox = fs.readFileSync(path.join(root, "review-lightbox.js"), "utf8");

test("Customer Reviews uses the compact thumbnail-and-details layout", () => {
  assert.match(css, /html body\.reviews-document \.reviews-page-grid \.review-proof-card\s*\{[\s\S]*?grid-template-columns: clamp\(100px, 27%, 166px\) minmax\(0, 1fr\)/);
  assert.match(css, /review-view-prompt/);
  assert.equal((html.match(/class="review-view-prompt"/g) || []).length, 4);
});

test("Review thumbnails and details can open the full-size screenshot", () => {
  assert.equal((html.match(/class="review-image-hint">TAP TO VIEW/g) || []).length, 4);
  assert.equal((html.match(/data-review-open tabindex="0" role="button"/g) || []).length, 4);
  assert.match(lightbox, /querySelectorAll\("\.review-proof-card \.review-proof-image img"\)/);
  assert.match(lightbox, /querySelectorAll\("\.review-proof-card \[data-review-open\]"\)/);
});

test("Full-size review viewer includes zoom controls and pan support", () => {
  for (const id of ["reviewLightboxZoomOut", "reviewLightboxZoomReset", "reviewLightboxZoomIn"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(lightbox, /MAX_ZOOM = 3/);
  assert.match(lightbox, /pointermove/);
  assert.match(lightbox, /event\.key === "Escape"/);
});

test("Reviews page stylesheet cache key matches the current AFV274 release", () => {
  assert.match(html, /reviews\.css\?v=AFV274/);
  assert.match(html, /review-lightbox\.js\?v=AFV26\d+/);
  assert.doesNotMatch(html, new RegExp("\\?v=AFV" + "256"));
});

test("Review lightbox closes when tapping outside the rendered image", () => {
  assert.match(lightbox, /function isPointInsideRenderedImage\(clientX, clientY\)/);
  assert.match(lightbox, /viewer\.addEventListener\("click", \(event\) =>/);
  assert.match(lightbox, /if \(!isPointInsideRenderedImage\(event\.clientX, event\.clientY\)\) closeReviewLightbox\(\)/);
});
