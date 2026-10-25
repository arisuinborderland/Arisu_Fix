const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

function constantTimeEqual(leftValue, rightValue) {
  const left = new TextEncoder().encode(leftValue);
  const right = new TextEncoder().encode(rightValue);
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index++) {
    difference |= (left[index] || 0) ^ (right[index] || 0);
  }
  return difference === 0;
}

function isMissingStorageObject(status, body) {
  if (status === 404) return true;
  if (status !== 400 && status !== 409) return false;
  return /(?:object|file|resource).*(?:not found|does not exist|no such)|(?:not found|does not exist|no such).*(?:object|file|resource)/i.test(String(body || ""));
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export async function onRequest({ request, env }) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...JSON_HEADERS, Allow: "GET" }
    });
  }

  const supabaseUrl = String(env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");
  const cleanupSecret = String(env.STORY_CLEANUP_SECRET || "");
  if (!supabaseUrl || !secretKey || !cleanupSecret) {
    return json(503, { error: "Story cleanup is not configured." });
  }

  const auth = (request.headers.get("Authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!auth || !constantTimeEqual(auth[1], cleanupSecret)) return json(401, { error: "Unauthorized" });

  let deleted = 0;
  let failed = 0;
  const cutoff = new Date().toISOString();
  // Stay below the Pages Functions subrequest budget: one list request plus
  // at most two Supabase requests (Storage delete + row delete) per Story.
  const batchSize = 20;

  try {
    const recordsUrl = new URL("/rest/v1/recovery_stories", supabaseUrl);
    recordsUrl.searchParams.set("select", "id,storage_path");
    recordsUrl.searchParams.set("expires_at", `lte.${cutoff}`);
    recordsUrl.searchParams.set("admin_status", "eq.active");
    recordsUrl.searchParams.set("is_active", "eq.true");
    recordsUrl.searchParams.set("storage_path", "like.stories/%");
    recordsUrl.searchParams.set("order", "expires_at.asc,id.asc");
    recordsUrl.searchParams.set("limit", String(batchSize));

    const recordsResponse = await fetch(recordsUrl.toString(), {
      headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
    });
    const records = await readJson(recordsResponse);
    if (!recordsResponse.ok || !Array.isArray(records)) {
      return json(503, { error: "Unable to load expired Stories for cleanup.", deleted, failed: failed + 1 });
    }
    if (!records.length) return json(200, { ok: true, deleted: 0, failed: 0, moreMayRemain: false });

    for (const record of records) {
      const id = String(record.id || "");
      const storagePath = String(record.storage_path || "");
      if (!/^[0-9a-f-]{36}$/i.test(id) || !storagePath.startsWith("stories/")) {
        failed++;
        continue;
      }

      const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
      let storageResponse;
      try {
        storageResponse = await fetch(`${supabaseUrl}/storage/v1/object/recovery-stories/${encodedPath}`, {
          method: "DELETE",
          headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
        });
      } catch {
        failed++;
        continue;
      }

      if (!storageResponse.ok) {
        const details = await storageResponse.text().catch(() => "");
        if (!isMissingStorageObject(storageResponse.status, details)) {
          failed++;
          continue;
        }
      }

      let deleteResponse;
      try {
        deleteResponse = await fetch(`${supabaseUrl}/rest/v1/recovery_stories?id=eq.${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
            Prefer: "return=minimal"
          }
        });
      } catch {
        failed++;
        continue;
      }
      if (!deleteResponse.ok) failed++;
      else deleted++;
    }

    return json(200, { ok: failed === 0, deleted, failed, moreMayRemain: records.length === batchSize });
  } catch {
    return json(503, { error: "Cleanup failed; retry on the next scheduled run.", deleted, failed: failed + 1 });
  }
}
