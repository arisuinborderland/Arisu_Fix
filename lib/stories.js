'use strict';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
function config() { if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Story backend is not configured.'); }
async function sb(path, options = {}) {
  config();
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers: { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}`, ...(options.headers || {}) } });
  const body = await response.text();
  let data = null; try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!response.ok) { const e = new Error(data?.message || data?.msg || `Supabase request failed (${response.status})`); e.status = response.status; throw e; }
  return data;
}
function json(res, status, payload) { res.statusCode = status; res.setHeader('Content-Type','application/json; charset=utf-8'); res.setHeader('Cache-Control','no-store'); res.end(JSON.stringify(payload)); }
function method(req, res, expected) { if (req.method !== expected) { res.setHeader('Allow', expected); json(res, 405, { error: 'Method not allowed' }); return false; } return true; }
async function admin(req) {
  const match = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY || '', Authorization: `Bearer ${match[1]}` } });
  if (!r.ok) return false;
  const user = await r.json();
  const allowedId = process.env.STORY_ADMIN_USER_ID || '';
  const allowedEmail = (process.env.STORY_ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(user?.id && ((allowedId && user.id === allowedId) || (allowedEmail && String(user.email || '').toLowerCase() === allowedEmail)));
}
const proofs = [
  { path: 'proofs/6707.jpg', title: 'Suspended Account — 180 Days' },
  { path: 'proofs/disabled-account-integrity.jpg', title: 'Disabled Account' },
  { path: 'proofs/two-factor-authentication-01.jpg', title: 'Two Factor Authentication (2FA) — Example 1' },
  { path: 'proofs/two-factor-authentication-02.jpg', title: 'Two Factor Authentication (2FA) — Example 2' }
];
module.exports = { SUPABASE_URL, sb, json, method, admin, proofs };
