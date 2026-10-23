'use strict';
(() => {
  const viewer = document.getElementById('recoveryStoryViewer');
  if (!viewer) return;
  const image = viewer.querySelector('.story-viewer-image');
  const caption = viewer.querySelector('.story-viewer-caption');
  const progressTrack = viewer.querySelector('.story-viewer-progress-track');
  let progressFills = [];
  const close = viewer.querySelector('.story-viewer-close');
  const mobileStoriesButton = document.getElementById('mobileNavStories');
  const mobileStoriesCount = mobileStoriesButton?.querySelector('.mobile-nav-story-count');
  const timestamp = viewer.querySelector('.story-viewer-time');
  let stories = [], index = 0, timer = 0, started = 0, navigating = false, countLoaded = false, countHasUsableValue = false;
  const STORY_COUNT_CACHE_KEY = 'arisuFixStoriesCount.v1';
  const STORY_COUNT_CACHE_TTL_MS = 10 * 60 * 1000;
  const DURATION = 7000;
  const preloadedImages = new Map();
  function hide() { viewer.hidden = true; document.body.classList.remove('story-viewer-open'); clearTimeout(timer); navigating = false; viewer.classList.remove('story-viewer-switching'); progressFills.forEach(fill => { fill.style.transition = 'none'; }); }
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
    const nextIndex = (fromIndex + 1) % stories.length;
    preloadImage(stories[nextIndex].imageUrl);
  }
  function navigateBy(direction) {
    if (viewer.hidden || navigating || !stories.length) return;
    navigating = true;
    clearTimeout(timer);
    const targetIndex = (index + direction + stories.length) % stories.length;
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
    const story = stories[index]; image.src = story.imageUrl; warmNextImage(index); viewer.querySelector('.story-viewer-card').style.setProperty('--story-image-bg', `url("${String(story.imageUrl).replace(/["\\]/g, '')}")`); image.alt = 'Temporary Recovery Story'; caption.textContent = story.caption || '';
    // Count each story display (including revisits/automatic advances). Failure is silent
    // and never delays rendering or the progress timer.
    if (story.id) fetch('/api/story-view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: story.id }), keepalive: true }).catch(() => {});
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
        mobileStoriesCount.dataset.countCache = response.headers.get('x-vercel-cache') || 'origin';
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
      const response = await fetch('/api/stories', { cache: 'no-store' }); if (!response.ok) return;
      const data = await response.json(); stories = Array.isArray(data.stories) ? data.stories : [];
      // Fallback to the loaded public list if the lightweight count endpoint is unavailable.
      if (mobileStoriesCount && !countLoaded && !countHasUsableValue) {
        mobileStoriesCount.textContent = String(stories.length);
        countHasUsableValue = true;
        mobileStoriesCount.setAttribute('aria-label', `${stories.length} available stories`);
        setCountLoading(false);
      }
      // Preload the first story and warm the next one before the viewer is opened.
      stories.slice(0, 2).forEach(story => preloadImage(story.imageUrl));
      if (!stories.length) { if (mobileStoriesButton) mobileStoriesButton.hidden = true; return; }
    } catch { if (mobileStoriesButton) mobileStoriesButton.hidden = true; }
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
  mobileStoriesButton?.addEventListener('click', () => { if (stories.length) showAt(0); });
  close.addEventListener('click', hide);
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
