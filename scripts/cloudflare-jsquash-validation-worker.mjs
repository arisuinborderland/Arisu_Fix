import { validateStoryImage } from "../functions/lib/story-image-jSquash.js";
import { onRequest as storiesOnRequest } from "../functions/api/stories.js";

const mockStats = { storageUploadAttempts: 0, storageUploads: 0, dbInsertAttempts: 0, storageDeletes: 0 };
let mockMode = "success";
const realFetch = globalThis.fetch.bind(globalThis);

function decodeBase64(value) {
  const binary = atob(String(value || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function mockJson(data, status = 200) {
  return Response.json(data, { status });
}

// In this local-only harness, Supabase calls are mocked; no real Supabase project is contacted.
globalThis.fetch = async (input, init) => {
  const outgoing = input instanceof Request ? input : new Request(input, init);
  const url = new URL(outgoing.url);

  if (url.hostname === "supabase.mock") {
    if (url.pathname === "/auth/v1/user") {
      const token = outgoing.headers.get("Authorization") || "";
      if (token.includes("not-admin")) {
        return mockJson({ id: "not-admin-user", email: "other@example.test" });
      }
      return mockJson({ id: "test-admin", email: "admin@example.test" });
    }

    if (url.pathname.startsWith("/storage/v1/object/recovery-stories/")) {
      if (outgoing.method === "POST") {
        mockStats.storageUploadAttempts++;
        if (mockMode === "storage-fail") return mockJson({ error: "mock storage unavailable" }, 500);
        mockStats.storageUploads++;
        return mockJson({ Key: url.pathname }, 200);
      }
      if (outgoing.method === "DELETE") {
        mockStats.storageDeletes++;
        return mockJson({ ok: true }, 200);
      }
    }

    if (url.pathname === "/rest/v1/recovery_stories" && outgoing.method === "POST") {
      mockStats.dbInsertAttempts++;
      if (mockMode === "db-fail") return mockJson({ error: "mock database unavailable" }, 500);
      const body = await outgoing.clone().json();
      return mockJson([{
        id: "00000000-0000-4000-8000-000000000001",
        caption: body.caption,
        published_at: body.published_at,
        expires_at: body.expires_at,
        storage_path: body.storage_path,
        admin_status: body.admin_status,
        sort_order: body.sort_order
      }], 201);
    }

    return mockJson({ error: "unhandled mocked Supabase request" }, 500);
  }

  if (url.hostname === "arisufix.vercel.app") {
    return mockJson({ source: "vercel-fallback" }, 202);
  }

  return realFetch(input, init);
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response("ok");
    }

    if (url.pathname === "/native-upload" || url.pathname === "/fallback-upload") {
      mockMode = request.headers.get("X-Mock-Mode") || "success";
      const env = {
        SUPABASE_URL: "https://supabase.mock",
        SUPABASE_SECRET_KEY: "test-secret-key-not-real",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key-not-real",
        STORY_ADMIN_USER_ID: "test-admin",
        STORY_ADMIN_EMAIL: "admin@example.test",
        STORY_UPLOAD_NATIVE_ENABLED: url.pathname === "/native-upload" ? "true" : "false"
      };
      const response = await storiesOnRequest({ request, env });
      const headers = new Headers(response.headers);
      headers.set("X-Integration-Mock-Stats", JSON.stringify(mockStats));
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed." }, { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "A valid JSON body is required." }, { status: 400 });
    }

    let bytes;
    try {
      bytes = decodeBase64(body?.base64);
    } catch {
      return Response.json({ ok: false, status: 415, error: "Invalid base64." }, { status: 415 });
    }

    const result = await validateStoryImage(body?.mimeType, bytes);
    return Response.json(result, { status: result.ok ? 200 : result.status });
  }
};
