'use strict';
(() => {
  const viewer = document.getElementById('recoveryStoryViewer');
  if (!viewer) return;
  const image = viewer.querySelector('.story-viewer-image');
  image.addEventListener('load', () => {
    const ratio = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : 1;
    viewer.classList.toggle('story-viewer-landscape', ratio > 1.15);
    viewer.classList.toggle('story-viewer-portrait', ratio < 0.87);
    viewer.classList.toggle('story-viewer-square', ratio >= 0.87 && ratio <= 1.15);
  });
  image.addEventListener('error', () => viewer.classList.remove('story-viewer-landscape', 'story-viewer-portrait', 'story-viewer-square'));
  const caption = viewer.querySelector('.story-viewer-caption');
  const progressTrack = viewer.querySelector('.story-viewer-progress-track');
  let progressFills = [];
  const close = viewer.querySelector('.story-viewer-close');
  const mobileStoriesButton = document.getElementById('mobileNavStories');
  const mobileStoriesCount = mobileStoriesButton?.querySelector('.mobile-nav-story-count');
  const timestamp = viewer.querySelector('.story-viewer-time');
  const emptyState = viewer.querySelector('.story-viewer-empty');
  const emptyDone = viewer.querySelector('.story-viewer-empty-done');
  const emptyTitle = emptyState?.querySelector('h2');
  const emptyMessage = emptyState?.querySelector('p');
  const defaultEmptyTitleMarkup = emptyTitle?.innerHTML || '';
  const defaultEmptyMessageText = emptyMessage?.textContent || '';
  let stories = [], index = 0, timer = 0, started = 0, navigating = false, countLoaded = false, countHasUsableValue = false, storyOpenRequestId = 0, activeStoryId = '';
  const STORY_COUNT_CACHE_KEY = 'arisuFixStoriesCount.v1';
  const STORY_COUNT_CACHE_TTL_MS = 10 * 60 * 1000;
  const STORY_VIEW_SESSION_KEY = 'arisuFixStoryViewSession.v1';
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const DURATION = 7000;
  const preloadedImages = new Map();

  function createUuid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function loadStoryViewSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORY_VIEW_SESSION_KEY) || 'null');
      if (saved && UUID_RE.test(String(saved.sessionId || '')) && Array.isArray(saved.viewedStoryIds)) {
        return {
          sessionId: saved.sessionId,
          viewedStoryIds: new Set(saved.viewedStoryIds.map(String).filter(id => UUID_RE.test(id)))
        };
      }
    } catch { /* Storage can be unavailable in restricted browser contexts. */ }
    return { sessionId: createUuid(), viewedStoryIds: new Set() };
  }

  const storyViewSession = loadStoryViewSession();
  const pendingStoryViews = new Set();

  function saveStoryViewSession() {
    try {
      sessionStorage.setItem(STORY_VIEW_SESSION_KEY, JSON.stringify({
        sessionId: storyViewSession.sessionId,
        viewedStoryIds: Array.from(storyViewSession.viewedStoryIds)
      }));
    } catch { /* Server-side deduplication remains authoritative when storage is unavailable. */ }
  }

  // Persist the session ID immediately, before the first network request settles.
  // Mobile browsers may background or reload the page before fetch's promise resolves.
  // Reusing this ID lets the database deduplicate that request after a reload.
  saveStoryViewSession();

  function recordStoryView(storyId) {
    const id = String(storyId || '');
    if (!UUID_RE.test(id) || !UUID_RE.test(storyViewSession.sessionId)) return;
    if (storyViewSession.viewedStoryIds.has(id) || pendingStoryViews.has(id)) return;
    pendingStoryViews.add(id);
    fetch('/api/story-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, sessionId: storyViewSession.sessionId }),
      keepalive: true
    }).then(response => {
      if (!response.ok) throw new Error('Story view tracking failed');
      storyViewSession.viewedStoryIds.add(id);
      saveStoryViewSession();
    }).catch(() => {
      // Do not block story playback; a later revisit can retry after transient failure.
    }).finally(() => pendingStoryViews.delete(id));
  }
  function hide() { storyOpenRequestId++; viewer.hidden = true; document.body.classList.remove('story-viewer-open'); clearTimeout(timer); navigating = false; viewer.classList.remove('story-viewer-switching'); viewer.classList.remove('story-viewer-empty-open'); if (emptyState) emptyState.hidden = true; image.hidden = false; caption.hidden = false; progressTrack.hidden = false; viewer.querySelector('.story-viewer-meta').hidden = false; progressFills.forEach(fill => { fill.style.transition = 'none'; }); }
  function showEmptyState(state = 'empty') {
    clearTimeout(timer);
    navigating = false;
    image.hidden = true;
    caption.hidden = true;
    progressTrack.hidden = true;
    viewer.querySelector('.story-viewer-meta').hidden = false;
    if (emptyState) emptyState.hidden = false;
    if (emptyTitle) {
      if (state === 'unavailable') emptyTitle.innerHTML = 'Stories Temporarily <span>Unavailable</span>';
      else emptyTitle.innerHTML = defaultEmptyTitleMarkup;
    }
    if (emptyMessage) {
      if (state === 'unavailable') emptyMessage.textContent = 'Could not connect to the Stories service. Please try again shortly.';
      else emptyMessage.textContent = defaultEmptyMessageText;
    }
    viewer.classList.add('story-viewer-empty-open');
    viewer.hidden = false;
    document.body.classList.add('story-viewer-open');
  }
  function preloadImage(url) {
    if (!url) return Promise.resolve(false);
    const cached = preloadedImages.get(url);
    if (cached) return cached;
    const promise = new Promise(resolve => {
      const preload = new Image();
      let settled = false;
      const finish = value => { if (!settled) { settled = true; resolve(value); } };
      preload.onload = async () => {
        try { if (typeof preload.decode === 'function') await preload.decode(); } catch { /* loaded image can still be displayed */ }
        finish(true);
      };
      preload.onerror = () => finish(false);
      preload.src = url;
      if (preload.complete) finish(preload.naturalWidth > 0);
    });
    preloadedImages.set(url, promise);
    return promise;
  }
  function warmNextImage(fromIndex = index) {
    if (stories.length < 2) return;
    const nextIndex = fromIndex + 1;
    if (nextIndex >= stories.length) return;
    preloadImage(stories[nextIndex].imageUrl);
  }
  function navigateBy(direction) {
    if (viewer.hidden || navigating || !stories.length) return;
    const targetIndex = index + direction;
    // Never wrap manual navigation: right advances forward, left moves backward.
    if (targetIndex < 0 || targetIndex >= stories.length) return;
    navigating = true;
    clearTimeout(timer);
    const targetUrl = stories[targetIndex].imageUrl;
    // The next image is warmed in the background while the current story is shown.
    // On a cold visit, wait only for the actual image readiness, not an artificial delay.
    preloadImage(targetUrl).then(() => {
      if (viewer.hidden) { navigating = false; return; }
      showAt(targetIndex);
      requestAnimationFrame(() => { viewer.classList.remove('story-viewer-switching'); navigating = false; });
    });
  }
  function timeAgo(value) { const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return ''; const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000)); if (seconds < 60) return 'Just now'; if (seconds < 3600) { const minutes = Math.floor(seconds / 60); return `${minutes} min${minutes === 1 ? '' : 's'} ago`; } if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; return `${Math.floor(seconds / 86400)}d ago`; }
  function renderProgressSegments() {
    progressTrack.replaceChildren();
    progressFills = stories.map((story, segmentIndex) => {
      const segment = document.createElement('span');
      segment.className = 'story-viewer-progress-segment';
      segment.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('span');
      fill.className = 'story-viewer-progress-fill';
      segment.appendChild(fill);
      progressTrack.appendChild(segment);
      return fill;
    });
  }
  function setProgress(percent, animate = false, duration = DURATION) {
    progressFills.forEach((fill, fillIndex) => {
      const segment = fill.parentElement;
      fill.style.transition = 'none';
      segment.classList.toggle('is-complete', fillIndex < index);
      if (fillIndex < index) fill.style.width = '100%';
      else if (fillIndex > index) fill.style.width = '0%';
      else {
        fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        if (animate) {
          // Force the starting width to apply before animating the active segment.
          void fill.offsetWidth;
          fill.style.transition = `width ${duration}ms linear`;
          fill.style.width = '100%';
        }
      }
    });
  }
  function showAt(next) {
    if (!stories.length) return hide();
    index = (next + stories.length) % stories.length;
    viewer.classList.remove('story-viewer-empty-open'); if (emptyState) emptyState.hidden = true; image.hidden = false; caption.hidden = false; progressTrack.hidden = false; viewer.querySelector('.story-viewer-meta').hidden = false;
    const story = stories[index];
    activeStoryId = String(story.id || '');
    image.src = story.imageUrl; warmNextImage(index); image.alt = 'Temporary Recovery Story'; caption.textContent = story.caption || '';
    // Count a story at most once per browser-tab session. The server's unique
    // (story_id, session_id) key is the final protection against duplicate requests.
    if (story.id) recordStoryView(story.id);
    timestamp.textContent = timeAgo(story.publishedAt || story.published_at);
    if (progressFills.length !== stories.length) renderProgressSegments();
    setProgress(0); viewer.hidden = false; document.body.classList.add('story-viewer-open'); started = Date.now();
    clearTimeout(timer); requestAnimationFrame(() => requestAnimationFrame(() => setProgress(0, true, DURATION)));
    timer = setTimeout(() => { if (index + 1 < stories.length) showAt(index + 1); else hide(); }, DURATION);
  }
  function setCountLoading(isLoading) {
    if (!mobileStoriesCount) return;
    mobileStoriesCount.dataset.loading = isLoading ? 'true' : 'false';
    mobileStoriesCount.setAttribute('aria-busy', String(isLoading));
    if (isLoading) mobileStoriesCount.setAttribute('aria-label', 'Loading Stories count');
  }
  function readCachedCount() {
    try {
      const cached = JSON.parse(localStorage.getItem(STORY_COUNT_CACHE_KEY) || 'null');
      const age = Date.now() - Number(cached?.savedAt);
      if (Number.isInteger(cached?.count) && cached.count >= 0 && Number.isFinite(age) && age >= 0 && age <= STORY_COUNT_CACHE_TTL_MS) {
        return cached.count;
      }
    } catch { /* Browser storage can be unavailable in restricted contexts. */ }
    return null;
  }
  function saveCachedCount(count) {
    try { localStorage.setItem(STORY_COUNT_CACHE_KEY, JSON.stringify({ count, savedAt: Date.now() })); }
    catch { /* The live API response remains authoritative if browser storage is unavailable. */ }
  }
  async function loadCount() {
    if (!mobileStoriesCount) return;
    const requestStarted = performance.now();
    const cachedCount = readCachedCount();
    if (cachedCount !== null) {
      // Paint the last known count before waiting on the network, then revalidate.
      mobileStoriesCount.textContent = String(cachedCount);
      countHasUsableValue = true;
      mobileStoriesCount.setAttribute('aria-label', `${cachedCount} available stories`);
      mobileStoriesCount.dataset.countCache = 'browser-storage';
      setCountLoading(false);
    } else {
      setCountLoading(true);
    }
    try {
      performance.mark('story-count-request-start');
      const response = await fetch('/api/story-count', { cache: 'no-store' });
      if (!response.ok) throw new Error('Stories count request failed');
      const data = await response.json();
      if (Number.isInteger(data.count) && data.count >= 0) {
        mobileStoriesCount.textContent = String(data.count);
        countLoaded = true;
        countHasUsableValue = true;
        saveCachedCount(data.count);
        mobileStoriesCount.setAttribute('aria-label', `${data.count} available stories`);
        setCountLoading(false);
        // Visible in browser Performance tools to distinguish browser/network
        // latency from the server-side Supabase timing in the Server-Timing header.
        performance.mark('story-count-request-end');
        performance.measure('story-count-request', 'story-count-request-start', 'story-count-request-end');
        mobileStoriesCount.dataset.countLoadMs = String(Math.round(performance.now() - requestStarted));
        mobileStoriesCount.dataset.countServerTiming = response.headers.get('Server-Timing') || '';
      } else {
        throw new Error('Stories count response was invalid');
      }
    } catch {
      mobileStoriesCount.dataset.countLoadMs = String(Math.round(performance.now() - requestStarted));
      setCountLoading(false);
      if (cachedCount === null && !countLoaded) mobileStoriesCount.setAttribute('aria-label', 'Stories count temporarily unavailable');
      // Keep a recent cached count when available. Otherwise, load() supplies a
      // fallback count if full Story data arrives first.
    }
  }
  async function load() {
    try {
      const response = await fetch('/api/stories', { cache: 'no-store' });
      if (!response.ok) throw new Error('Stories API request failed');
      const data = await response.json();
      stories = Array.isArray(data.stories) ? data.stories : [];
      // Fallback to the loaded public list if the lightweight count endpoint is unavailable.
      if (mobileStoriesCount && !countLoaded && !countHasUsableValue) {
        mobileStoriesCount.textContent = String(stories.length);
        countHasUsableValue = true;
        mobileStoriesCount.setAttribute('aria-label', `${stories.length} available stories`);
        setCountLoading(false);
      }
      // Refresh signed image URLs before opening the viewer, and warm the next image.
      stories.slice(0, 2).forEach(story => preloadImage(story.imageUrl));
      // Keep the Stories navigation item mounted even when the API temporarily
      // returns an empty list. The button must not disappear/reappear as requests resolve.
      if (!stories.length && mobileStoriesCount && !countHasUsableValue) {
        mobileStoriesCount.textContent = '0';
        mobileStoriesCount.setAttribute('aria-label', 'No active stories currently available');
        setCountLoading(false);
      }
      return true;
    } catch {
      // A transient Stories API failure must never hide the bottom-navigation button.
      if (mobileStoriesCount && !countHasUsableValue) {
        mobileStoriesCount.textContent = '•';
        mobileStoriesCount.setAttribute('aria-label', 'Stories temporarily unavailable');
        setCountLoading(false);
      }
      return false;
    }
  }
  // Basic anti-save deterrents only: these discourage casual context-menu saving
  // and dragging, but cannot prevent screenshots or browser/devtools extraction.
  image.draggable = false;
  image.setAttribute('draggable', 'false');
  image.addEventListener('contextmenu', event => event.preventDefault());
  image.addEventListener('dragstart', event => event.preventDefault());
  viewer.addEventListener('contextmenu', event => {
    if (event.target.closest('.story-viewer-image, .story-viewer-card')) event.preventDefault();
  });
  viewer.addEventListener('dragstart', event => {
    if (event.target.closest('.story-viewer-image, .story-viewer-card')) event.preventDefault();
  });
  mobileStoriesButton?.addEventListener('click', async () => {
    const requestId = ++storyOpenRequestId;

    // Use stories already fetched during page startup immediately. Refresh signed
    // image URLs in the background so the viewer never has to show a loading modal.
    if (stories.length) {
      showAt(0);
      load().then(refreshed => {
        if (!refreshed || requestId !== storyOpenRequestId || viewer.hidden || !activeStoryId) return;
        const freshIndex = stories.findIndex(story => String(story.id || '') === activeStoryId);
        if (freshIndex < 0) return;
        index = freshIndex;
        const story = stories[index];
        image.src = story.imageUrl;
        caption.textContent = story.caption || '';
        timestamp.textContent = timeAgo(story.publishedAt || story.published_at);
        renderProgressSegments();
        const elapsed = Math.min(DURATION, Math.max(0, Date.now() - started));
        const remaining = Math.max(0, DURATION - elapsed);
        setProgress(elapsed / DURATION * 100, remaining > 0, remaining || DURATION);
      });
      return;
    }

    // On a cold start, fetch silently and open directly as soon as data arrives.
    const refreshed = await load();
    if (requestId !== storyOpenRequestId) return;
    if (refreshed && stories.length) showAt(0);
    else showEmptyState(refreshed ? 'empty' : 'unavailable');
  });
  close.addEventListener('click', hide);
  emptyDone?.addEventListener('click', hide);
  // Instagram/Facebook-style navigation: tap the left or right half of the story image.
  viewer.addEventListener('click', event => {
    if (event.target === viewer) { hide(); return; }
    if (event.target === image) {
      const bounds = image.getBoundingClientRect();
      const midpoint = bounds.left + bounds.width / 2;
      navigateBy(event.clientX < midpoint ? -1 : 1);
    }
  });
  viewer.addEventListener('pointerdown', event => { if (event.target.closest('button')) return; clearTimeout(timer); const elapsed = Math.min(DURATION, Date.now() - started); setProgress(elapsed / DURATION * 100); });
  viewer.addEventListener('pointerup', event => { if (event.target.closest('button') || viewer.hidden) return; const elapsed = Math.min(DURATION, Date.now() - started); const remaining = Math.max(250, DURATION - elapsed); setProgress(elapsed / DURATION * 100, true, remaining); timer = setTimeout(() => { if (index + 1 < stories.length) showAt(index + 1); else hide(); }, remaining); });
  document.addEventListener('keydown', event => { if (viewer.hidden) return; if (event.key === 'Escape') hide(); if (event.key === 'ArrowRight') navigateBy(1); if (event.key === 'ArrowLeft') navigateBy(-1); });
  loadCount();
  load();
})();
