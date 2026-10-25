const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const MAX_PIXELS = 16_000_000;
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf
]);

function json(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

function getConfig(env) {
  return {
    supabaseUrl: String(env.SUPABASE_URL || "").trim().replace(/\/$/, ""),
    publishableKey: String(env.SUPABASE_PUBLISHABLE_KEY || "").trim(),
    secretKey: String(env.SUPABASE_SECRET_KEY || ""),
    allowedId: String(env.STORY_ADMIN_USER_ID || "").trim(),
    allowedEmail: String(env.STORY_ADMIN_EMAIL || "").trim().toLowerCase()
  };
}

function configIsReady(config, { admin = false } = {}) {
  return Boolean(
    config.supabaseUrl &&
    config.secretKey &&
    (!admin || (
      config.publishableKey &&
      (config.allowedId || config.allowedEmail)
    ))
  );
}

async function authorizeAdmin(request, config) {
  const match = String(request.headers.get("Authorization") || "")
    .match(/^Bearer\s+(.+)$/i);
  if (!match) return false;

  try {
    const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${match[1]}`
      }
    });
    if (!response.ok) return false;

    const user = await response.json();
    return Boolean(
      user?.id &&
      (
        (config.allowedId && user.id === config.allowedId) ||
        (config.allowedEmail && String(user.email || "").toLowerCase() === config.allowedEmail)
      )
    );
  } catch {
    return false;
  }
}

function readU32BE(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return NaN;
  return bytes[offset] * 0x1000000 +
    (bytes[offset + 1] << 16) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3];
}

function readU32LE(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return NaN;
  return bytes[offset] +
    (bytes[offset + 1] << 8) +
    (bytes[offset + 2] << 16) +
    bytes[offset + 3] * 0x1000000;
}

function ascii(bytes, start, length) {
  if (start < 0 || start + length > bytes.length) return "";
  let value = "";
  for (let i = start; i < start + length; i++) value += String.fromCharCode(bytes[i]);
  return value;
}

function jpegDimensions(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < bytes.length - 3) {
    if (bytes[offset] !== 0xff) return null;
    while (offset < bytes.length && bytes[offset] === 0xff) offset++;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) return null;
    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    if (JPEG_SOF_MARKERS.has(marker)) {
      if (segmentLength < 7 || offset + 7 > bytes.length) return null;
      return {
        height: (bytes[offset + 3] << 8) | bytes[offset + 4],
        width: (bytes[offset + 5] << 8) | bytes[offset + 6]
      };
    }
    offset += segmentLength;
  }
  return null;
}

function pngDimensions(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 33 || signature.some((value, i) => bytes[i] !== value)) return null;
  if (readU32BE(bytes, 8) !== 13 || ascii(bytes, 12, 4) !== "IHDR") return null;
  if (ascii(bytes, bytes.length - 8, 4) !== "IEND") return null;
  return { width: readU32BE(bytes, 16), height: readU32BE(bytes, 20) };
}

function webpDimensions(bytes) {
  if (bytes.length < 30 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") return null;
  const riffSize = readU32LE(bytes, 4);
  if (!Number.isFinite(riffSize) || riffSize + 8 > bytes.length || riffSize < 12) return null;

  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8X" && bytes.length >= 30) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }

  if (chunk === "VP8 " && bytes.length >= 30 &&
      bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    return {
      width: ((bytes[26] | (bytes[27] << 8)) & 0x3fff),
      height: ((bytes[28] | (bytes[29] << 8)) & 0x3fff)
    };
  }

  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    return {
      width: 1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
      height: 1 + ((bytes[22] & 0xc0) >> 6) + (bytes[23] << 2) + ((bytes[24] & 0x0f) << 10)
    };
  }

  return null;
}

function inspectImage(bytes, mime) {
  let dimensions = null;
  if (mime === "image/jpeg") {
    if (bytes.length < 4 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
      return { ok: false, status: 415, error: "The uploaded JPEG image is incomplete or invalid." };
    }
    dimensions = jpegDimensions(bytes);
  } else if (mime === "image/png") {
    dimensions = pngDimensions(bytes);
  } else if (mime === "image/webp") {
    dimensions = webpDimensions(bytes);
  } else {
    return { ok: false, status: 415, error: "Choose a valid JPEG, PNG, or WebP image." };
  }

  if (!dimensions || !Number.isInteger(dimensions.width) || !Number.isInteger(dimensions.height) ||
      dimensions.width < 1 || dimensions.height < 1) {
    return { ok: false, status: 415, error: "The uploaded file does not appear to be a valid image of the selected type." };
  }
  if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION ||
      dimensions.width * dimensions.height > MAX_PIXELS) {
    return { ok: false, status: 413, error: "Image dimensions exceed the allowed limit (4096 × 4096, 16 megapixels maximum)." };
  }
  return { ok: true, ...dimensions };
}

function decodeImageData(imageData, mimeType) {
  const match = String(imageData || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
  const mime = String(mimeType || "").toLowerCase();
  if (!match || match[1].toLowerCase() !== mime || match[2].length % 4 !== 0) {
    return { ok: false, status: 415, error: "Choose a valid JPEG, PNG, or WebP image." };
  }

  const encoded = match[2];
  const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
  const estimatedBytes = (encoded.length / 4) * 3 - padding;
  if (!Number.isSafeInteger(estimatedBytes) || estimatedBytes < 1) {
    return { ok: false, status: 415, error: "The uploaded image is empty or invalid." };
  }
  if (estimatedBytes > MAX_IMAGE_BYTES) {
    return { ok: false, status: 413, error: "Story image must be no larger than 3.5 MiB." };
  }

  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const inspected = inspectImage(bytes, mime);
    if (!inspected.ok) return inspected;
    return { ok: true, mime, bytes };
  } catch {
    return { ok: false, status: 415, error: "The uploaded file is not a valid image." };
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function isMissingStorageObject(status, body) {
  if (status === 404) return true;
  if (status !== 400 && status !== 409) return false;
  const message = typeof body === "string" ? body : JSON.stringify(body || {});
  return /(?:object|file|resource).*(?:not found|does not exist|no such)|(?:not found|does not exist|no such).*(?:object|file|resource)/i.test(message);
}

async function uploadStory(request, config) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { error: "A valid JSON body is required." }); }

  const caption = String(body?.caption || "").trim();
  if (caption.length > 180) return json(400, { error: "Caption must be 180 characters or fewer." });

  const decoded = decodeImageData(body?.imageData, body?.mimeType);
  if (!decoded.ok) return json(decoded.status, { error: decoded.error });

  const extension = decoded.mime === "image/png" ? "png" : decoded.mime === "image/webp" ? "webp" : "jpg";
  const storagePath = `stories/${crypto.randomUUID()}.${extension}`;
  const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
  const storageUrl = `${config.supabaseUrl}/storage/v1/object/recovery-stories/${encodedPath}`;

  let storageResponse;
  try {
    storageResponse = await fetch(storageUrl, {
      method: "POST",
      headers: {
        apikey: config.secretKey,
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": decoded.mime,
        "x-upsert": "false"
      },
      body: decoded.bytes
    });
  } catch {
    return json(503, { error: "Unable to store this Story image right now." });
  }
  if (!storageResponse.ok) {
    await storageResponse.text().catch(() => "");
    return json(503, { error: "Unable to store this Story image right now." });
  }

  const now = new Date();
  const status = body?.saveAsDraft === true ? "draft" : "active";
  const record = {
    caption,
    storage_path: storagePath,
    published_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    is_active: status === "active",
    admin_status: status,
    sort_order: 0
  };

  try {
    const insertResponse = await fetch(
      `${config.supabaseUrl}/rest/v1/recovery_stories?select=id,caption,published_at,expires_at,storage_path,admin_status,sort_order`,
      {
        method: "POST",
        headers: {
          apikey: config.secretKey,
          Authorization: `Bearer ${config.secretKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(record)
      }
    );
    const inserted = await readJson(insertResponse);
    if (!insertResponse.ok || !Array.isArray(inserted) || !inserted[0]) {
      await fetch(storageUrl, {
        method: "DELETE",
        headers: { apikey: config.secretKey, Authorization: `Bearer ${config.secretKey}` }
      }).catch(() => {});
      return json(503, { error: "Unable to save the Story record. Please try again." });
    }
    return json(201, { story: inserted[0] });
  } catch {
    await fetch(storageUrl, {
      method: "DELETE",
      headers: { apikey: config.secretKey, Authorization: `Bearer ${config.secretKey}` }
    }).catch(() => {});
    return json(503, { error: "Unable to save the Story record. Please try again." });
  }
}

async function updateStory(request, config) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { error: "A valid JSON body is required." }); }

  const id = String(body?.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json(400, { error: "A valid Story ID is required." });

  let patch;
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!["active", "draft", "archived"].includes(status)) return json(400, { error: "Invalid Story status." });
    patch = { admin_status: status, is_active: status === "active" };
    if (status === "active") {
      const now = new Date();
      patch.published_at = now.toISOString();
      patch.expires_at = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  } else if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 1_000_000) return json(400, { error: "Invalid Story order." });
    patch = { sort_order: sortOrder };
  } else {
    return json(400, { error: "A Story status or order is required." });
  }

  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/recovery_stories?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        apikey: config.secretKey,
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(patch)
    });
    if (!response.ok) return json(503, { error: "Unable to update the Story." });
    return json(200, { ok: true });
  } catch {
    return json(503, { error: "Unable to update the Story." });
  }
}

async function deleteStory(request, config, url) {
  const id = String(url.searchParams.get("id") || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json(400, { error: "A valid Story ID is required." });

  try {
    const recordResponse = await fetch(
      `${config.supabaseUrl}/rest/v1/recovery_stories?select=id,storage_path&id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: { apikey: config.secretKey, Authorization: `Bearer ${config.secretKey}` } }
    );
    const records = await readJson(recordResponse);
    if (!recordResponse.ok || !Array.isArray(records)) return json(503, { error: "Unable to locate the Story." });
    if (!records.length) return json(404, { error: "Story not found." });

    const storagePath = String(records[0].storage_path || "");
    if (!storagePath.startsWith("stories/")) return json(400, { error: "Refusing to delete a non-Story object." });
    const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
    const storageResponse = await fetch(
      `${config.supabaseUrl}/storage/v1/object/recovery-stories/${encodedPath}`,
      { method: "DELETE", headers: { apikey: config.secretKey, Authorization: `Bearer ${config.secretKey}` } }
    );
    if (!storageResponse.ok) {
      const details = await storageResponse.text().catch(() => "");
      if (!isMissingStorageObject(storageResponse.status, details)) {
        return json(503, { error: "Unable to remove the Story image. The record was preserved." });
      }
    }

    const deleteResponse = await fetch(
      `${config.supabaseUrl}/rest/v1/recovery_stories?id=eq.${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          apikey: config.secretKey,
          Authorization: `Bearer ${config.secretKey}`,
          Prefer: "return=minimal"
        }
      }
    );
    if (!deleteResponse.ok) return json(503, { error: "Unable to remove the Story record." });
    return json(200, { ok: true });
  } catch {
    return json(503, { error: "Stories service is temporarily unavailable." });
  }
}

async function listStories(request, config, url) {
  const adminMode = url.searchParams.get("admin") === "1";
  if (adminMode && !(await authorizeAdmin(request, config))) {
    return json(401, { error: "Admin authentication required." });
  }

  const cutoff = encodeURIComponent(new Date().toISOString());
  const query = adminMode
    ? `${config.supabaseUrl}/rest/v1/recovery_stories?select=id,caption,storage_path,published_at,expires_at,admin_status,sort_order,is_active&order=sort_order.asc,published_at.desc`
    : `${config.supabaseUrl}/rest/v1/recovery_stories?select=id,caption,storage_path,published_at,expires_at,admin_status,sort_order&admin_status=eq.active&is_active=eq.true&expires_at=gt.${cutoff}&order=sort_order.asc,published_at.desc`;

  try {
    const response = await fetch(query, {
      headers: { apikey: config.secretKey, Authorization: `Bearer ${config.secretKey}` }
    });
    const rows = await readJson(response);
    if (!response.ok || !Array.isArray(rows)) return json(503, { error: "Stories service is temporarily unavailable." });

    const stories = await Promise.all(rows.map(async (row) => {
      try {
        const storagePath = String(row.storage_path || "");
        if (!storagePath.startsWith("stories/")) return null;
        const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
        const signedResponse = await fetch(
          `${config.supabaseUrl}/storage/v1/object/sign/recovery-stories/${encodedPath}`,
          {
            method: "POST",
            headers: {
              apikey: config.secretKey,
              Authorization: `Bearer ${config.secretKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ expiresIn: 3600 })
          }
        );
        if (!signedResponse.ok) return null;
        const signed = await readJson(signedResponse);
        const signedUrl = signed?.signedURL || signed?.signedUrl || "";
        if (!signedUrl) return null;
        const imageUrl = signedUrl.startsWith("http")
          ? signedUrl
          : `${config.supabaseUrl}/storage/v1${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
        return {
          id: row.id,
          caption: row.caption,
          publishedAt: row.published_at,
          expiresAt: row.expires_at,
          expires_at: row.expires_at,
          adminStatus: row.admin_status || (row.is_active === false ? "archived" : "active"),
          sortOrder: Number(row.sort_order) || 0,
          imageUrl
        };
      } catch {
        return null;
      }
    }));
    return json(200, { stories: stories.filter(Boolean) });
  } catch {
    return json(503, { error: adminMode ? "Unable to load the Story library." : "Stories service is temporarily unavailable." });
  }
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const config = getConfig(env);

  if (!["GET", "POST", "PATCH", "DELETE"].includes(request.method)) {
    return json(405, { error: "Method not allowed." }, { Allow: "GET, POST, PATCH, DELETE" });
  }

  if (!configIsReady(config, { admin: request.method !== "GET" || url.searchParams.get("admin") === "1" })) {
    return json(503, { error: "Story backend is not configured." });
  }

  if (request.method === "GET") return listStories(request, config, url);

  if (!(await authorizeAdmin(request, config))) {
    return json(401, { error: "Admin authentication required." });
  }

  if (request.method === "POST") return uploadStory(request, config);
  if (request.method === "PATCH") return updateStory(request, config);
  return deleteStory(request, config, url);
}
