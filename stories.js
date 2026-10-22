'use strict';
const { SUPABASE_URL, sb, json, method, admin } = require('../lib/stories');
const crypto = require('node:crypto');
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
      const caption = String(body.caption || '').trim();
      if (caption.length > 180) { json(res, 400, { error: 'Caption must be 180 characters or fewer.' }); return; }
      const mime = String(body.mimeType || '').toLowerCase();
      const match = String(body.imageData || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match || match[1].toLowerCase() !== mime) { json(res, 400, { error: 'Choose a valid JPEG, PNG, or WebP image.' }); return; }
      const bytes = Buffer.from(match[2], 'base64');
      if (!bytes.length || bytes.length > 3.5 * 1024 * 1024) { json(res, 413, { error: 'Story image must be no larger than 3.5 MB.' }); return; }
      // Check file signatures as well as the declared MIME type.
      const valid = mime === 'image/jpeg' ? bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
        : mime === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
        : mime === 'image/webp' ? bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' : false;
      if (!valid) { json(res, 415, { error: 'The uploaded file does not match its image type.' }); return; }
      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
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
