'use strict';
const { SUPABASE_URL, json } = require('../lib/stories');

module.exports = async function handler(req, res) {
  const startedAt = Date.now();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Cache-Control', 'no-store');
    json(res, 405, { error: 'Method not allowed' });
    return;
  }
  try {
    if (!SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) throw new Error('Story backend is not configured.');
    const cutoff = encodeURIComponent(new Date().toISOString());
    const url = `${SUPABASE_URL}/rest/v1/recovery_stories?select=id&admin_status=eq.active&is_active=eq.true&expires_at=gt.${cutoff}`;
    const queryStartedAt = Date.now();
    // HEAD with count=exact asks PostgREST for the matching row count without
    // transferring Story rows or invoking signed-image URL generation.
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        Prefer: 'count=exact',
        Range: '0-0'
      }
    });
    const queryDuration = Math.max(0, Date.now() - queryStartedAt);
    if (!response.ok) {
      const error = new Error(`Stories count query failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    const contentRange = response.headers?.get?.('content-range') || '';
    const total = contentRange.match(/\/(\d+)$/);
    if (!total) throw new Error('Stories count response did not include a valid Content-Range.');
    const totalDuration = Math.max(0, Date.now() - startedAt);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Server-Timing', `supabase_count;dur=${queryDuration}, total;dur=${totalDuration}`);
    res.setHeader('X-Story-Count-Source', 'supabase-exact-count');
    json(res, 200, { count: Number(total[1]) });
  } catch (error) {
    const totalDuration = Math.max(0, Date.now() - startedAt);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Server-Timing', `total;dur=${totalDuration}`);
    console.error('Stories count API error:', error.message);
    json(res, 503, { error: 'Stories count is temporarily unavailable.' });
  }
};
