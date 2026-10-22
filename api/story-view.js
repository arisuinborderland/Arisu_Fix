'use strict';
const { sb, json } = require('../lib/stories');
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); json(res, 405, { error: 'Method not allowed' }); return; }
  try {
    const body = req.body || {};
    const id = String(body.id || '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) { json(res, 400, { error: 'A valid Story ID is required.' }); return; }
    // The database function only counts currently active, unexpired stories.
    await sb('/rest/v1/rpc/increment_recovery_story_view', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p_story_id: id })
    });
    json(res, 200, { ok: true });
  } catch (error) {
    console.error('Story view tracking error:', error.message);
    // Analytics must never block the public Story Viewer.
    json(res, 503, { error: 'View tracking temporarily unavailable.' });
  }
};
