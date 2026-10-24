import decodeJpeg, { init as initJpegDecode } from "@jsquash/jpeg/decode";
import decodePng, { init as initPngDecode } from "@jsquash/png/decode";
import decodeWebp, { init as initWebpDecode } from "@jsquash/webp/decode";

import JPEG_DEC_WASM from "../../node_modules/@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm";
import PNG_DEC_WASM from "../../node_modules/@jsquash/png/codec/pkg/squoosh_png_bg.wasm";
import WEBP_DEC_WASM from "../../node_modules/@jsquash/webp/codec/dec/webp_dec.wasm";

import { parseImageDimensions } from "./story-image-header.mjs";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 4096;
export const MAX_IMAGE_PIXELS = 16_000_000;

const FORMAT_DECODERS = Object.freeze({
  "image/jpeg": {
    format: "jpeg",
    init: initJpegDecode,
    wasm: JPEG_DEC_WASM,
    decode: decodeJpeg
  },
  "image/png": {
    format: "png",
    init: initPngDecode,
    wasm: PNG_DEC_WASM,
    decode: decodePng
  },
  "image/webp": {
    format: "webp",
    init: initWebpDecode,
    wasm: WEBP_DEC_WASM,
    decode: decodeWebp
  }
});

const initPromises = new Map();

async function ensureDecoder(mime) {
  const decoder = FORMAT_DECODERS[mime];
  if (!initPromises.has(mime)) {
    const pending = decoder.init(decoder.wasm).catch((error) => {
      initPromises.delete(mime);
      throw error;
    });
    initPromises.set(mime, pending);
  }
  await initPromises.get(mime);
}

function asExactArrayBuffer(bytes) {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );
}

function invalid(error, status = 415) {
  return { ok: false, status, error };
}

export async function validateStoryImage(mime, bytes) {
  const decoder = FORMAT_DECODERS[mime];
  if (!decoder) {
    return invalid("Choose a valid JPEG, PNG, or WebP image.");
  }
  if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) {
    return invalid("The uploaded image is empty or invalid.");
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    return invalid("Story image must be no larger than 3 MB.", 413);
  }

  // Reject absurd dimensions before the decoder allocates full pixel buffers.
  const header = parseImageDimensions(mime, bytes);
  if (!header || header.format !== decoder.format) {
    return invalid("The uploaded file does not match its image type.");
  }
  if (
    header.width > MAX_IMAGE_DIMENSION ||
    header.height > MAX_IMAGE_DIMENSION ||
    header.width * header.height > MAX_IMAGE_PIXELS
  ) {
    return invalid(
      "Image dimensions exceed the allowed limit (4096 × 4096, 16 megapixels maximum).",
      413
    );
  }

  try {
    await ensureDecoder(mime);
    const decoded = await decoder.decode(asExactArrayBuffer(bytes));
    const expectedBytes = header.width * header.height * 4;

    if (
      !decoded ||
      decoded.width !== header.width ||
      decoded.height !== header.height ||
      !decoded.data ||
      decoded.data.length !== expectedBytes
    ) {
      return invalid("The uploaded file is not a valid, decodable image.");
    }

    return {
      ok: true,
      width: header.width,
      height: header.height,
      format: decoder.format
    };
  } catch {
    return invalid("The uploaded file is not a valid, decodable image.");
  }
}
