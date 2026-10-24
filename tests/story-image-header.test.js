"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const parserPromise = import("../functions/_lib/story-image-header.mjs");

function writeU24LE(bytes, offset, value) {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
}

function pngHeader(width, height) {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  bytes.set([0, 0, 0, 13], 8);
  bytes.set([73, 72, 68, 82], 12);
  new DataView(bytes.buffer).setUint32(16, width, false);
  new DataView(bytes.buffer).setUint32(20, height, false);
  return bytes;
}

function jpegHeader(width, height) {
  const bytes = new Uint8Array(21);
  bytes.set([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08], 0);
  bytes[7] = (height >>> 8) & 0xff;
  bytes[8] = height & 0xff;
  bytes[9] = (width >>> 8) & 0xff;
  bytes[10] = width & 0xff;
  bytes[11] = 0x03;
  return bytes;
}

function webpHeader(width, height, variant = "VP8X") {
  let chunkLength;
  if (variant === "VP8X") chunkLength = 10;
  else if (variant === "VP8 ") chunkLength = 10;
  else chunkLength = 5;
  const bytes = new Uint8Array(20 + chunkLength);
  bytes.set([82, 73, 70, 70], 0); // RIFF
  new DataView(bytes.buffer).setUint32(4, bytes.length - 8, true);
  bytes.set([87, 69, 66, 80], 8); // WEBP
  for (let i = 0; i < 4; i++) bytes[12 + i] = variant.charCodeAt(i);
  new DataView(bytes.buffer).setUint32(16, chunkLength, true);
  if (variant === "VP8X") {
    writeU24LE(bytes, 24, width - 1);
    writeU24LE(bytes, 27, height - 1);
  } else if (variant === "VP8 ") {
    bytes.set([0x00, 0x00, 0x00, 0x9d, 0x01, 0x2a], 20);
    new DataView(bytes.buffer).setUint16(26, width, true);
    new DataView(bytes.buffer).setUint16(28, height, true);
  } else {
    bytes[20] = 0x2f;
    const w = width - 1;
    const h = height - 1;
    bytes[21] = w & 0xff;
    bytes[22] = (w >>> 8 & 0x3f) | ((h & 0x03) << 6);
    bytes[23] = (h >>> 2) & 0xff;
    bytes[24] = (h >>> 10) & 0x0f;
  }
  return bytes;
}

test("parses PNG dimensions from the IHDR chunk", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.deepEqual(parseImageDimensions("image/png", pngHeader(800, 600)), {
    format: "png", width: 800, height: 600
  });
});

test("parses JPEG SOF dimensions", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.deepEqual(parseImageDimensions("image/jpeg", jpegHeader(640, 480)), {
    format: "jpeg", width: 640, height: 480
  });
});

test("parses VP8X WebP canvas dimensions", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.deepEqual(parseImageDimensions("image/webp", webpHeader(1200, 900, "VP8X")), {
    format: "webp", width: 1200, height: 900
  });
});

test("parses VP8 lossy WebP frame dimensions", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.deepEqual(parseImageDimensions("image/webp", webpHeader(320, 200, "VP8 ")), {
    format: "webp", width: 320, height: 200
  });
});

test("parses VP8L lossless WebP dimensions", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.deepEqual(parseImageDimensions("image/webp", webpHeader(321, 201, "VP8L")), {
    format: "webp", width: 321, height: 201
  });
});

test("rejects MIME/header mismatches", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.equal(parseImageDimensions("image/jpeg", pngHeader(32, 32)), null);
  assert.equal(parseImageDimensions("image/png", jpegHeader(32, 32)), null);
  assert.equal(parseImageDimensions("image/webp", pngHeader(32, 32)), null);
});

test("rejects empty, truncated, and malformed headers", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.equal(parseImageDimensions("image/png", new Uint8Array()), null);
  assert.equal(parseImageDimensions("image/jpeg", new Uint8Array([0xff, 0xd8, 0xff])), null);
  const brokenPng = pngHeader(10, 10);
  brokenPng[11] = 12;
  assert.equal(parseImageDimensions("image/png", brokenPng), null);
});

test("rejects zero/invalid dimensions", async () => {
  const { parseImageDimensions } = await parserPromise;
  assert.equal(parseImageDimensions("image/png", pngHeader(0, 100)), null);
  assert.equal(parseImageDimensions("image/jpeg", jpegHeader(100, 0)), null);
});
