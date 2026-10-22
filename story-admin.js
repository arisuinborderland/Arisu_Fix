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
      const data = await api('/api/stories');
      let views = {};
      let countsAvailable = true;
      try { const countData = await api('/api/story-views-admin'); views = countData.views || {}; }
      catch { countsAvailable = false; }
      list.replaceChildren();
      if (!countsAvailable) { const warning = document.createElement('p'); warning.className = 'muted'; warning.textContent = 'View counts need the Supabase database migration in supabase/recovery-story-views.sql.'; list.append(warning); }
      if (!data.stories?.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'No active Stories.'; list.append(p); return; }
      data.stories.forEach(story => {
        const row = document.createElement('div'); row.className = 'story-row';
        const info = document.createElement('div'); info.className = 'story-info';
        const title = document.createElement('strong'); title.textContent = story.caption || 'Recovery Story';
        const meta = document.createElement('small'); meta.textContent = `Expires ${new Date(story.expires_at).toLocaleString()}`;
        const viewCount = document.createElement('span'); viewCount.className = 'story-view-count';
        const eye = document.createElement('span'); eye.className = 'story-view-eye'; eye.setAttribute('aria-hidden', 'true'); eye.textContent = '◉';
        const count = document.createElement('strong'); count.className = 'story-view-number'; count.textContent = countsAvailable ? (Number(views[story.id]) || 0).toLocaleString() : '—';
        const label = document.createElement('small'); label.className = 'story-view-label'; label.textContent = 'Views';
        viewCount.append(eye, count, label); info.append(title, meta);
        const actions = document.createElement('div'); actions.className = 'story-actions'; actions.append(viewCount);
        const del = document.createElement('button'); del.type = 'button'; del.textContent = 'Delete'; del.addEventListener('click', async () => { if (!confirm('Delete this temporary Story? The permanent proof will remain.')) return; del.disabled = true; try { await api(`/api/stories?id=${encodeURIComponent(story.id)}`, { method: 'DELETE' }); await loadStories(); say('Story deleted.'); } catch(e) { say(e.message, true); del.disabled = false; } });
        actions.append(del); row.append(info, actions); list.append(row);
      });
    } catch(e) { list.textContent = e.message; }
  }
  $('loginForm').addEventListener('submit', signIn);
  $('caption').addEventListener('input', () => $('captionCount').textContent = String($('caption').value.length));
  $('publishForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('publishForm').querySelector('button[type="submit"]'); button.disabled = true; say('Uploading your Story image…');
    try {
      const files = Array.from($('storyImage').files || []);
      if (!files.length) throw new Error('Please choose one or more images from your Gallery.');
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      for (const file of files) {
        if (!allowed.includes(file.type)) throw new Error(`${file.name}: use a JPEG, PNG, or WebP image.`);
        if (file.size < 1 || file.size > 3.5 * 1024 * 1024) throw new Error(`${file.name}: image must be no larger than 3.5 MB.`);
      }
      let published = 0;
      for (const file of files) {
        say(`Uploading Story ${published + 1} of ${files.length}…`);
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(new Error(`Could not read ${file.name}.`)); reader.readAsDataURL(file); });
        await api('/api/stories', { method: 'POST', body: JSON.stringify({ imageData: dataUrl, mimeType: file.type, fileName: file.name, caption: $('caption').value }) });
        published++;
      }
      $('caption').value = ''; $('captionCount').textContent = '0'; $('storyImage').value = ''; say(`${published} ${published === 1 ? 'Story' : 'Stories'} published. Use Next to view each image; the progress bar advances automatically. Stories expire after 24 hours.`); await loadStories();
    }
    catch(e) { say(e.message, true); } finally { button.disabled = false; }
  });
  $('refreshStories').addEventListener('click', loadStories);
  $('signOut').addEventListener('click', () => { accessToken = ''; refreshToken = ''; editorPanel.hidden = true; loginPanel.hidden = false; say('Signed out.'); });
})();
