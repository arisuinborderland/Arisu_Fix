
const VERCEL_ORIGIN = "https://arisufix.vercel.app";

const ALLOWED_ENDPOINTS = new Set([
  "story-config",
  "story-count",
  "stories",
  "story-view",
  "story-views-admin"
]);

export async function onRequest({ request, params }) {
  const rawPath = params.path;
  const segments = Array.isArray(rawPath)
    ? rawPath
    : [rawPath];

  const endpoint = segments
    .filter((part) => typeof part === "string" && part.length > 0)
    .join("/");

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `/api/${endpoint}`,
    VERCEL_ORIGIN
  );

  upstreamUrl.search = incomingUrl.search;

  try {
    const upstreamRequest = new Request(
      upstreamUrl.toString(),
      request
    );

    return await fetch(upstreamRequest);
  } catch {
    return new Response(
      JSON.stringify({
        error: "API temporarily unavailable."
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
