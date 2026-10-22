'use strict';
(() => {
  const bubble = document.getElementById('recoveryStoryBubble');
  const viewer = document.getElementById('recoveryStoryViewer');
  if (!bubble || !viewer) return;
  const image = viewer.querySelector('.story-viewer-image');
  const caption = viewer.querySelector('.story-viewer-caption');
  const progress = viewer.querySelector('.story-viewer-progress');
  const close = viewer.querySelector('.story-viewer-close');
  let stories = [], index = 0, timer = 0, started = 0;
  const DURATION = 7000;
  function hide() { viewer.hidden = true; document.body.classList.remove('story-viewer-open'); clearTimeout(timer); }
  function showAt(next) {
    if (!stories.length) return hide();
    index = (next + stories.length) % stories.length;
    const story = stories[index]; image.src = story.imageUrl; image.alt = 'Temporary Recovery Story'; caption.textContent = story.caption || '';
    progress.style.width = '0%'; viewer.hidden = false; document.body.classList.add('story-viewer-open'); started = Date.now();
    clearTimeout(timer); requestAnimationFrame(() => { progress.style.transition = `width ${DURATION}ms linear`; progress.style.width = '100%'; });
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
  document.addEventListener('keydown', event => { if (viewer.hidden) return; if (event.key === 'Escape') hide(); if (event.key === 'ArrowRight') showAt(index + 1); if (event.key === 'ArrowLeft') showAt(index - 1); });
  load();
})();
