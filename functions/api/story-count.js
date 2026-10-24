
export async function onRequest({ request, env }) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

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
  const secretKey = env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    return new Response(
      JSON.stringify({ error: "Story backend is not configured." }),
      { status: 503, headers }
    );
  }

  try {
    const cutoff = encodeURIComponent(new Date().toISOString());

    const url =
      `${supabaseUrl}/rest/v1/recovery_stories` +
      `?select=id&admin_status=eq.active` +
      `&is_active=eq.true&expires_at=gt.${cutoff}`;

    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        Prefer: "count=exact",
        Range: "0-0"
      }
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Stories count is temporarily unavailable." }),
        { status: 503, headers }
      );
    }

    const contentRange = response.headers.get("content-range") || "";
    const match = contentRange.match(/\/(\d+)$/);

    if (!match) {
      return new Response(
        JSON.stringify({ error: "Invalid stories count response." }),
        { status: 503, headers }
      );
    }

    return new Response(
      JSON.stringify({ count: Number(match[1]) }),
      { status: 200, headers }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Stories count is temporarily unavailable." }),
      { status: 503, headers }
    );
  }
}
