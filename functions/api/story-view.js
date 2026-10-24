
export async function onRequest({ request, env }) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  const json = (status, payload) =>
    new Response(JSON.stringify(payload), { status, headers });

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...headers, Allow: "POST" }
      }
    );
  }

  const supabaseUrl = String(env.SUPABASE_URL || "").replace(/\/$/, "");
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");

  if (!supabaseUrl || !secretKey) {
    return json(503, {
      error: "Story backend is not configured."
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, {
      error: "A valid JSON body is required."
    });
  }

  const id = String(body?.id || "");

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return json(400, {
      error: "A valid Story ID is required."
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/increment_recovery_story_view`,
      {
        method: "POST",
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ p_story_id: id })
      }
    );

    if (!response.ok) {
      return json(503, {
        error: "View tracking temporarily unavailable."
      });
    }

    return json(200, { ok: true });
  } catch {
    return json(503, {
      error: "View tracking temporarily unavailable."
    });
  }
}
