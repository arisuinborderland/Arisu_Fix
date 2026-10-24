
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

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  // Keep admin requests and write operations on the existing Vercel API.
  if (
    request.method !== "GET" ||
    url.searchParams.get("admin") === "1"
  ) {
    return proxyToVercel(request, url);
  }

  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");

  if (!supabaseUrl || !secretKey) {
    return json(503, {
      error: "Story backend is not configured."
    });
  }

  const authHeaders = {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`
  };

  try {
    const cutoff = encodeURIComponent(new Date().toISOString());

    const query =
      `${supabaseUrl}/rest/v1/recovery_stories` +
      `?select=id,caption,storage_path,published_at,expires_at,admin_status,sort_order` +
      `&admin_status=eq.active&is_active=eq.true` +
      `&expires_at=gt.${cutoff}` +
      `&order=sort_order.asc,published_at.desc`;

    const response = await fetch(query, {
      headers: authHeaders
    });

    if (!response.ok) {
      return json(503, {
        error: "Stories service is temporarily unavailable."
      });
    }

    const rows = await response.json();

    if (!Array.isArray(rows)) {
      return json(503, {
        error: "Invalid stories response."
      });
    }

    const stories = await Promise.all(
      rows.map(async (row) => {
        try {
          const storagePath = String(row.storage_path || "");

          if (!storagePath.startsWith("stories/")) {
            return null;
          }

          const encodedPath = storagePath
            .split("/")
            .map(encodeURIComponent)
            .join("/");

          const signedResponse = await fetch(
            `${supabaseUrl}/storage/v1/object/sign/recovery-stories/${encodedPath}`,
            {
              method: "POST",
              headers: {
                ...authHeaders,
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
            adminStatus: row.admin_status || "active",
            sortOrder: Number(row.sort_order) || 0,
            imageUrl
          };
        } catch {
          return null;
        }
      })
    );

    return json(200, {
      stories: stories.filter(Boolean)
    });
  } catch {
    return json(503, {
      error: "Stories service is temporarily unavailable."
    });
  }
}
