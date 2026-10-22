'use strict';
const { sb, json, method, deleteStorageObjectIfPresent } = require('../lib/stories');
module.exports = async function handler(req, res) {
  if (!method(req, res, 'GET')) return;
  const expected = process.env.CRON_SECRET || process.env.STORY_CLEANUP_SECRET || '';
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!expected || supplied.length !== expected.length || !require('node:crypto').timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) { json(res, 401, { error: 'Unauthorized' }); return; }
  try {
    const cutoff = encodeURIComponent(new Date().toISOString());
    const rows = await sb(`/rest/v1/recovery_stories?select=id,storage_path&expires_at=lte.${cutoff}`);
    let deleted = 0;
    for (const row of rows || []) {
      if (!String(row.storage_path || '').startsWith('stories/')) continue;
      const storagePath = `/storage/v1/object/recovery-stories/${row.storage_path.split('/').map(encodeURIComponent).join('/')}`;
      // A missing object is already in the desired storage state; continue to remove the DB row.
      // Transient/auth/storage errors still abort so the next cron run can safely retry.
      await deleteStorageObjectIfPresent(storagePath);
      await sb(`/rest/v1/recovery_stories?id=eq.${encodeURIComponent(row.id)}`, { method: 'DELETE' });
      deleted++;
    }
    json(res, 200, { ok: true, deleted });
  } catch (error) { console.error('Story cleanup error:', error.message); json(res, 503, { error: 'Cleanup failed; retry on next run.' }); }
};
