import { validateStoryImage, MAX_IMAGE_BYTES } from "../_lib/story-image.js";

const HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: HEADERS });
}

function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  const length = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let i = 0; i < length; i++) difference |= (a[i] || 0) ^ (b[i] || 0);
  return difference === 0;
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...HEADERS, Allow: "POST" }
    });
  }

  const expected = String(env.STORY_VALIDATION_TEST_TOKEN || "");
  if (!expected) return json(404, { error: "Not found." });

  const authorization = (request.headers.get("Authorization") || "")
    .match(/^Bearer\s+(.+)$/i);
  if (!authorization || !constantTimeEqual(authorization[1], expected)) {
    return json(401, { error: "Unauthorized" });
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 65536) {
    return json(413, { error: "Test payload is too large." });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "A valid JSON body is required." });
  }

  const mime = String(body?.mimeType || "").toLowerCase();
  const match = String(body?.imageData || "").match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/
  );
  if (!match || match[1] !== mime) {
    return json(400, { error: "Choose a valid JPEG, PNG, or WebP image." });
  }
  if (match[2].length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) {
    return json(413, { error: "Story image must be no larger than 3 MB." });
  }

  let binary;
  try {
    binary = atob(match[2]);
  } catch {
    return json(400, { error: "Invalid base64 image data." });
  }
  if (binary.length > MAX_IMAGE_BYTES) {
    return json(413, { error: "Story image must be no larger than 3 MB." });
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const result = await validateStoryImage(mime, bytes);
  return json(result.ok ? 200 : result.status, result);
}
