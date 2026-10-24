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


test("Cloudflare stories PATCH rejects missing admin authentication before any upstream request", async (t) => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;

  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("Fetch must not be called without a bearer token");
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "00000000-0000-4000-8000-000000000000", status: "active" })
    }),
    env: {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "test-secret",
      SUPABASE_PUBLISHABLE_KEY: "test-publishable",
      STORY_ADMIN_USER_ID: "test-admin-id"
    }
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Admin authentication required." });
  assert.equal(fetchCalls, 0);
});

test("Cloudflare stories DELETE rejects missing admin authentication before any upstream request", async (t) => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;

  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("Fetch must not be called without a bearer token");
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories?id=00000000-0000-4000-8000-000000000000", {
      method: "DELETE"
    }),
    env: {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "test-secret",
      SUPABASE_PUBLISHABLE_KEY: "test-publishable",
      STORY_ADMIN_USER_ID: "test-admin-id"
    }
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Admin authentication required." });
  assert.equal(fetchCalls, 0);
});

const configuredStoryEnv = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SECRET_KEY: "test-secret",
  SUPABASE_PUBLISHABLE_KEY: "test-publishable",
  STORY_ADMIN_USER_ID: "00000000-0000-4000-8000-000000000001"
};

test("Cloudflare stories PATCH rejects requests without an admin bearer token", async () => {
  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "00000000-0000-4000-8000-000000000000",
        status: "active"
      })
    }),
    env: configuredStoryEnv
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Admin authentication required." });
});

test("Cloudflare stories DELETE rejects requests without an admin bearer token", async () => {
  const response = await onRequest({
    request: new Request(
      "https://arisufix.pages.dev/api/stories?id=00000000-0000-4000-8000-000000000000",
      { method: "DELETE" }
    ),
    env: configuredStoryEnv
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Admin authentication required." });
});

test("Cloudflare stories admin GET rejects requests without an admin bearer token", async () => {
  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories?admin=1"),
    env: configuredStoryEnv
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Admin authentication required." });
});


const countSource = await readFile(new URL("../functions/api/story-count.js", import.meta.url), "utf8");
const countModuleUrl = "data:text/javascript;base64," + Buffer.from(countSource).toString("base64");
const { onRequest: onStoryCountRequest } = await import(countModuleUrl);

const viewSource = await readFile(new URL("../functions/api/story-view.js", import.meta.url), "utf8");
const viewModuleUrl = "data:text/javascript;base64," + Buffer.from(viewSource).toString("base64");
const { onRequest: onStoryViewRequest } = await import(viewModuleUrl);

test("Cloudflare stories DELETE fails closed when admin backend is not configured", async () => {
  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories?id=00000000-0000-4000-8000-000000000000", {
      method: "DELETE"
    }),
    env: {}
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Story backend is not configured." });
});

test("Cloudflare story-count rejects methods other than GET without calling Supabase", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called for a disallowed method");
  };

  try {
    const response = await onStoryCountRequest({
      request: new Request("https://arisufix.pages.dev/api/story-count", { method: "POST" }),
      env: { SUPABASE_URL: "https://example.supabase.co", SUPABASE_SECRET_KEY: "test-secret" }
    });

    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "GET");
    assert.deepEqual(await response.json(), { error: "Method not allowed" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Cloudflare story-view rejects malformed story IDs before calling Supabase", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("fetch should not be called for a malformed story ID");
  };

  try {
    const response = await onStoryViewRequest({
      request: new Request("https://arisufix.pages.dev/api/story-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "not-a-uuid" })
      }),
      env: { SUPABASE_URL: "https://example.supabase.co", SUPABASE_SECRET_KEY: "test-secret" }
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "A valid Story ID is required." });
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("Cloudflare stories PATCH rejects invalid status before writing to Supabase", async (t) => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    calls.push({ url, method: init.method || (input instanceof Request ? input.method : "GET") });
    if (url === "https://example.supabase.co/auth/v1/user") {
      return new Response(JSON.stringify({ id: "test-admin-id", email: "admin@example.com" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    throw new Error("Database write must not occur for an invalid status");
  };
  t.after(() => { globalThis.fetch = originalFetch; });

  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer valid-test-token" },
      body: JSON.stringify({ id: "00000000-0000-4000-8000-000000000000", status: "published" })
    }),
    env: {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "test-secret",
      SUPABASE_PUBLISHABLE_KEY: "test-publishable",
      STORY_ADMIN_USER_ID: "test-admin-id"
    }
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Invalid Story status." });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.supabase.co/auth/v1/user");
});


const configSource = await readFile(new URL("../functions/api/story-config.js", import.meta.url), "utf8");
const configModuleUrl = "data:text/javascript;base64," + Buffer.from(configSource).toString("base64");
const { onRequest: onStoryConfigRequest } = await import(configModuleUrl);

test("Cloudflare story-config rejects non-GET methods", async () => {
  const response = await onStoryConfigRequest({
    request: new Request("https://arisufix.pages.dev/api/story-config", { method: "POST" }),
    env: {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "server-secret-must-not-leak",
      SUPABASE_PUBLISHABLE_KEY: "public-test-key",
      STORY_ADMIN_USER_ID: "test-admin-id"
    }
  });

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
  assert.deepEqual(await response.json(), { error: "Method not allowed" });
});

test("Cloudflare story-config returns only the publishable key when configured", async () => {
  const response = await onStoryConfigRequest({
    request: new Request("https://arisufix.pages.dev/api/story-config"),
    env: {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SECRET_KEY: "server-secret-must-not-leak",
      SUPABASE_PUBLISHABLE_KEY: "public-test-key",
      STORY_ADMIN_USER_ID: "test-admin-id"
    }
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { publishableKey: "public-test-key" });
});

test("Cloudflare stories POST returns a controlled 502 when the Vercel upload fallback is unreachable", async (t) => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";

  globalThis.fetch = async (request) => {
    requestedUrl = request.url;
    throw new Error("simulated upstream network failure");
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

  assert.equal(requestedUrl, "https://arisufix.vercel.app/api/stories?source=cloudflare-test");
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: "Stories service is temporarily unavailable."
  });
});

test("Cloudflare stories POST preserves an upstream validation error response", async (t) => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: "Choose a valid JPEG, PNG, or WebP image." }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" }
    }
  );

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: "invalid", mimeType: "image/gif" })
    }),
    env: {}
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Choose a valid JPEG, PNG, or WebP image."
  });
});

test("Cloudflare stories POST preserves the upstream admin-authentication failure", async (t) => {
  const originalFetch = globalThis.fetch;
  let upstreamRequest;

  globalThis.fetch = async (request) => {
    upstreamRequest = request;
    return new Response(
      JSON.stringify({ error: "Admin authentication required." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  };

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const response = await onRequest({
    request: new Request("https://arisufix.pages.dev/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: "auth-test" })
    }),
    env: {}
  });

  assert.equal(upstreamRequest.url, "https://arisufix.vercel.app/api/stories");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    error: "Admin authentication required."
  });
});
