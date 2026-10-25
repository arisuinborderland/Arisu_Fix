
const VERCEL_ORIGIN = "https://arisufix.vercel.app";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

async function proxyToVercel(request, url) {
  const target = new URL(`/api/stories${url.search}`, VERCEL_ORIGIN);

  try {
    return await fetch(new Request(target.toString(), request));
  } catch {
    return json(502, {
      error: "Stories service is temporarily unavailable."
    });
  }
}

async function postOnCloudflare(request, env) {
  const { validateStoryImage, MAX_IMAGE_BYTES } = await import("../lib/story-image-jSquash.js");
  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");
  const publishableKey = String(env.SUPABASE_PUBLISHABLE_KEY || "");
  const allowedId = String(env.STORY_ADMIN_USER_ID || "").trim();
  const allowedEmail = String(env.STORY_ADMIN_EMAIL || "").trim().toLowerCase();
  const maxRequestBytes = Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 8192;

  if (!supabaseUrl || !secretKey || !publishableKey || (!allowedId && !allowedEmail)) {
    return json(503, { error: "Story backend is not configured." });
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (Number.isFinite(contentLength) && contentLength > maxRequestBytes) {
    return json(413, { error: "Story image must be no larger than 3 MB." });
  }

  const auth = (request.headers.get("Authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!auth) return json(401, { error: "Admin authentication required." });

  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${auth[1]}`
      }
    });
    if (!authResponse.ok) return json(401, { error: "Admin authentication required." });

    const user = await authResponse.json();
    const authorized = Boolean(
      user?.id &&
      (
        (allowedId && user.id === allowedId) ||
        (allowedEmail && String(user.email || "").toLowerCase() === allowedEmail)
      )
    );
    if (!authorized) return json(401, { error: "Admin authentication required." });

    let rawBody;
    try {
      rawBody = await request.text();
    } catch {
      return json(400, { error: "A valid JSON body is required." });
    }
    if (new TextEncoder().encode(rawBody).byteLength > maxRequestBytes) {
      return json(413, { error: "Story image must be no larger than 3 MB." });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json(400, { error: "A valid JSON body is required." });
    }

    const caption = String(body?.caption || "").trim();
    if (caption.length > 180) {
      return json(400, { error: "Caption must be 180 characters or fewer." });
    }

    const mime = String(body?.mimeType || "").toLowerCase();
    const match = String(body?.imageData || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/i);
    if (!match || String(match[1]).toLowerCase() !== mime) {
      return json(400, { error: "Choose a valid JPEG, PNG, or WebP image." });
    }
    if (match[2].length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) {
      return json(413, { error: "Story image must be no larger than 3 MB." });
    }

    let binary;
    try {
      binary = atob(match[2]);
    } catch {
      return json(400, { error: "Choose a valid JPEG, PNG, or WebP image." });
    }
    if (binary.length > MAX_IMAGE_BYTES) {
      return json(413, { error: "Story image must be no larger than 3 MB." });
    }

    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }

    const imageCheck = await validateStoryImage(mime, bytes);
    if (!imageCheck.ok) return json(imageCheck.status, { error: imageCheck.error });

    const status = body.saveAsDraft === true ? "draft" : "active";
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const storagePath = `stories/${crypto.randomUUID()}.${ext}`;
    let storageUploaded = false;

    try {
      const storageResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/recovery-stories/${storagePath}`,
        {
          method: "POST",
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": mime,
            "x-upsert": "false"
          },
          body: bytes
        }
      );
      if (!storageResponse.ok) {
        return json(503, { error: "Unable to upload the story image." });
      }
      storageUploaded = true;

      const now = new Date();
      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/recovery_stories?select=id,caption,published_at,expires_at,storage_path,admin_status,sort_order`,
        {
          method: "POST",
          headers: {
            apikey: secretKey,
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            caption,
            storage_path: storagePath,
            published_at: now.toISOString(),
            expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            is_active: status === "active",
            admin_status: status,
            sort_order: 0
          })
        }
      );

      if (!insertResponse.ok) {
        await fetch(`${supabaseUrl}/storage/v1/object/recovery-stories/${storagePath}`, {
          method: "DELETE",
          headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
        }).catch(() => {});
        return json(503, { error: "Unable to save the story record." });
      }

      let inserted;
      try {
        inserted = await insertResponse.json();
      } catch {
        inserted = null;
      }
      if (!Array.isArray(inserted) || !inserted[0]) {
        await fetch(`${supabaseUrl}/storage/v1/object/recovery-stories/${storagePath}`, {
          method: "DELETE",
          headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
        }).catch(() => {});
        return json(503, { error: "Unable to save the story record." });
      }

      return json(201, { story: inserted[0] });
    } catch {
      if (storageUploaded) {
        await fetch(`${supabaseUrl}/storage/v1/object/recovery-stories/${storagePath}`, {
          method: "DELETE",
          headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` }
        }).catch(() => {});
      }
      return json(503, { error: "Stories service is temporarily unavailable." });
    }
  } catch {
    return json(503, { error: "Stories service is temporarily unavailable." });
  }
}

async function patchOnCloudflare(request, env) {
  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");
  const publishableKey = String(env.SUPABASE_PUBLISHABLE_KEY || "");
  const allowedId = String(env.STORY_ADMIN_USER_ID || "").trim();
  const allowedEmail = String(env.STORY_ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  if (
    !supabaseUrl ||
    !secretKey ||
    !publishableKey ||
    (!allowedId && !allowedEmail)
  ) {
    return json(503, { error: "Story backend is not configured." });
  }

  const auth = (request.headers.get("Authorization") || "")
    .match(/^Bearer\s+(.+)$/i);

  if (!auth) {
    return json(401, { error: "Admin authentication required." });
  }

  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${auth[1]}`
      }
    });

    if (!authResponse.ok) {
      return json(401, { error: "Admin authentication required." });
    }

    const user = await authResponse.json();

    const authorized = Boolean(
      user?.id &&
      (
        (allowedId && user.id === allowedId) ||
        (
          allowedEmail &&
          String(user.email || "").toLowerCase() === allowedEmail
        )
      )
    );

    if (!authorized) {
      return json(401, { error: "Admin authentication required." });
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return json(400, { error: "A valid JSON body is required." });
    }

    const id = String(body?.id || "");

    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return json(400, { error: "A valid Story ID is required." });
    }

    let patch;

    if (body.status !== undefined) {
      const status = String(body.status);

      if (!["active", "draft", "archived"].includes(status)) {
        return json(400, { error: "Invalid Story status." });
      }

      patch = {
        admin_status: status,
        is_active: status === "active"
      };

      if (status === "active") {
        const now = new Date();

        patch.published_at = now.toISOString();
        patch.expires_at = new Date(
          now.getTime() + 24 * 60 * 60 * 1000
        ).toISOString();
      }
    } else if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);

      if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 0 ||
        sortOrder > 1000000
      ) {
        return json(400, { error: "Invalid Story order." });
      }

      patch = { sort_order: sortOrder };
    } else {
      return json(400, {
        error: "A Story status or order is required."
      });
    }

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/recovery_stories?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(patch)
      }
    );

    if (!updateResponse.ok) {
      const status =
        updateResponse.status >= 400 && updateResponse.status < 500
          ? updateResponse.status
          : 503;

      return json(status, { error: "Unable to update the story." });
    }

    return json(200, { ok: true });
  } catch {
    return json(503, {
      error: "Stories service is temporarily unavailable."
    });
  }
}

async function deleteOnCloudflare(request, env, url) {
  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");
  const publishableKey = String(env.SUPABASE_PUBLISHABLE_KEY || "");
  const allowedId = String(env.STORY_ADMIN_USER_ID || "").trim();
  const allowedEmail = String(env.STORY_ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  if (!supabaseUrl || !secretKey || !publishableKey || (!allowedId && !allowedEmail)) {
    return json(503, { error: "Story backend is not configured." });
  }

  const auth = (request.headers.get("Authorization") || "").match(/^Bearer\s+(.+)$/i);
  if (!auth) return json(401, { error: "Admin authentication required." });

  const id = String(url.searchParams.get("id") || "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return json(400, { error: "A valid Story ID is required." });
  }

  try {
    const authResponse = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: {
        apikey: publishableKey,
        Authorization: "Bearer " + auth[1]
      }
    });
    if (!authResponse.ok) return json(401, { error: "Admin authentication required." });

    const user = await authResponse.json();
    const authorized = Boolean(
      user?.id &&
      (
        (allowedId && user.id === allowedId) ||
        (allowedEmail && String(user.email || "").toLowerCase() === allowedEmail)
      )
    );
    if (!authorized) return json(401, { error: "Admin authentication required." });

    const recordResponse = await fetch(
      supabaseUrl + "/rest/v1/recovery_stories?select=id,storage_path&id=eq." +
      encodeURIComponent(id) + "&limit=1",
      {
        headers: {
          apikey: secretKey,
          Authorization: "Bearer " + secretKey
        }
      }
    );
    if (!recordResponse.ok) return json(503, { error: "Unable to locate the story." });

    const records = await recordResponse.json();
    if (!Array.isArray(records) || records.length === 0) {
      return json(404, { error: "Story not found." });
    }

    const storagePath = String(records[0].storage_path || "");
    if (!storagePath.startsWith("stories/")) {
      return json(400, { error: "Refusing to delete a non-Story object." });
    }

    const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
    const storageResponse = await fetch(
      supabaseUrl + "/storage/v1/object/recovery-stories/" + encodedPath,
      {
        method: "DELETE",
        headers: {
          apikey: secretKey,
          Authorization: "Bearer " + secretKey
        }
      }
    );

    if (!storageResponse.ok) {
      const details = (await storageResponse.text()).toLowerCase();
      const missing =
        storageResponse.status === 404 ||
        ([400, 409].includes(storageResponse.status) &&
          /(?:object|file|resource).*(?:not found|does not exist|no such)|(?:not found|does not exist|no such).*(?:object|file|resource)/i.test(details));
      if (!missing) {
        return json(503, {
          error: "Unable to remove the story image. The record was preserved."
        });
      }
    }

    const deleteResponse = await fetch(
      supabaseUrl + "/rest/v1/recovery_stories?id=eq." + encodeURIComponent(id),
      {
        method: "DELETE",
        headers: {
          apikey: secretKey,
          Authorization: "Bearer " + secretKey,
          Prefer: "return=minimal"
        }
      }
    );
    if (!deleteResponse.ok) {
      return json(503, { error: "Unable to remove the story record." });
    }

    return json(200, { ok: true });
  } catch {
    return json(503, { error: "Stories service is temporarily unavailable." });
  }
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  // PATCH status and ordering updates run on Cloudflare.
  if (request.method === "PATCH") {
    return patchOnCloudflare(request, env);
  }

  // DELETE requests run on Cloudflare; uploads remain on Vercel.
  if (request.method === "DELETE") {
    return deleteOnCloudflare(request, env, url);
  }

  if (!["GET", "POST"].includes(request.method)) {
    const response = json(405, { error: "Method not allowed." });
    response.headers.set("Allow", "GET, POST, PATCH, DELETE");
    return response;
  }

  if (request.method === "POST" && String(env.STORY_UPLOAD_NATIVE_ENABLED || "") === "true") {
    return postOnCloudflare(request, env);
  }

  if (request.method !== "GET") {
    return proxyToVercel(request, url);
  }

  const adminMode = url.searchParams.get("admin") === "1";
  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");

  if (!supabaseUrl || !secretKey) {
    return json(503, { error: "Story backend is not configured." });
  }

  const publishableKey = String(env.SUPABASE_PUBLISHABLE_KEY || "");
  const allowedId = String(env.STORY_ADMIN_USER_ID || "").trim();
  const allowedEmail = String(env.STORY_ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  if (
    adminMode &&
    (!publishableKey || (!allowedId && !allowedEmail))
  ) {
    return json(503, { error: "Story admin is not configured." });
  }

  try {
    if (adminMode) {
      const authorization = request.headers.get("Authorization") || "";
      const match = authorization.match(/^Bearer\s+(.+)$/i);

      if (!match) {
        return json(401, { error: "Admin authentication required." });
      }

      const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${match[1]}`
        }
      });

      if (!authResponse.ok) {
        return json(401, { error: "Admin authentication required." });
      }

      const user = await authResponse.json();

      const authorized = Boolean(
        user?.id &&
        (
          (allowedId && user.id === allowedId) ||
          (
            allowedEmail &&
            String(user.email || "").toLowerCase() === allowedEmail
          )
        )
      );

      if (!authorized) {
        return json(401, { error: "Admin authentication required." });
      }
    }

    const cutoff = encodeURIComponent(new Date().toISOString());

    const query = adminMode
      ? `${supabaseUrl}/rest/v1/recovery_stories?select=id,caption,storage_path,published_at,expires_at,admin_status,sort_order,is_active&order=sort_order.asc,published_at.desc`
      : `${supabaseUrl}/rest/v1/recovery_stories?select=id,caption,storage_path,published_at,expires_at,admin_status,sort_order&admin_status=eq.active&is_active=eq.true&expires_at=gt.${cutoff}&order=sort_order.asc,published_at.desc`;

    const response = await fetch(query, {
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`
      }
    });

    if (!response.ok) {
      return json(503, {
        error: "Stories service is temporarily unavailable."
      });
    }

    const rows = await response.json();

    if (!Array.isArray(rows)) {
      return json(503, { error: "Invalid stories response." });
    }

    const stories = await Promise.all(rows.map(async (row) => {
      try {
        const storagePath = String(row.storage_path || "");

        if (!storagePath.startsWith("stories/")) return null;

        const encodedPath = storagePath
          .split("/")
          .map(encodeURIComponent)
          .join("/");

        const signedResponse = await fetch(
          `${supabaseUrl}/storage/v1/object/sign/recovery-stories/${encodedPath}`,
          {
            method: "POST",
            headers: {
              apikey: secretKey,
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ expiresIn: 300 })
          }
        );

        if (!signedResponse.ok) return null;

        const signed = await signedResponse.json();
        const signedUrl = signed?.signedURL || signed?.signedUrl || "";

        if (!signedUrl) return null;

        const imageUrl = signedUrl.startsWith("http")
          ? signedUrl
          : `${supabaseUrl}/storage/v1${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;

        return {
          id: row.id,
          caption: row.caption,
          publishedAt: row.published_at,
          expiresAt: row.expires_at,
          expires_at: row.expires_at,
          adminStatus: row.admin_status ||
            (row.is_active === false ? "archived" : "active"),
          sortOrder: Number(row.sort_order) || 0,
          imageUrl
        };
      } catch {
        return null;
      }
    }));

    return json(200, { stories: stories.filter(Boolean) });
  } catch {
    return json(503, {
      error: adminMode
        ? "Unable to load the story library."
        : "Stories service is temporarily unavailable."
    });
  }
}
