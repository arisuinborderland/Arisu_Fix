
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

  const supabaseUrl = String(env.SUPABASE_URL || "").trim();
  const publishableKey = String(
    env.SUPABASE_PUBLISHABLE_KEY || ""
  ).trim();
  const secretKey = String(env.SUPABASE_SECRET_KEY || "");
  const adminUserId = String(env.STORY_ADMIN_USER_ID || "").trim();
  const adminEmail = String(env.STORY_ADMIN_EMAIL || "").trim();

  const ready = Boolean(
    supabaseUrl &&
    publishableKey &&
    secretKey &&
    (adminUserId || adminEmail)
  );

  if (!ready) {
    return new Response(
      JSON.stringify({
        error: "Story backend is not configured yet."
      }),
      { status: 503, headers }
    );
  }

  return new Response(
    JSON.stringify({ supabaseUrl, publishableKey }),
    { status: 200, headers }
  );
}
