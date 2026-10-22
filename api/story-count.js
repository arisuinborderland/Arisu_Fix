'use strict';
const { SUPABASE_URL, json } = require('../lib/stories');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    json(res, 405, { error: 'Method not allowed' });
    return;
  }
  try {
    if (!SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) throw new Error('Story backend is not configured.');
    const cutoff = encodeURIComponent(new Date().toISOString());
    const url = `${SUPABASE_URL}/rest/v1/recovery_stories?select=id&admin_status=eq.active&is_active=eq.true&expires_at=gt.${cutoff}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: process.env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        Prefer: 'count=exact',
        Range: '0-0'
      }
    });
    if (!response.ok) {
      const error = new Error(`Stories count query failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    const contentRange = response.headers.get('content-range') || '';
    const total = contentRange.match(/\/(\d+)$/);
    if (!total) throw new Error('Stories count response did not include a valid Content-Range.');
    json(res, 200, { count: Number(total[1]) });
  } catch (error) {
    console.error('Stories count API error:', error.message);
    json(res, 503, { error: 'Stories count is temporarily unavailable.' });
  }
};
