'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const loginPanel = $('loginPanel'), editorPanel = $('editorPanel'), status = $('status');
  // Avoid briefly showing the sign-in form while a saved session is being restored.
  loginPanel.hidden = true;
  editorPanel.hidden = true;
  let accessToken = '', refreshToken = '', idleTimer = 0, lastActivityAt = 0, restoring = false;
  const IDLE_LIMIT_MS = 60 * 60 * 1000;
  const SESSION_KEY = 'arisu_story_admin_refresh_token';
  const ACTIVITY_KEY = 'arisu_story_admin_last_activity';
  const supabaseUrl = 'https://glivqrmyqwtbmlffghjo.supabase.co';
  function say(message, isError = false) { status.textContent = message; status.style.color = isError ? '#b42335' : '#3454c9'; }
  function clearSavedSession() {
    try { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(ACTIVITY_KEY); } catch (_) {}
    accessToken = ''; refreshToken = ''; lastActivityAt = 0;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = 0;
  }
  function showSignedOut(message = 'Please sign in to continue.') {
    clearSavedSession();
    editorPanel.hidden = true; loginPanel.hidden = false;
    say(message);
  }
  function saveActivity() {
    lastActivityAt = Date.now();
    try { localStorage.setItem(ACTIVITY_KEY, String(lastActivityAt)); } catch (_) {}
    scheduleIdleLogout();
  }
  function scheduleIdleLogout() {
    if (idleTimer) clearTimeout(idleTimer);
    if (!accessToken) return;
    const elapsed = Date.now() - (lastActivityAt || Date.now());
    const remaining = IDLE_LIMIT_MS - elapsed;
    if (remaining <= 0) { showSignedOut('Signed out after 1 hour of inactivity. Please sign in again.'); return; }
    idleTimer = setTimeout(() => showSignedOut('Signed out after 1 hour of inactivity. Please sign in again.'), remaining);
  }
  const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  activityEvents.forEach(name => window.addEventListener(name, () => { if (accessToken) saveActivity(); }, { passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && accessToken) {
      if (Date.now() - (lastActivityAt || 0) >= IDLE_LIMIT_MS) showSignedOut('Signed out after 1 hour of inactivity. Please sign in again.');
      else scheduleIdleLogout();
    }
  });
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
      try { localStorage.setItem(SESSION_KEY, refreshToken); } catch (_) {}
      saveActivity();
      $('password').value = ''; loginPanel.hidden = true; editorPanel.hidden = false; say('Signed in.'); await loadStories();
    } catch (e) { say(e.message, true); } finally { button.disabled = false; }
  }
  async function refreshAccessToken() {
    if (!refreshToken) throw new Error('Your admin session expired. Please sign in again.');
    const data = await auth('token?grant_type=refresh_token', { refresh_token: refreshToken });
    accessToken = data.access_token || '';
    refreshToken = data.refresh_token || refreshToken;
    try { localStorage.setItem(SESSION_KEY, refreshToken); } catch (_) {}
    return accessToken;
  }
  async function api(url, options = {}) {
    const send = () => fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
    let response = await send();
    if (response.status === 401 && refreshToken) {
      try { await refreshAccessToken(); response = await send(); }
      catch (_) { showSignedOut('Your admin session expired. Please sign in again.'); throw new Error('Your admin session expired. Please sign in again.'); }
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.'); return data;
  }
  async function restoreSession() {
    if (restoring) return;
    restoring = true;
    try {
      const savedToken = localStorage.getItem(SESSION_KEY) || '';
      const savedActivity = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
      if (!savedToken) { loginPanel.hidden = false; editorPanel.hidden = true; return; }
      if (!savedActivity || Date.now() - savedActivity >= IDLE_LIMIT_MS) {
        clearSavedSession();
        loginPanel.hidden = false; editorPanel.hidden = true;
        say('Session expired after 1 hour of inactivity. Please sign in again.');
        return;
      }
      const response = await fetch('/api/story-config', { cache: 'no-store' });
      if (!response.ok) throw new Error('Story backend is not configured yet.');
      const config = await response.json();
      if (!config.publishableKey) throw new Error('Story login is not configured yet.');
      window.SUPABASE_PUBLISHABLE_KEY = config.publishableKey;
      refreshToken = savedToken;
      await refreshAccessToken();
      lastActivityAt = savedActivity;
      loginPanel.hidden = true; editorPanel.hidden = false;
      scheduleIdleLogout();
      await loadStories();
      say('Session restored.');
    } catch (error) {
      // Do not erase a valid saved refresh token because of a temporary network/config failure.
      // Only clear it when Supabase explicitly rejects the refresh token.
      const message = String(error && error.message || '');
      const invalidRefreshToken = /invalid refresh token|refresh token not found|already used|invalid_grant|refresh_token.*(expired|invalid)/i.test(message);
      if (invalidRefreshToken) clearSavedSession();
      loginPanel.hidden = false; editorPanel.hidden = true;
      say(invalidRefreshToken
        ? 'Your saved admin session has expired. Please sign in again.'
        : 'Could not restore your session right now. Your saved session was kept; check your connection and refresh this page.', true);
    } finally { restoring = false; }
  }
  async function loadStories() {
    const list = $('storyList'); list.textContent = 'Loading Stories…';
    try {
      const data = await api('/api/stories?admin=1');
      let views = {}; let countsAvailable = true;
      try { const countData = await api('/api/story-views-admin'); views = countData.views || {}; } catch { countsAvailable = false; }
      list.replaceChildren();
      if (!countsAvailable) { const warning = document.createElement('p'); warning.className = 'muted'; warning.textContent = 'View counts need the Supabase database migration in supabase/recovery-story-views.sql.'; list.append(warning); }
      const filter = $('storyFilter')?.value || 'active';
      const now = Date.now();
      let stories = (data.stories || []).filter(story => {
        const state = story.adminStatus || 'active';
        if (filter === 'expired') return state === 'active' && new Date(story.expiresAt || story.expires_at).getTime() <= now;
        return state === filter && (filter !== 'active' || new Date(story.expiresAt || story.expires_at).getTime() > now);
      });
      if (!stories.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = filter === 'draft' ? 'No saved drafts yet.' : filter === 'archived' ? 'No archived Stories.' : filter === 'expired' ? 'No expired Stories.' : 'No active Stories.'; list.append(p); return; }
      stories.forEach((story, storyIndex) => {
        const state = story.adminStatus || 'active';
        const expired = state === 'active' && new Date(story.expiresAt || story.expires_at).getTime() <= now;
        const displayState = expired ? 'expired' : state;
        const row = document.createElement('div'); row.className = 'story-row';
        if (filter === 'active' && !expired) { row.draggable = true; row.dataset.storyId = story.id; }
        const info = document.createElement('div'); info.className = 'story-info';
        const title = document.createElement('strong'); title.textContent = story.caption || 'Recovery Story';
        const meta = document.createElement('small'); meta.textContent = state === 'draft' ? 'Saved as draft · not visible to visitors' : state === 'archived' ? 'Archived · not visible to visitors' : expired ? 'Expired · not visible to visitors' : 'Expires ' + new Date(story.expiresAt || story.expires_at).toLocaleString();
        const statusBadge = document.createElement('span'); statusBadge.className = 'story-status'; statusBadge.dataset.status = displayState; statusBadge.textContent = displayState.charAt(0).toUpperCase() + displayState.slice(1);
        info.append(title, meta, statusBadge);
        const viewCount = document.createElement('span'); viewCount.className = 'story-view-count';
        const eye = document.createElement('span'); eye.className = 'story-view-eye'; eye.setAttribute('aria-hidden', 'true'); eye.textContent = '◉';
        const count = document.createElement('strong'); count.className = 'story-view-number'; count.textContent = countsAvailable ? (Number(views[story.id]) || 0).toLocaleString() : '—';
        const label = document.createElement('small'); label.className = 'story-view-label'; label.textContent = 'Views';
        viewCount.append(eye, count, label);
        const actions = document.createElement('div'); actions.className = 'story-actions';
        const actionButton = (text, className, handler) => { const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.className = className || 'secondary-action'; button.addEventListener('click', handler); return button; };
        if (state !== 'active' || expired) actions.append(actionButton('Publish', 'secondary-action', async () => { await updateStory(story.id, { status: 'active' }, 'Story published for 24 hours.'); }));
        if (state !== 'draft') actions.append(actionButton('Archive', 'secondary-action', async () => { if (confirm('Archive this Story? It will no longer appear to visitors.')) await updateStory(story.id, { status: 'archived' }, 'Story archived.'); }));
        if (state === 'archived') actions.append(actionButton('Restore as draft', 'secondary-action', async () => { await updateStory(story.id, { status: 'draft' }, 'Story restored to drafts.'); }));
        actions.append(viewCount, actionButton('Delete', 'danger-action', async () => {
          if (!confirm('Permanently delete this temporary Story image? The permanent Recovery Proofs remain unchanged.')) return;
          try { await api('/api/stories?id=' + encodeURIComponent(story.id), { method: 'DELETE' }); await loadStories(); say('Story deleted.'); } catch(e) { say(e.message, true); }
        }));
        row.append(info, actions); list.append(row);
        if (row.draggable) {
          row.addEventListener('dragstart', event => { row.classList.add('is-dragging'); event.dataTransfer.setData('text/plain', story.id); event.dataTransfer.effectAllowed = 'move'; });
          row.addEventListener('dragend', () => { row.classList.remove('is-dragging'); list.querySelectorAll('.is-drop-target').forEach(el => el.classList.remove('is-drop-target')); });
          row.addEventListener('dragover', event => { event.preventDefault(); row.classList.add('is-drop-target'); });
          row.addEventListener('dragleave', () => row.classList.remove('is-drop-target'));
          row.addEventListener('drop', async event => {
            event.preventDefault(); row.classList.remove('is-drop-target');
            const draggedId = event.dataTransfer.getData('text/plain');
            if (!draggedId || draggedId === story.id) return;
            const current = Array.from(list.querySelectorAll('.story-row[draggable=true]'));
            const draggedRow = current.find(el => el.dataset.storyId === draggedId);
            if (!draggedRow) return;
            list.insertBefore(draggedRow, row);
            const ordered = Array.from(list.querySelectorAll('.story-row[draggable=true]'));
            try {
              for (let i = 0; i < ordered.length; i++) await api('/api/stories', { method: 'PATCH', body: JSON.stringify({ id: ordered[i].dataset.storyId, sortOrder: i }) });
              say('Story order saved.');
            } catch(e) { say('Could not save the new order: ' + e.message, true); await loadStories(); }
          });
        }
      });
    } catch(e) { list.textContent = e.message; }
  }
  async function updateStory(id, changes, successMessage) {
    try { await api('/api/stories', { method: 'PATCH', body: JSON.stringify({ id, ...changes }) }); await loadStories(); say(successMessage); }
    catch (e) { say(e.message, true); }
  }

  const uploadTab = $('uploadTab'), activeTab = $('activeTab');
  const uploadSection = $('uploadSection'), activeSection = $('activeSection');
  function showAdminTab(tab) {
    const showUpload = tab === 'upload';
    uploadSection.hidden = !showUpload;
    activeSection.hidden = showUpload;
    uploadTab.classList.toggle('is-active', showUpload);
    activeTab.classList.toggle('is-active', !showUpload);
    uploadTab.setAttribute('aria-selected', String(showUpload));
    activeTab.setAttribute('aria-selected', String(!showUpload));
  }
  uploadTab.addEventListener('click', () => showAdminTab('upload'));
  activeTab.addEventListener('click', () => { showAdminTab('active'); loadStories(); });
  showAdminTab('upload');

  $('loginForm').addEventListener('submit', signIn);
  $('caption').addEventListener('input', () => $('captionCount').textContent = String($('caption').value.length));
  $('storyImage').addEventListener('change', () => {
    // Use data URLs instead of blob: URLs. The site's Content-Security-Policy
    // permits same-origin and Supabase images but does not permit blob: images.
    const preview = $('imagePreview'); preview.replaceChildren();
    const files = Array.from($('storyImage').files || []);
    if (!files.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'Image previews will appear here after you choose files.'; preview.append(p); return; }
    files.forEach(file => {
      const card = document.createElement('div'); card.className = 'image-preview-card';
      const img = document.createElement('img'); img.alt = 'Preview of ' + file.name;
      img.loading = 'lazy';
      img.addEventListener('error', () => { img.hidden = true; const error = document.createElement('small'); error.textContent = 'Preview unavailable'; card.insertBefore(error, name); });
      const name = document.createElement('small'); name.textContent = file.name + ' · ' + (file.size / 1024 / 1024).toFixed(2) + ' MB';
      card.append(img, name); preview.append(card);
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') img.src = reader.result; };
      reader.onerror = () => { img.hidden = true; name.textContent += ' · Preview unavailable'; };
      reader.readAsDataURL(file);
    });
  });
  $('saveAsDraft').addEventListener('change', () => { $('publishButton').textContent = $('saveAsDraft').checked ? 'Save as Draft' : 'Publish for 24 hours'; });
  $('storyFilter').addEventListener('change', loadStories);
  $('publishForm').addEventListener('submit', async event => {
    event.preventDefault(); const button = $('publishForm').querySelector('button[type="submit"]'); button.disabled = true; say('Preparing your Story images…');
    try {
      const files = Array.from($('storyImage').files || []);
      if (!files.length) throw new Error('Please choose one or more images from your Gallery.');
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      for (const file of files) {
        if (!allowed.includes(file.type)) throw new Error(file.name + ': use a JPEG, PNG, or WebP image.');
        if (file.size < 1 || file.size > 3.5 * 1024 * 1024) throw new Error(file.name + ': image must be no larger than 3.5 MB.');
      }
      let saved = 0; const draft = $('saveAsDraft').checked;
      for (const file of files) {
        say((draft ? 'Saving draft ' : 'Publishing Story ') + (saved + 1) + ' of ' + files.length + '…');
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(new Error('Could not read ' + file.name + '.')); reader.readAsDataURL(file); });
        await api('/api/stories', { method: 'POST', body: JSON.stringify({ imageData: dataUrl, mimeType: file.type, fileName: file.name, caption: $('caption').value, saveAsDraft: draft }) });
        saved++;
      }
      $('caption').value = ''; $('captionCount').textContent = '0'; $('storyImage').value = ''; $('saveAsDraft').checked = false; $('publishButton').textContent = 'Publish for 24 hours';
      previewUrls.forEach(url => URL.revokeObjectURL(url)); previewUrls.length = 0; $('imagePreview').replaceChildren();
      $('storyFilter').value = draft ? 'draft' : 'active';
      say(saved + (saved === 1 ? ' Story ' : ' Stories ') + (draft ? 'saved as draft.' : 'published for 24 hours.')); await loadStories();
      showAdminTab('active');
    } catch(e) { say(e.message, true); } finally { button.disabled = false; }
  });
  $('refreshStories').addEventListener('click', loadStories);
  $('signOut').addEventListener('click', () => showSignedOut('Signed out.'));
  restoreSession();
})();
