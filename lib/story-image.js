'use strict';
const sharp = require('sharp');
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const MAX_PIXELS = 16_000_000;
const MIME_FORMAT = Object.freeze({ 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' });

async function validateStoryImage(mime, bytes) {
  const expectedFormat = MIME_FORMAT[mime];
  if (!expectedFormat) return { ok: false, status: 415, error: 'Choose a valid JPEG, PNG, or WebP image.' };
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) return { ok: false, status: 415, error: 'The uploaded image is empty or invalid.' };
  if (bytes.length > MAX_IMAGE_BYTES) return { ok: false, status: 413, error: 'Story image must be no larger than 3 MB.' };

  try {
    const image = sharp(bytes, { failOn: 'error', limitInputPixels: MAX_PIXELS, sequentialRead: true });
    const metadata = await image.metadata();
    if (metadata.format !== expectedFormat) return { ok: false, status: 415, error: 'The uploaded file does not match its image type.' };
    const width = Number(metadata.width);
    const height = Number(metadata.height);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > MAX_DIMENSION || height > MAX_DIMENSION || width * height > MAX_PIXELS) {
      return { ok: false, status: 413, error: 'Image dimensions exceed the allowed limit (4096 × 4096, 16 megapixels maximum).' };
    }
    // Metadata alone does not prove that compressed pixel data is valid. Force a full decode,
    // but resize the decoded result to 1×1 so decoded pixel memory stays bounded.
    await image.clone().rotate().resize({ width: 1, height: 1, fit: 'inside' }).toBuffer();
    return { ok: true, width, height, format: metadata.format };
  } catch {
    return { ok: false, status: 415, error: 'The uploaded file is not a valid, decodable image.' };
  }
}

module.exports = { validateStoryImage, MAX_IMAGE_BYTES, MAX_DIMENSION, MAX_PIXELS };
