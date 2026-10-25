'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const originalFetch = global.fetch;

async function loadFunction(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const encoded = Buffer.from(source, 'utf8').toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

const env = {
  SUPABASE_URL: 'https://unit-test.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
  SUPABASE_SECRET_KEY: 'test-secret-key',
  STORY_ADMIN_EMAIL: 'admin@example.test',
  STORY_CLEANUP_SECRET: 'test-cleanup-secret'
};

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

test('Cloudflare Functions: reject unsupported methods and missing configuration', async (t) => {
  const stories = await loadFunction('functions/api/stories.js');
  const count = await loadFunction('functions/api/story-count.js');
  const config = await loadFunction('functions/api/story-config.js');
  const view = await loadFunction('functions/api/story-view.js');
  const viewsAdmin = await loadFunction('functions/api/story-views-admin.js');
  const cleanup = await loadFunction('functions/api/cleanup-stories.js');
  const fallback = await loadFunction('functions/api/[[path]].js');

  const cases = [
    ['stories rejects unsupported method', () => stories.onRequest({ request: new Request('https://site.test/api/stories', { method: 'PUT' }), env }), 405],
    ['story count rejects unsupported method', () => count.onRequest({ request: new Request('https://site.test/api/story-count', { method: 'POST' }), env }), 405],
    ['story config rejects unsupported method', () => config.onRequest({ request: new Request('https://site.test/api/story-config', { method: 'POST' }), env }), 405],
    ['story view rejects unsupported method', () => view.onRequest({ request: new Request('https://site.test/api/story-view', { method: 'GET' }), env }), 405],
    ['admin views rejects unsupported method', () => viewsAdmin.onRequest({ request: new Request('https://site.test/api/story-views-admin', { method: 'POST' }), env }), 405],
    ['cleanup rejects unsupported method', () => cleanup.onRequest({ request: new Request('https://site.test/api/cleanup-stories', { method: 'POST' }), env }), 405],
    ['fallback returns JSON 404', () => fallback.onRequest({ request: new Request('https://site.test/api/unknown'), env }), 404],
    ['story count fails closed without secrets', () => count.onRequest({ request: new Request('https://site.test/api/story-count'), env: {} }), 503],
    ['story config fails closed without configuration', () => config.onRequest({ request: new Request('https://site.test/api/story-config'), env: {} }), 503],
    ['admin view counts fail closed without configuration', () => viewsAdmin.onRequest({ request: new Request('https://site.test/api/story-views-admin'), env: {} }), 503],
    ['story view rejects malformed ID', () => view.onRequest({ request: new Request('https://site.test/api/story-view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'bad-id' }) }), env }), 400],
    ['cleanup rejects wrong secret', () => cleanup.onRequest({ request: new Request('https://site.test/api/cleanup-stories', { headers: { Authorization: 'Bearer wrong-secret' } }), env }), 401],
    ['admin story listing rejects unauthenticated request', () => stories.onRequest({ request: new Request('https://site.test/api/stories?admin=1'), env }), 401],
    ['story mutation rejects unauthenticated request', () => stories.onRequest({ request: new Request('https://site.test/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }), env }), 401]
  ];

  for (const [name, run, expectedStatus] of cases) {
    await t.test(name, async () => {
      const response = await run();
      assert.equal(response.status, expectedStatus);
      assert.match(response.headers.get('content-type') || '', /application\/json/i);
    });
  }
});

test('Cloudflare Stories Function: lists active stories and signs storage image URLs', async (t) => {
  const stories = await loadFunction('functions/api/stories.js');
  const previousFetch = global.fetch;
  t.after(() => { global.fetch = previousFetch; });

  global.fetch = async (input, init = {}) => {
    const url = String(input);
    if (url.includes('/rest/v1/recovery_stories?')) {
      assert.match(url, /admin_status=eq\.active/);
      assert.match(url, /is_active=eq\.true/);
      return jsonResponse([{
        id: '12345678-1234-4234-8234-123456789abc',
        caption: 'Test story',
        storage_path: 'stories/test.jpg',
        published_at: '2026-10-25T00:00:00.000Z',
        expires_at: '2026-10-26T00:00:00.000Z',
        admin_status: 'active',
        sort_order: 0
      }]);
    }
    if (url.includes('/storage/v1/object/sign/recovery-stories/stories/test.jpg')) {
      assert.equal(init.method, 'POST');
      return jsonResponse({ signedURL: '/object/sign/recovery-stories/stories/test.jpg?token=test' });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  };

  const response = await stories.onRequest({
    request: new Request('https://site.test/api/stories'),
    env
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.stories.length, 1);
  assert.equal(body.stories[0].caption, 'Test story');
  assert.match(body.stories[0].imageUrl, /^https:\/\/unit-test\.supabase\.co\/storage\/v1\/object\/sign\//);
});

test('Cloudflare Story Count Function: returns exact active count without storage calls', async (t) => {
  const count = await loadFunction('functions/api/story-count.js');
  const previousFetch = global.fetch;
  t.after(() => { global.fetch = previousFetch; });

  global.fetch = async (input, init = {}) => {
    assert.match(String(input), /\/rest\/v1\/recovery_stories/);
    assert.equal(init.method, 'HEAD');
    assert.equal(init.headers.Prefer, 'count=exact');
    return new Response(null, { status: 200, headers: { 'content-range': '0-0/2' } });
  };

  const response = await count.onRequest({
    request: new Request('https://site.test/api/story-count'),
    env
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { count: 2 });
});

test.after(() => {
  global.fetch = originalFetch;
});
