import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../functions/api/stories.js", import.meta.url), "utf8");
const moduleUrl = "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const { onRequest } = await import(moduleUrl);

test("Cloudflare stories GET fails closed when Supabase is not configured", async () => {
  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories"),
    env: {}
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Story backend is not configured." });
});

test("Cloudflare stories PATCH fails closed when admin backend is not configured", async () => {
  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "00000000-0000-4000-8000-000000000000", status: "active" })
    }),
    env: {}
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Story backend is not configured." });
});

test("Cloudflare stories POST preserves the Vercel upload fallback and query string", async (t) => {
  const originalFetch = globalThis.fetch;
  let upstreamRequest;

  globalThis.fetch = async (request) => {
    upstreamRequest = request;
    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories?source=cloudflare-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token"
      },
      body: JSON.stringify({ caption: "staging-test" })
    }),
    env: {}
  });

  assert.equal(response.status, 201);
  assert.equal(upstreamRequest.url, "https://arisufix.vercel.app/api/stories?source=cloudflare-test");
  assert.equal(upstreamRequest.method, "POST");
  assert.equal(upstreamRequest.headers.get("Authorization"), "Bearer test-token");
  assert.deepEqual(await upstreamRequest.json(), { caption: "staging-test" });
});
