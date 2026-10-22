'use strict';
const { sb, json, admin } = require('../lib/stories');
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); json(res, 405, { error: 'Method not allowed' }); return; }
  try {
    if (!(await admin(req))) { json(res, 401, { error: 'Admin authentication required.' }); return; }
    const rows = await sb('/rest/v1/recovery_story_view_counts?select=story_id,views');
    const views = {};
    for (const row of rows || []) views[row.story_id] = Number(row.views) || 0;
    json(res, 200, { views });
  } catch (error) {
    console.error('Admin story views error:', error.message);
    json(res, error.status || 503, { error: 'Story view counts are temporarily unavailable. Check that the database migration has been applied.' });
  }
};
