const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const supabaseUrl = String(env.SUPABASE_URL || "").trim().replace(/\/$/, "");
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

  const id = String(body?.id || "").trim();
  const sessionId = String(body?.sessionId || "").trim();

  if (!UUID_RE.test(id)) {
    return json(400, {
      error: "A valid Story ID is required."
    });
  }

  if (!UUID_RE.test(sessionId)) {
    return json(400, {
      error: "A valid viewer session ID is required."
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/record_recovery_story_view`,
      {
        method: "POST",
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          p_story_id: id,
          p_session_id: sessionId
        })
      }
    );

    if (!response.ok) {
      return json(503, {
        error: "View tracking temporarily unavailable."
      });
    }

    const counted = await response.json().catch(() => false);
    return json(200, { ok: true, counted: counted === true });
  } catch {
    return json(503, {
      error: "View tracking temporarily unavailable."
    });
  }
}
