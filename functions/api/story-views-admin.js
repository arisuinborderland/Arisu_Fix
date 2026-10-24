
export async function onRequest({ request, env }) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  const json = (status, payload) =>
    new Response(JSON.stringify(payload), { status, headers });

  if (request.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...headers, Allow: "GET" }
      }
    );
  }

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
    return json(503, {
      error: "Story backend is not configured."
    });
  }

  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return json(401, {
      error: "Admin authentication required."
    });
  }

  try {
    const authResponse = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${match[1]}`
        }
      }
    );

    if (!authResponse.ok) {
      return json(401, {
        error: "Admin authentication required."
      });
    }

    const user = await authResponse.json();

    const isAdmin = Boolean(
      user?.id &&
      (
        (allowedId && user.id === allowedId) ||
        (
          allowedEmail &&
          String(user.email || "").toLowerCase() === allowedEmail
        )
      )
    );

    if (!isAdmin) {
      return json(401, {
        error: "Admin authentication required."
      });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/recovery_story_view_counts?select=story_id,views`,
      {
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`
        }
      }
    );

    if (!response.ok) {
      return json(503, {
        error: "Story view counts are temporarily unavailable. Check that the database migration has been applied."
      });
    }

    const rows = await response.json();

    if (!Array.isArray(rows)) {
      return json(503, {
        error: "Invalid story view counts response."
      });
    }

    const views = {};

    for (const row of rows) {
      views[row.story_id] = Number(row.views) || 0;
    }

    return json(200, { views });
  } catch {
    return json(503, {
      error: "Story view counts are temporarily unavailable."
    });
  }
}
