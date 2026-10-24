const FORMATS = Object.freeze({
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp"
});

const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf
]);

function isAscii(bytes, offset, value) {
  if (offset < 0 || offset + value.length > bytes.length) return false;
  for (let index = 0; index < value.length; index++) {
    if (bytes[offset + index] !== value.charCodeAt(index)) return false;
  }
  return true;
}

function readU16BE(bytes, offset) {
  return bytes[offset] * 256 + bytes[offset + 1];
}

function readU16LE(bytes, offset) {
  return bytes[offset] + bytes[offset + 1] * 256;
}

function readU24LE(bytes, offset) {
  return bytes[offset] + bytes[offset + 1] * 256 + bytes[offset + 2] * 65536;
}

function readU32BE(bytes, offset) {
  return bytes[offset] * 0x1000000 +
    bytes[offset + 1] * 0x10000 +
    bytes[offset + 2] * 0x100 +
    bytes[offset + 3];
}

function readU32LE(bytes, offset) {
  return bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000;
}

function dimensions(format, width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
      width < 1 || height < 1) return null;
  return { format, width, height };
}

function parseJpeg(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    while (offset < bytes.length && bytes[offset] === 0xff) offset++;
    if (offset >= bytes.length) return null;

    const marker = bytes[offset++];
    if (marker === 0x00) return null;
    if (marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0xd8 || marker === 0x01 ||
        (marker >= 0xd0 && marker <= 0xd7)) continue;

    if (offset + 2 > bytes.length) return null;
    const segmentLength = readU16BE(bytes, offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;

    if (JPEG_SOF_MARKERS.has(marker)) {
      if (segmentLength < 8) return null;
      const height = readU16BE(bytes, offset + 3);
      const width = readU16BE(bytes, offset + 5);
      return dimensions("jpeg", width, height);
    }
    offset += segmentLength;
  }
  return null;
}

function parsePng(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 24) return null;
  for (let index = 0; index < signature.length; index++) {
    if (bytes[index] !== signature[index]) return null;
  }
  if (readU32BE(bytes, 8) !== 13 || !isAscii(bytes, 12, "IHDR")) return null;
  return dimensions("png", readU32BE(bytes, 16), readU32BE(bytes, 20));
}

function parseWebp(bytes) {
  if (bytes.length < 20 || !isAscii(bytes, 0, "RIFF") ||
      !isAscii(bytes, 8, "WEBP")) return null;

  const riffEnd = readU32LE(bytes, 4) + 8;
  if (riffEnd < 20 || riffEnd > bytes.length) return null;

  let offset = 12;
  while (offset + 8 <= riffEnd) {
    const chunkTypeOffset = offset;
    const chunkLength = readU32LE(bytes, offset + 4);
    const dataOffset = offset + 8;
    const chunkEnd = dataOffset + chunkLength;
    if (chunkEnd > riffEnd) return null;

    if (isAscii(bytes, chunkTypeOffset, "VP8X")) {
      if (chunkLength < 10) return null;
      return dimensions(
        "webp",
        readU24LE(bytes, dataOffset + 4) + 1,
        readU24LE(bytes, dataOffset + 7) + 1
      );
    }

    if (isAscii(bytes, chunkTypeOffset, "VP8 ")) {
      if (chunkLength < 10 || !isAscii(bytes, dataOffset + 3, String.fromCharCode(0x9d, 0x01, 0x2a))) return null;
      const width = readU16LE(bytes, dataOffset + 6) & 0x3fff;
      const height = readU16LE(bytes, dataOffset + 8) & 0x3fff;
      return dimensions("webp", width, height);
    }

    if (isAscii(bytes, chunkTypeOffset, "VP8L")) {
      if (chunkLength < 5 || bytes[dataOffset] !== 0x2f) return null;
      const width = 1 + bytes[dataOffset + 1] +
        ((bytes[dataOffset + 2] & 0x3f) << 8);
      const height = 1 + ((bytes[dataOffset + 2] & 0xc0) >> 6) +
        (bytes[dataOffset + 3] << 2) +
        ((bytes[dataOffset + 4] & 0x0f) << 10);
      return dimensions("webp", width, height);
    }

    offset = chunkEnd + (chunkLength & 1);
  }
  return null;
}

/**
 * Parses only dimensions from the image container header. This must never be
 * treated as full validation: the codec decode step must also succeed.
 */
export function parseImageDimensions(mime, input) {
  if (!Object.prototype.hasOwnProperty.call(FORMATS, mime)) return null;
  if (!(input instanceof Uint8Array) || input.byteLength === 0) return null;

  let parsed = null;
  if (mime === "image/jpeg") parsed = parseJpeg(input);
  else if (mime === "image/png") parsed = parsePng(input);
  else if (mime === "image/webp") parsed = parseWebp(input);

  if (!parsed || parsed.format !== FORMATS[mime]) return null;
  return parsed;
}
