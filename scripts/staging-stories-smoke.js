'use strict';
const crypto = require('node:crypto');

const required = ['STAGING_BASE_URL', 'STAGING_SUPABASE_URL', 'STAGING_SUPABASE_SECRET_KEY', 'STAGING_SUPABASE_PUBLISHABLE_KEY', 'STAGING_CRON_SECRET', 'STAGING_ADMIN_TOKEN', 'STAGING_EXPIRED_ADMIN_TOKEN', 'STAGING_CONFIRM_ISOLATED'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error(`Missing required staging-only environment variables: ${missing.join(', ')}`);
  process.exit(2);
}
if (process.env.STAGING_CONFIRM_ISOLATED !== 'YES') {
  console.error('Safety stop: set STAGING_CONFIRM_ISOLATED=YES only after confirming this is a disposable, isolated staging project.');
  process.exit(2);
}
const base = new URL(process.env.STAGING_BASE_URL);
const supabase = process.env.STAGING_SUPABASE_URL.replace(/\/$/, '');
const supabaseHost = new URL(supabase).hostname;
if (base.protocol !== 'https:' || !/\.vercel\.app$/.test(base.hostname) || base.hostname === 'arisufix.vercel.app' || base.hostname.includes('production')) {
  console.error('Safety stop: STAGING_BASE_URL must be an HTTPS Vercel preview/staging hostname, not the known production host.');
  process.exit(2);
}
if (supabaseHost === 'glivqrmyqwtbmlffghjo.supabase.co' || !supabaseHost.endsWith('.supabase.co')) {
  console.error('Safety stop: STAGING_SUPABASE_URL must point to an isolated Supabase project, not the configured production project.');
  process.exit(2);
}
const headers = { apikey: process.env.STAGING_SUPABASE_SECRET_KEY, Authorization: `Bearer ${process.env.STAGING_SUPABASE_SECRET_KEY}`, 'Content-Type': 'application/json' };
async function check(name, condition, detail='') {
  if (!condition) throw new Error(`${name} failed${detail ? `: ${detail}` : ''}`);
  console.log(`PASS ${name}`);
}
async function readJson(response) {
  const raw = await response.text();
  try { return raw ? JSON.parse(raw) : null; } catch { return raw; }
}
async function main() {
  const configRes = await fetch(new URL('/api/story-config', base));
  const config = await readJson(configRes);
  await check('Vercel staging Story config', configRes.status === 200 && Boolean(config?.publishableKey), `HTTP ${configRes.status}`);

  const publicRes = await fetch(new URL('/api/stories', base));
  const publicData = await readJson(publicRes);
  await check('Public Stories API + Supabase connectivity', publicRes.status === 200 && Array.isArray(publicData?.stories), `HTTP ${publicRes.status}`);

  const adminRes = await fetch(new URL('/api/stories?admin=1', base));
  await readJson(adminRes);
  await check('Unauthenticated admin listing is blocked', adminRes.status === 401, `HTTP ${adminRes.status}`);

  const postRes = await fetch(new URL('/api/stories', base), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'unauthorized smoke test' }) });
  await readJson(postRes);
  await check('Unauthenticated Story mutation is blocked', postRes.status === 401, `HTTP ${postRes.status}`);

  const wrongCronRes = await fetch(new URL('/api/cleanup-stories', base), { headers: { Authorization: 'Bearer intentionally-wrong-staging-secret' } });
  await readJson(wrongCronRes);
  await check('Cleanup rejects an invalid secret', wrongCronRes.status === 401, `HTTP ${wrongCronRes.status}`);

  const expiredAdminRes = await fetch(new URL('/api/stories?admin=1', base), { headers: { Authorization: `Bearer ${process.env.STAGING_EXPIRED_ADMIN_TOKEN}` } });
  await readJson(expiredAdminRes);
  await check('Expired admin token is rejected', expiredAdminRes.status === 401, `HTTP ${expiredAdminRes.status}`);

  // Exercise the deployed real image decoder with one tiny valid PNG and ensure the
  // temporary draft is removed immediately through the admin API.
  const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/XioAAAAASUVORK5CYII=';
  const uploadRes = await fetch(new URL('/api/stories', base), { method: 'POST', headers: { Authorization: `Bearer ${process.env.STAGING_ADMIN_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'staging image decoder smoke test', mimeType: 'image/png', imageData: `data:image/png;base64,${tinyPng}`, saveAsDraft: true }) });
  const uploadData = await readJson(uploadRes);
  await check('Real decoder accepts valid staging PNG', uploadRes.status === 201 && Boolean(uploadData?.story?.id), `HTTP ${uploadRes.status}`);
  if (uploadData?.story?.id) {
    const removeRes = await fetch(new URL(`/api/stories?id=${encodeURIComponent(uploadData.story.id)}`, base), { method: 'DELETE', headers: { Authorization: `Bearer ${process.env.STAGING_ADMIN_TOKEN}` } });
    await readJson(removeRes);
    await check('Temporary image test draft is deleted', removeRes.status === 200, `HTTP ${removeRes.status}`);
  }

  const malformedJpeg = Buffer.concat([Buffer.from([0xff,0xd8,0xff]), Buffer.from('not-a-real-jpeg')]).toString('base64');
  const malformedJpegRes = await fetch(new URL('/api/stories', base), { method: 'POST', headers: { Authorization: `Bearer ${process.env.STAGING_ADMIN_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'invalid JPEG test', mimeType: 'image/jpeg', imageData: `data:image/jpeg;base64,${malformedJpeg}`, saveAsDraft: true }) });
  await readJson(malformedJpegRes);
  await check('Real decoder rejects malformed JPEG', malformedJpegRes.status === 415, `HTTP ${malformedJpegRes.status}`);

  const malformedWebpBytes = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0,0,0,0]), Buffer.from('WEBP'), Buffer.from('not-a-real-webp')]);
  const malformedWebpRes = await fetch(new URL('/api/stories', base), { method: 'POST', headers: { Authorization: `Bearer ${process.env.STAGING_ADMIN_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'invalid WebP test', mimeType: 'image/webp', imageData: `data:image/webp;base64,${malformedWebpBytes.toString('base64')}`, saveAsDraft: true }) });
  await readJson(malformedWebpRes);
  await check('Real decoder rejects malformed WebP', malformedWebpRes.status === 415, `HTTP ${malformedWebpRes.status}`);

  const oversizedBytes = Buffer.alloc(3 * 1024 * 1024 + 1);
  const oversizedRes = await fetch(new URL('/api/stories', base), { method: 'POST', headers: { Authorization: `Bearer ${process.env.STAGING_ADMIN_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: 'oversized image test', mimeType: 'image/png', imageData: `data:image/png;base64,${oversizedBytes.toString('base64')}`, saveAsDraft: true }) });
  await readJson(oversizedRes);
  await check('Oversized upload is rejected', oversizedRes.status === 413, `HTTP ${oversizedRes.status}`);

  // Create one isolated, already-expired fixture with a deliberately nonexistent object.
  // It is inserted into the explicitly configured staging DB only, then cleanup is invoked
  // against the staging Vercel deployment and the row's disappearance is verified.
  const fixturePath = `stories/audit-missing-${crypto.randomUUID()}.jpg`;
  let fixtureId = null;
  try {
    const insertRes = await fetch(`${supabase}/rest/v1/recovery_stories?select=id,storage_path`, {
      method: 'POST', headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ caption: 'staging cleanup smoke fixture', storage_path: fixturePath, published_at: new Date(Date.now() - 48*60*60*1000).toISOString(), expires_at: new Date(Date.now() - 60*1000).toISOString(), is_active: false, admin_status: 'archived', sort_order: 0 })
    });
    const inserted = await readJson(insertRes);
    if (!insertRes.ok || !Array.isArray(inserted) || !inserted[0]?.id) throw new Error(`Could not create isolated staging fixture (HTTP ${insertRes.status})`);
    fixtureId = inserted[0].id;

    const cleanupRes = await fetch(new URL('/api/cleanup-stories', base), { headers: { Authorization: `Bearer ${process.env.STAGING_CRON_SECRET}` } });
    const cleanupData = await readJson(cleanupRes);
    await check('Cleanup handles missing storage object', cleanupRes.status === 200 && Number(cleanupData?.deleted) >= 1, `HTTP ${cleanupRes.status}`);

    const verifyRes = await fetch(`${supabase}/rest/v1/recovery_stories?select=id&id=eq.${encodeURIComponent(fixtureId)}`, { headers });
    const remaining = await readJson(verifyRes);
    await check('Expired staging fixture is removed from database', verifyRes.ok && Array.isArray(remaining) && remaining.length === 0, `HTTP ${verifyRes.status}`);
    fixtureId = null;
  } finally {
    // Cleanup only this run's fixture if a prior assertion failed. Never run a broad delete.
    if (fixtureId) {
      await fetch(`${supabase}/rest/v1/recovery_stories?id=eq.${encodeURIComponent(fixtureId)}`, { method: 'DELETE', headers }).catch(() => {});
    }
  }
  console.log('Staging smoke suite passed. No production project was contacted by this script.');
}
main().catch(error => { console.error(`STAGING SMOKE FAILED: ${error.message}`); process.exitCode = 1; });
