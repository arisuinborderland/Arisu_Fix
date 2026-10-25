import decodeJpeg, { init as initJpeg } from "@jsquash/jpeg/decode.js";
import decodePng, { init as initPng } from "@jsquash/png/decode.js";
import decodeWebp, { init as initWebp } from "@jsquash/webp/decode.js";
import JPEG_DEC_WASM from "../../node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm";
import PNG_DEC_WASM from "../../node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm";
import WEBP_DEC_WASM from "../../node_modules/@jsquash/webp/codec/dec/webp_dec.wasm";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_DIMENSION = 4096;
export const MAX_PIXELS = 16_000_000;

const MIME_FORMAT = Object.freeze({
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp"
});
const DECODERS = Object.freeze({
  jpeg: decodeJpeg,
  png: decodePng,
  webp: decodeWebp
});
let decoderInitialization;

function reject(status, error) {
  return { ok: false, status, error };
}

function asBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  return null;
}

function textAt(bytes, offset, text) {
  if (offset < 0 || offset + text.length > bytes.length) return false;
  for (let index = 0; index < text.length; index++) {
    if (bytes[offset + index] !== text.charCodeAt(index)) return false;
  }
  return true;
}

function uint16BE(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function uint16LE(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function uint32BE(bytes, offset) {
  return (bytes[offset] * 0x1000000) +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3];
}

function pngDimensions(bytes) {
  if (
    bytes.length < 24 ||
    ![137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value) ||
    uint32BE(bytes, 8) !== 13 ||
    !textAt(bytes, 12, "IHDR")
  ) return null;
  return { width: uint32BE(bytes, 16), height: uint32BE(bytes, 20) };
}

function jpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  const startOfFrame = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf
  ]);
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    while (offset < bytes.length && bytes[offset] === 0xff) offset++;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) return null;
    const segmentLength = uint16BE(bytes, offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    if (startOfFrame.has(marker)) {
      if (segmentLength < 7) return null;
      return {
        height: uint16BE(bytes, offset + 3),
        width: uint16BE(bytes, offset + 5)
      };
    }
    offset += segmentLength;
  }
  return null;
}

function webpDimensions(bytes) {
  if (bytes.length < 30 || !textAt(bytes, 0, "RIFF") || !textAt(bytes, 8, "WEBP")) return null;
  const chunk = bytes.length >= 16 ? String.fromCharCode(...bytes.subarray(12, 16)) : "";
  if (chunk === "VP8X" && bytes.length >= 30) {
    return {
      width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
    };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null;
    return {
      width: uint16LE(bytes, 26) & 0x3fff,
      height: uint16LE(bytes, 28) & 0x3fff
    };
  }
  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    const b1 = bytes[21], b2 = bytes[22], b3 = bytes[23], b4 = bytes[24];
    return {
      width: 1 + b1 + ((b2 & 0x3f) << 8),
      height: 1 + ((b2 & 0xc0) >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10)
    };
  }
  return null;
}

function detectImage(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { format: "jpeg", dimensions: jpegDimensions(bytes) };
  }
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) {
    return { format: "png", dimensions: pngDimensions(bytes) };
  }
  if (bytes.length >= 12 && textAt(bytes, 0, "RIFF") && textAt(bytes, 8, "WEBP")) {
    return { format: "webp", dimensions: webpDimensions(bytes) };
  }
  return null;
}

async function ensureDecodersInitialized() {
  if (!decoderInitialization) {
    decoderInitialization = Promise.all([
      initJpeg(JPEG_DEC_WASM),
      initPng(PNG_DEC_WASM),
      initWebp(WEBP_DEC_WASM)
    ]).catch((error) => {
      decoderInitialization = undefined;
      throw error;
    });
  }
  await decoderInitialization;
}

function dimensionsRejected(width, height) {
  return (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_DIMENSION ||
    height > MAX_DIMENSION ||
    width * height > MAX_PIXELS
  );
}

export async function validateStoryImage(mime, input) {
  const normalizedMime = String(mime || "").toLowerCase();
  const expectedFormat = MIME_FORMAT[normalizedMime];
  if (!expectedFormat) {
    return reject(415, "Choose a valid JPEG, PNG, or WebP image.");
  }

  const bytes = asBytes(input);
  if (!bytes || bytes.byteLength === 0) {
    return reject(415, "The uploaded image is empty or invalid.");
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return reject(413, "Story image must be no larger than 3 MB.");
  }

  const detected = detectImage(bytes);
  if (!detected || !detected.dimensions) {
    return reject(415, "The uploaded file is not a valid, decodable image.");
  }
  if (detected.format !== expectedFormat) {
    return reject(415, "The uploaded file does not match its image type.");
  }

  const { width, height } = detected.dimensions;
  if (dimensionsRejected(width, height)) {
    return reject(413, "Image dimensions exceed the allowed limit (4096 × 4096, 16 megapixels maximum).");
  }

  try {
    await ensureDecodersInitialized();
    const decoded = await DECODERS[expectedFormat](bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (
      decoded.width !== width ||
      decoded.height !== height ||
      !decoded.data ||
      decoded.data.length !== decoded.width * decoded.height * 4
    ) {
      return reject(415, "The uploaded file is not a valid, decodable image.");
    }
    return { ok: true, width, height, format: expectedFormat };
  } catch {
    return reject(415, "The uploaded file is not a valid, decodable image.");
  }
}
