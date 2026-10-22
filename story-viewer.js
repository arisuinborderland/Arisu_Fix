'use strict';
(() => {
  const bubble = document.getElementById('recoveryStoryBubble');
  const viewer = document.getElementById('recoveryStoryViewer');
  if (!bubble || !viewer) return;
  const image = viewer.querySelector('.story-viewer-image');
  const caption = viewer.querySelector('.story-viewer-caption');
  const progress = viewer.querySelector('.story-viewer-progress');
  const close = viewer.querySelector('.story-viewer-close');
  const timestamp = viewer.querySelector('.story-viewer-time');
  let stories = [], index = 0, timer = 0, started = 0;
  const DURATION = 7000;
  function hide() { viewer.hidden = true; document.body.classList.remove('story-viewer-open'); clearTimeout(timer); progress.style.transition = 'none'; }
  function timeAgo(value) { const date = new Date(value); if (!value || Number.isNaN(date.getTime())) return ''; const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000)); if (seconds < 60) return 'Just now'; if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; return `${Math.floor(seconds / 86400)}d ago`; }
  function showAt(next) {
    if (!stories.length) return hide();
    index = (next + stories.length) % stories.length;
    const story = stories[index]; image.src = story.imageUrl; image.alt = 'Temporary Recovery Story'; caption.textContent = story.caption || '';
    timestamp.textContent = timeAgo(story.publishedAt || story.published_at);
    progress.style.transition = 'none'; progress.style.width = '0%'; viewer.hidden = false; document.body.classList.add('story-viewer-open'); started = Date.now();
    clearTimeout(timer); requestAnimationFrame(() => requestAnimationFrame(() => { progress.style.transition = `width ${DURATION}ms linear`; progress.style.width = '100%'; }));
    timer = setTimeout(() => index + 1 < stories.length ? showAt(index + 1) : hide(), DURATION);
  }
  async function load() {
    try {
      const response = await fetch('/api/stories', { cache: 'no-store' }); if (!response.ok) return;
      const data = await response.json(); stories = Array.isArray(data.stories) ? data.stories : [];
      if (!stories.length) { bubble.hidden = true; return; }
      bubble.hidden = false; bubble.setAttribute('aria-label', `View ${stories.length} active Recovery ${stories.length === 1 ? 'Story' : 'Stories'}`);
      bubble.querySelector('.story-bubble-count').textContent = String(stories.length);
    } catch { bubble.hidden = true; }
  }
  bubble.addEventListener('click', () => showAt(0)); close.addEventListener('click', hide);
  viewer.querySelector('.story-viewer-next').addEventListener('click', () => showAt(index + 1));
  viewer.querySelector('.story-viewer-prev').addEventListener('click', () => showAt(index - 1));
  viewer.addEventListener('click', event => { if (event.target === viewer) hide(); });
  viewer.addEventListener('pointerdown', event => { if (event.target.closest('button')) return; clearTimeout(timer); const elapsed = Math.min(DURATION, Date.now() - started); progress.style.transition = 'none'; progress.style.width = `${elapsed / DURATION * 100}%`; });
  viewer.addEventListener('pointerup', event => { if (event.target.closest('button') || viewer.hidden) return; const elapsed = Math.min(DURATION, Date.now() - started); const remaining = Math.max(250, DURATION - elapsed); progress.style.transition = `width ${remaining}ms linear`; progress.style.width = '100%'; timer = setTimeout(() => index + 1 < stories.length ? showAt(index + 1) : hide(), remaining); });
  document.addEventListener('keydown', event => { if (viewer.hidden) return; if (event.key === 'Escape') hide(); if (event.key === 'ArrowRight') showAt(index + 1); if (event.key === 'ArrowLeft') showAt(index - 1); });
  load();
})();
