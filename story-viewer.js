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
  const storyCounter = viewer.querySelector('.story-viewer-counter');
  const emptyState = viewer.querySelector('.story-viewer-empty');
  const emptyDone = viewer.querySelector('.story-viewer-empty-done');
  const emptyTitle = emptyState?.querySelector('h2');
  const emptyMessage = emptyState?.querySelector('p');
  const defaultEmptyTitleMarkup = emptyTitle?.innerHTML || '';
  const defaultEmptyMessageText = emptyMessage?.textContent || '';
  let stories = [], index = 0, timer = 0, holdPauseTimer = 0, started = 0, navigating = false, progressPaused = false, pausedElapsed = 0, pendingNavigation = [], countLoaded = false, countHasUsableValue = false, storyOpenRequestId = 0, activeStoryId = '', storyListLoadRequested = false;
  const STORY_COUNT_CACHE_KEY = 'arisuFixStoriesCount.v1';
  const STORY_COUNT_CACHE_TTL_MS = 10 * 60 * 1000;
  const STORY_LIST_CACHE_KEY = 'arisuFixStoriesList.v1';
  const STORY_SIGNED_URL_REUSE_MS = 40 * 60 * 1000;
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
  function hide() { storyOpenRequestId++; viewer.hidden = true; document.body.classList.remove('story-viewer-open'); clearTimeout(timer); clearTimeout(holdPauseTimer); holdPauseTimer = 0; progressPaused = false; pausedElapsed = 0; pendingNavigation = []; navigating = false; viewer.classList.remove('story-viewer-switching'); viewer.classList.remove('story-viewer-empty-open'); if (emptyState) emptyState.hidden = true; if (storyCounter) storyCounter.hidden = true; image.hidden = false; caption.hidden = false; progressTrack.hidden = false; viewer.querySelector('.story-viewer-meta').hidden = false; progressFills.forEach(fill => { fill.style.transition = 'none'; }); }
  function showEmptyState(state = 'empty') {
    clearTimeout(timer);
    navigating = false;
    image.hidden = true;
    caption.hidden = true;
    progressTrack.hidden = true;
    if (storyCounter) storyCounter.hidden = true;
    viewer.querySelector('.story-viewer-meta').hidden = false;
    if (emptyState) emptyState.hidden = false;
    clearTimeout(holdPauseTimer);
    holdPauseTimer = 0;
    progressPaused = false;
    pausedElapsed = 0;
    pendingNavigation = [];
    if (emptyTitle) {
      if (state === 'unavailable') emptyTitle.innerHTML = 'Stories Temporarily <span>Unavailable</span>';
      else if (state === 'loading') emptyTitle.textContent = 'Loading Stories…';
      else emptyTitle.innerHTML = defaultEmptyTitleMarkup;
    }
    if (emptyMessage) {
      if (state === 'unavailable') emptyMessage.textContent = 'Could not connect to the Stories service. Please try again shortly.';
      else if (state === 'loading') emptyMessage.textContent = 'Preparing the latest stories…';
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
    if (viewer.hidden || !stories.length || (direction !== -1 && direction !== 1)) return;
    if (navigating) {
      // Preserve rapid repeated taps while the requested image is being prepared.
      if (pendingNavigation.length < 12) pendingNavigation.push(direction);
      return;
    }
    const targetIndex = index + direction;
    // Left on the first Story stays put. Right on the last (including a
    // single-Story viewer) exits back to the site instead of becoming a dead tap.
    if (targetIndex < 0) return;
    if (targetIndex >= stories.length) { hide(); return; }

    // Switch immediately. showAt() assigns the target URL directly; the browser
    // paints it when ready, while the progress timer waits for image readiness.
    navigating = true;
    clearTimeout(timer);
    clearTimeout(holdPauseTimer);
    holdPauseTimer = 0;
    progressPaused = false;
    pausedElapsed = 0;
    showAt(targetIndex);
    requestAnimationFrame(() => {
      viewer.classList.remove('story-viewer-switching');
      navigating = false;
      processPendingNavigation();
    });
  }
  function processPendingNavigation() {
    if (viewer.hidden || navigating || !pendingNavigation.length) return;
    const direction = pendingNavigation.shift();
    navigateBy(direction);
    // A queued left tap at the first Story is a no-op; continue draining any
    // later taps rather than leaving the navigation queue stuck.
    if (!viewer.hidden && !navigating && pendingNavigation.length) processPendingNavigation();
  }
  function timeAgo(value) { const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return ''; const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000)); if (seconds < 60) return 'Just now'; if (seconds < 3600) { const minutes = Math.floor(seconds / 60); return `${minutes} min${minutes === 1 ? '' : 's'} ago`; } if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; return `${Math.floor(seconds / 86400)}d ago`; }
  function updateStoryCounter() {
    if (!storyCounter) return;
    const total = stories.length;
    storyCounter.textContent = total ? `${index + 1} / ${total}` : '';
    storyCounter.hidden = total === 0;
    storyCounter.setAttribute('aria-label', total ? `Story ${index + 1} of ${total}` : 'No Stories');
  }

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
    const clamped = Math.max(0, Math.min(100, percent)) / 100;
    progressFills.forEach((fill, fillIndex) => {
      const segment = fill.parentElement;
      fill.style.transition = 'none';
      segment.classList.toggle('is-complete', fillIndex < index);
      segment.classList.toggle('is-active', fillIndex === index);
      if (fillIndex < index) fill.style.transform = 'scaleX(1)';
      else if (fillIndex > index) fill.style.transform = 'scaleX(0)';
      else {
        fill.style.transform = `scaleX(${clamped})`;
        if (animate) {
          // Animate the compositor-friendly transform instead of changing layout width.
          // Force the starting transform to apply before starting the linear progress.
          void fill.offsetWidth;
          fill.style.transition = `transform ${Math.max(0, duration)}ms linear`;
          fill.style.transform = 'scaleX(1)';
        }
      }
    });
  }
  function showAt(next) {
    if (!stories.length) return hide();
    const targetIndex = Number(next);
    if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= stories.length) return hide();
    index = targetIndex;
    updateStoryCounter();
    viewer.classList.remove('story-viewer-empty-open'); if (emptyState) emptyState.hidden = true; image.hidden = true; caption.hidden = false; progressTrack.hidden = false; viewer.querySelector('.story-viewer-meta').hidden = false;
    const story = stories[index];
    const storyId = String(story.id || '');
    activeStoryId = storyId;
    image.onload = null;
    image.onerror = null;
    image.src = story.imageUrl;
    warmNextImage(index);
    image.alt = 'Temporary Recovery Story';
    caption.textContent = story.caption || '';
    // Count a story at most once per browser-tab session. The server's unique
    // (story_id, session_id) key is the final protection against duplicate requests.
    if (story.id) recordStoryView(story.id);
    timestamp.textContent = timeAgo(story.publishedAt || story.published_at);
    if (progressFills.length !== stories.length) renderProgressSegments();
    clearTimeout(timer);
    clearTimeout(holdPauseTimer);
    holdPauseTimer = 0;
    progressPaused = false;
    pausedElapsed = 0;
    setProgress(0);
    viewer.hidden = false;
    document.body.classList.add('story-viewer-open');

    // Keep the image hidden until its full load completes, avoiding progressive partial rendering.
    // Start the 7-second timer only once the image can be displayed in full.
    let progressStarted = false;
    const startStoryProgress = () => {
      if (progressStarted || viewer.hidden || activeStoryId !== storyId) return;
      progressStarted = true;
      image.hidden = false;
      started = Date.now();
      requestAnimationFrame(() => requestAnimationFrame(() => setProgress(0, true, DURATION)));
      timer = setTimeout(() => {
        if (index + 1 < stories.length) showAt(index + 1);
        else hide();
      }, DURATION);
    };
    image.onload = startStoryProgress;
    image.onerror = startStoryProgress;
    if (image.complete && image.naturalWidth > 0) startStoryProgress();
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
  function isReusableStoryImage(story, now = Date.now()) {
    if (!story || typeof story !== 'object') return false;
    const id = String(story.id || '');
    const imageUrl = String(story.imageUrl || '');
    const fetchedAt = Number(story.imageUrlFetchedAt);
    const expiresAt = Date.parse(story.expiresAt || story.expires_at || '');
    return UUID_RE.test(id)
      && /^https:\/\//i.test(imageUrl)
      && Number.isFinite(fetchedAt)
      && fetchedAt <= now
      && now - fetchedAt < STORY_SIGNED_URL_REUSE_MS
      && Number.isFinite(expiresAt)
      && expiresAt > now;
  }

  function readCachedStories() {
    try {
      const cached = JSON.parse(localStorage.getItem(STORY_LIST_CACHE_KEY) || 'null');
      if (!Array.isArray(cached?.stories)) return [];
      return cached.stories
        .filter(story => isReusableStoryImage(story))
        .map(story => ({ ...story }));
    } catch {
      return [];
    }
  }

  function saveCachedStories() {
    try {
      localStorage.setItem(STORY_LIST_CACHE_KEY, JSON.stringify({
        stories: stories.filter(story => isReusableStoryImage(story))
      }));
    } catch {
      /* Live API data remains available when browser storage is unavailable. */
    }
  }

  function mergeFreshStories(freshStories, previousStories, fetchedAt = Date.now()) {
    const previousById = new Map(previousStories.map(story => [String(story.id || ''), story]));
    return freshStories
      .filter(story => story && typeof story.imageUrl === 'string' && /^https:\/\//i.test(story.imageUrl))
      .map(story => {
        const previous = previousById.get(String(story.id || ''));
        const reusePreviousUrl = isReusableStoryImage(previous, fetchedAt);
        return {
          ...story,
          imageUrl: reusePreviousUrl ? previous.imageUrl : story.imageUrl,
          imageUrlFetchedAt: reusePreviousUrl ? Number(previous.imageUrlFetchedAt) : fetchedAt
        };
      });
  }

  function renderCachedCount() {
    if (!mobileStoriesCount) return null;
    const cachedCount = readCachedCount();
    if (cachedCount !== null) {
      // Paint the last known count immediately while network revalidation is deferred.
      mobileStoriesCount.textContent = String(cachedCount);
      countHasUsableValue = true;
      mobileStoriesCount.setAttribute('aria-label', `${cachedCount} available stories`);
      mobileStoriesCount.dataset.countCache = 'browser-storage';
      setCountLoading(false);
    } else {
      setCountLoading(true);
    }
    return cachedCount;
  }

  async function loadCount() {
    if (!mobileStoriesCount) return;
    const requestStarted = performance.now();
    const cachedCount = renderCachedCount();
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
    storyListLoadRequested = true;
    const previouslyKnownStories = stories.slice();
    try {
      const response = await fetch('/api/stories', { cache: 'no-store' });
      if (!response.ok) throw new Error('Stories API request failed');
      const data = await response.json();
      const fetchedStories = Array.isArray(data.stories) ? data.stories : [];
      stories = mergeFreshStories(fetchedStories, previouslyKnownStories, Date.now());
      saveCachedStories();
      // Fallback to the loaded public list if the lightweight count endpoint is unavailable.
      if (mobileStoriesCount && !countLoaded && !countHasUsableValue) {
        mobileStoriesCount.textContent = String(stories.length);
        countHasUsableValue = true;
        mobileStoriesCount.setAttribute('aria-label', `${stories.length} available stories`);
        setCountLoading(false);
      }
      // Story media is deferred until the visitor explicitly opens Stories.
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

    // Open the viewer immediately. Let the browser load the image in-place
    // instead of making the visitor wait for preload/decode to finish.
    if (stories.length) {
      showAt(0);
      load().then(refreshed => {
        if (!refreshed || requestId !== storyOpenRequestId || viewer.hidden || !activeStoryId) return;
        const freshIndex = stories.findIndex(story => String(story.id || '') === activeStoryId);
        if (freshIndex < 0) return;
        index = freshIndex;
        updateStoryCounter();
        const story = stories[index];
        if (image.src !== story.imageUrl) {
          const refreshedImageUrl = story.imageUrl;
          const refreshedStoryId = String(story.id || '');
          // Keep the visible image on screen until a renewed signed URL is ready.
          preloadImage(refreshedImageUrl).then(ready => {
            if (!ready || viewer.hidden || requestId !== storyOpenRequestId || activeStoryId !== refreshedStoryId) return;
            if (String(stories[index]?.id || '') === refreshedStoryId) image.src = refreshedImageUrl;
          });
        }
        caption.textContent = story.caption || '';
        timestamp.textContent = timeAgo(story.publishedAt || story.published_at);
        if (progressFills.length !== stories.length) renderProgressSegments();
        const elapsed = Math.min(DURATION, Math.max(0, Date.now() - started));
        const remaining = Math.max(0, DURATION - elapsed);
        setProgress(elapsed / DURATION * 100, remaining > 0, remaining || DURATION);
      });
      return;
    }

    // On a first visit, show feedback on the tap immediately while the list API
    // resolves. Once data arrives, showAt() assigns the image URL directly and
    // the browser paints it as soon as it is available.
    showEmptyState('loading');
    const refreshed = await load();
    if (requestId !== storyOpenRequestId) return;
    if (refreshed && stories.length) {
      showAt(0);
    } else {
      showEmptyState(refreshed ? 'empty' : 'unavailable');
    }
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
  function pauseStoryProgress() {
    if (viewer.hidden || navigating || progressPaused) return;
    progressPaused = true;
    pausedElapsed = Math.min(DURATION, Math.max(0, Date.now() - started));
    clearTimeout(timer);
    setProgress(pausedElapsed / DURATION * 100);
  }
  function resumeStoryProgress() {
    if (!progressPaused || viewer.hidden) return;
    progressPaused = false;
    const remaining = Math.max(0, DURATION - pausedElapsed);
    started = Date.now() - pausedElapsed;
    setProgress(pausedElapsed / DURATION * 100, true, remaining || DURATION);
    timer = setTimeout(() => {
      if (index + 1 < stories.length) showAt(index + 1);
      else hide();
    }, remaining);
    pausedElapsed = 0;
  }
  viewer.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || viewer.hidden || navigating) return;
    clearTimeout(holdPauseTimer);
    holdPauseTimer = window.setTimeout(pauseStoryProgress, 160);
  });
  window.addEventListener('pointerup', () => {
    clearTimeout(holdPauseTimer);
    holdPauseTimer = 0;
    resumeStoryProgress();
  });
  window.addEventListener('pointercancel', () => {
    clearTimeout(holdPauseTimer);
    holdPauseTimer = 0;
    resumeStoryProgress();
  });
  document.addEventListener('keydown', event => { if (viewer.hidden) return; if (event.key === 'Escape') hide(); if (event.key === 'ArrowRight') navigateBy(1); if (event.key === 'ArrowLeft') navigateBy(-1); });
  // Seed the viewer and count from recent local data without blocking the
  // homepage's critical render. Start fetching the lightweight Story list as
  // soon as the page load event fires, rather than waiting for idle time; this
  // avoids a 1.2–2.5s cold-start penalty when a visitor taps Stories.
  // Keep the count request idle-scheduled because it is not needed to open Stories.
  // Keep signed URLs only for 40 minutes; Supabase issues them for one hour.
  function scheduleInitialDataLoad() {
    const scheduleCountLoad = () => {
      const runCountLoad = () => loadCount();
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(runCountLoad, { timeout: 2500 });
      } else {
        window.setTimeout(runCountLoad, 1200);
      }
    };

    const runStoryListLoad = () => {
      // A visitor who opens Stories first already triggered load() on demand.
      if (!storyListLoadRequested) load();
    };

    if (document.readyState === 'complete') {
      runStoryListLoad();
      scheduleCountLoad();
    } else {
      window.addEventListener('load', () => {
        runStoryListLoad();
        scheduleCountLoad();
      }, { once: true });
    }
  }

  stories = readCachedStories();
  renderCachedCount();
  scheduleInitialDataLoad();
})();
