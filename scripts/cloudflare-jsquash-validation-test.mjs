import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.JSQUASH_TEST_URL || "http://127.0.0.1:8798";
const fixtureDir = process.env.JSQUASH_FIXTURE_DIR;
if (!fixtureDir) throw new Error("JSQUASH_FIXTURE_DIR must point to prepared image fixtures.");

const fixtures = {
  jpeg: fs.readFileSync(path.join(fixtureDir, "fixture.jpeg")),
  png: fs.readFileSync(path.join(fixtureDir, "fixture.png")),
  webp: fs.readFileSync(path.join(fixtureDir, "fixture.webp")),
  widePng: fs.readFileSync(path.join(fixtureDir, "too-wide.png")),
  oversized: fs.readFileSync(path.join(fixtureDir, "too-large.bin")),
  truncatedPng: fs.readFileSync(path.join(fixtureDir, "truncated.png"))
};

async function validate(label, mimeType, bytes, expectedStatus, expectedFormat) {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mimeType, base64: bytes.toString("base64") })
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(label + ": Worker did not return JSON (HTTP " + response.status + ")");
  }
  assert.equal(response.status, expectedStatus, label + ": " + JSON.stringify(result));
  if (expectedStatus === 200) {
    assert.equal(result.ok, true, label + ": expected ok=true");
    assert.ok(result.width > 0 && result.height > 0, label + ": invalid decoded dimensions");
    assert.equal(result.format, expectedFormat, label + ": detected format mismatch");
  } else {
    assert.equal(result.ok, false, label + ": expected rejection");
    assert.equal(result.status, expectedStatus, label + ": payload status mismatch");
  }
  console.log("Integration validator passed:", label, "=> HTTP", response.status);
}

await validate("valid JPEG", "image/jpeg", fixtures.jpeg, 200, "jpeg");
await validate("valid PNG", "image/png", fixtures.png, 200, "png");
await validate("valid WebP", "image/webp", fixtures.webp, 200, "webp");
await validate("wrong MIME: PNG declared as JPEG", "image/jpeg", fixtures.png, 415);
await validate("unsupported GIF MIME", "image/gif", fixtures.png, 415);
await validate("oversized binary (>3 MiB)", "image/png", fixtures.oversized, 413);
await validate("valid PNG with 4097-pixel dimension", "image/png", fixtures.widePng, 413);
await validate("truncated PNG", "image/png", fixtures.truncatedPng, 415);
await validate("empty image", "image/png", Buffer.alloc(0), 415);


function imageData(mimeType, bytes) {
  return "data:" + mimeType + ";base64," + bytes.toString("base64");
}

async function nativeUpload(label, { path = "/native-upload", mimeType = "image/png", bytes = fixtures.png, token = "test-admin-token", mode = "success", caption = "Integration upload", saveAsDraft = false } = {}, expectedStatus) {
  const response = await fetch(baseUrl + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      "X-Mock-Mode": mode
    },
    body: JSON.stringify({
      imageData: imageData(mimeType, bytes),
      mimeType,
      fileName: "integration-fixture.png",
      caption,
      saveAsDraft
    })
  });
  const result = await response.json();
  assert.equal(response.status, expectedStatus, label + ": " + JSON.stringify(result));
  const stats = JSON.parse(response.headers.get("X-Integration-Mock-Stats") || "{}");
  console.log("Native story upload route passed:", label, "=> HTTP", response.status);
  return { response, result, stats };
}

const beforeSuccessStats = { ...{} };
const successfulUpload = await nativeUpload("valid native upload", {}, 201);
assert.equal(successfulUpload.result.story.caption, "Integration upload");
assert.equal(successfulUpload.result.story.admin_status, "active");
assert.ok(successfulUpload.result.story.storage_path.startsWith("stories/"));
assert.ok(successfulUpload.result.story.storage_path.endsWith(".png"));
assert.equal(successfulUpload.stats.storageUploads, 1);
assert.equal(successfulUpload.stats.dbInsertAttempts, 1);

const mismatchUpload = await nativeUpload("reject PNG bytes declared as JPEG", {
  mimeType: "image/jpeg",
  bytes: fixtures.png
}, 415);
assert.equal(mismatchUpload.stats.storageUploads, successfulUpload.stats.storageUploads, "mismatched file must not reach storage");

const unauthorizedUpload = await nativeUpload("reject non-admin user", {
  token: "not-admin-token"
}, 401);
assert.equal(unauthorizedUpload.stats.dbInsertAttempts, successfulUpload.stats.dbInsertAttempts, "non-admin must not insert a row");

const storageFailureUpload = await nativeUpload("handle storage upload failure", {
  mode: "storage-fail"
}, 503);
assert.equal(storageFailureUpload.stats.dbInsertAttempts, successfulUpload.stats.dbInsertAttempts, "storage failure must not insert DB row");

const dbFailureUpload = await nativeUpload("roll back storage object after DB failure", {
  mode: "db-fail"
}, 503);
assert.equal(dbFailureUpload.stats.storageDeletes, successfulUpload.stats.storageDeletes + 1, "database failure must trigger object cleanup");

const fallbackUpload = await nativeUpload("feature flag off preserves Vercel fallback", {
  path: "/fallback-upload"
}, 202);
assert.equal(fallbackUpload.result.source, "vercel-fallback");


console.log("All Cloudflare jSquash validator and native-upload integration cases passed.");
