'use strict';
const { SUPABASE_URL, sb, json, method, admin, proofs } = require('../lib/stories');
module.exports = async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const cutoff = encodeURIComponent(new Date().toISOString());
      const rows = await sb(`/rest/v1/recovery_stories?select=id,caption,storage_path,published_at,expires_at&is_active=eq.true&expires_at=gt.${cutoff}&order=published_at.desc`);
      const stories = await Promise.all((rows || []).map(async row => {
        const signed = await sb(`/storage/v1/object/sign/recovery-stories/${row.storage_path.split('/').map(encodeURIComponent).join('/')}?` , { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 300 }) }).catch(async () => null);
        const signedUrl = signed?.signedURL || signed?.signedUrl || '';
        return signedUrl ? { id: row.id, caption: row.caption, publishedAt: row.published_at, expiresAt: row.expires_at, expires_at: row.expires_at, imageUrl: signedUrl.startsWith('http') ? signedUrl : `${SUPABASE_URL}/storage/v1${signedUrl.startsWith('/') ? '' : '/'}${signedUrl}` } : null;
      }));
      json(res, 200, { stories: stories.filter(Boolean) }); return;
    }
    if (req.method !== 'POST' && req.method !== 'DELETE') { res.setHeader('Allow', 'GET, POST, DELETE'); json(res, 405, { error: 'Method not allowed' }); return; }
    if (!(await admin(req))) { json(res, 401, { error: 'Admin authentication required.' }); return; }
    if (req.method === 'POST') {
      const body = req.body || {};
      const proofPath = String(body.proofPath || '');
      const proof = proofs.find(item => item.path === proofPath);
      const caption = String(body.caption || '').trim();
      if (!proof) { json(res, 400, { error: 'Choose an existing Recovery Proof.' }); return; }
      if (caption.length > 180) { json(res, 400, { error: 'Caption must be 180 characters or fewer.' }); return; }
      const siteUrl = (process.env.STORY_SOURCE_URL || 'https://arisufix.vercel.app').replace(/\/$/, '');
      const imageResponse = await fetch(`${siteUrl}/${proof.path}`);
      if (!imageResponse.ok) { json(res, 502, { error: 'Could not read the selected permanent proof image.' }); return; }
      const mime = imageResponse.headers.get('content-type') || '';
      if (!/^image\/(jpeg|png|webp)$/i.test(mime)) { json(res, 415, { error: 'Selected source is not an allowed image type.' }); return; }
      const bytes = Buffer.from(await imageResponse.arrayBuffer());
      if (!bytes.length || bytes.length > 5 * 1024 * 1024) { json(res, 413, { error: 'Story image must be no larger than 5 MB.' }); return; }
      const ext = mime.toLowerCase().includes('png') ? 'png' : mime.toLowerCase().includes('webp') ? 'webp' : 'jpg';
      const storagePath = `stories/${crypto.randomUUID()}.${ext}`;
      await sb(`/storage/v1/object/recovery-stories/${storagePath}`, { method: 'POST', headers: { 'Content-Type': mime, 'x-upsert': 'false' }, body: bytes });
      try {
        const inserted = await sb('/rest/v1/recovery_stories?select=id,caption,published_at,expires_at,storage_path', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify({ caption, storage_path: storagePath, published_at: new Date().toISOString(), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), is_active: true }) });
        json(res, 201, { story: inserted[0] });
      } catch (e) {
        await sb(`/storage/v1/object/recovery-stories/${storagePath}`, { method: 'DELETE' }).catch(() => {}); throw e;
      }
      return;
    }
    const id = String((req.query && req.query.id) || (req.body && req.body.id) || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) { json(res, 400, { error: 'A valid Story ID is required.' }); return; }
    const rows = await sb(`/rest/v1/recovery_stories?select=id,storage_path&id=eq.${encodeURIComponent(id)}&limit=1`);
    if (!rows?.length) { json(res, 404, { error: 'Story not found.' }); return; }
    const path = rows[0].storage_path;
    if (!path.startsWith('stories/')) { json(res, 400, { error: 'Refusing to delete a non-Story object.' }); return; }
    await sb(`/storage/v1/object/recovery-stories/${path.split('/').map(encodeURIComponent).join('/')}`, { method: 'DELETE' });
    await sb(`/rest/v1/recovery_stories?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    json(res, 200, { ok: true });
  } catch (error) {
    console.error('Stories API error:', error.message);
    json(res, error.status || 503, { error: 'Stories service is temporarily unavailable.' });
  }
};
