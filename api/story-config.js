'use strict';
module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); res.statusCode = 405; res.end(JSON.stringify({ error: 'Method not allowed' })); return; }
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
  const ready = Boolean(process.env.SUPABASE_URL && publishableKey && process.env.SUPABASE_SECRET_KEY && (process.env.STORY_ADMIN_EMAIL || process.env.STORY_ADMIN_USER_ID));
  res.statusCode = ready ? 200 : 503;
  res.end(JSON.stringify(ready ? { publishableKey } : { error: 'Story backend is not configured yet.' }));
};
