'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const loginPanel = $('loginPanel'), editorPanel = $('editorPanel'), status = $('status');
  let accessToken = '', refreshToken = '';
  const supabaseUrl = 'https://glivqrmyqwtbmlffghjo.supabase.co';
  function say(message, isError = false) { status.textContent = message; status.style.color = isError ? '#b42335' : '#3454c9'; }
  async function auth(path, payload) {
    const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: window.SUPABASE_PUBLISHABLE_KEY || '' }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.msg || data.message || data.error_description || 'Sign-in failed.');
    return data;
  }
  // Public key is intentionally injected by a deployment-time public config endpoint; without it, login stays unavailable.
  async function signIn(event) {
    event.preventDefault();
    const button = $('loginForm').querySelector('button'); button.disabled = true; say('Signing in…');
    try {
      const response = await fetch('/api/story-config', { cache: 'no-store' });
      if (!response.ok) throw new Error('Story backend is not configured yet.');
      const config = await response.json();
      if (!config.publishableKey) throw new Error('Story login is not configured yet.');
      window.SUPABASE_PUBLISHABLE_KEY = config.publishableKey;
      const data = await auth('token?grant_type=password', { email: $('email').value.trim(), password: $('password').value });
      accessToken = data.access_token; refreshToken = data.refresh_token || '';
      $('password').value = ''; loginPanel.hidden = true; editorPanel.hidden = false; say('Signed in.'); await loadStories();
    } catch (e) { say(e.message, true); } finally { button.disabled = false; }
  }
  async function api(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.'); return data;
  }
  async function loadStories() {
    const list = $('storyList'); list.textContent = 'Loading Stories…';
    try {
      const data = await api('/api/stories'); list.replaceChildren();
      if (!data.stories?.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'No active Stories.'; list.append(p); return; }
      data.stories.forEach(story => {
        const row = document.createElement('div'); row.className = 'story-row';
        const info = document.createElement('div'); const title = document.createElement('strong'); title.textContent = story.caption || 'Recovery Story';
        const meta = document.createElement('small'); meta.textContent = `Expires ${new Date(story.expires_at).toLocaleString()}`; info.append(title, meta);
        const del = document.createElement('button'); del.type = 'button'; del.textContent = 'Delete'; del.addEventListener('click', async () => { if (!confirm('Delete this temporary Story? The permanent proof will remain.')) return; del.disabled = true; try { await api(`/api/stories?id=${encodeURIComponent(story.id)}`, { method: 'DELETE' }); await loadStories(); say('Story deleted.'); } catch(e) { say(e.message, true); del.disabled = false; } }); row.append(info, del); list.append(row);
      });
    } catch(e) { list.textContent = e.message; }
  }
  $('loginForm').addEventListener('submit', signIn);
  $('caption').addEventListener('input', () => $('captionCount').textContent = String($('caption').value.length));
  $('publishForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('publishForm').querySelector('button[type="submit"]'); button.disabled = true; say('Publishing temporary copy…');
    try { await api('/api/stories', { method: 'POST', body: JSON.stringify({ proofPath: $('proofPath').value, caption: $('caption').value }) }); $('caption').value = ''; $('captionCount').textContent = '0'; $('proofPath').value = ''; say('Story published. It will expire after 24 hours.'); await loadStories(); }
    catch(e) { say(e.message, true); } finally { button.disabled = false; }
  });
  $('refreshStories').addEventListener('click', loadStories);
  $('signOut').addEventListener('click', () => { accessToken = ''; refreshToken = ''; editorPanel.hidden = true; loginPanel.hidden = false; say('Signed out.'); });
})();
