/* Responsive scroll-direction header behavior. */
(() => {
  'use strict';
  const header = document.querySelector('.topbar');
  if (!header) return;

  const topThreshold = 32;
  // Accumulate small movements so slow scrolling still changes the header state.
  const hideDistance = 6;
  const showDistance = 4;
  let lastY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  let direction = 0;
  let distanceInDirection = 0;
  let framePending = false;

  header.classList.add('topbar-scroll-aware');
  // Always start with the shared header visible; stale hidden state must not survive navigation.
  header.classList.remove('topbar-scroll-hidden');

  const updateHeader = () => {
    const currentY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const delta = currentY - lastY;

    if (currentY <= topThreshold) {
      header.classList.remove('topbar-scroll-hidden');
      direction = 0;
      distanceInDirection = 0;
    } else if (delta !== 0) {
      const nextDirection = delta > 0 ? 1 : -1;
      if (nextDirection !== direction) {
        direction = nextDirection;
        distanceInDirection = 0;
      }
      distanceInDirection += Math.abs(delta);

      if (direction > 0 && distanceInDirection >= hideDistance) {
        header.classList.add('topbar-scroll-hidden');
        distanceInDirection = 0;
      } else if (direction < 0 && distanceInDirection >= showDistance) {
        header.classList.remove('topbar-scroll-hidden');
        distanceInDirection = 0;
      }
    }

    lastY = currentY;
    framePending = false;
  };

  window.addEventListener('scroll', () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateHeader);
  }, { passive: true });

  window.addEventListener('pageshow', (event) => {
    lastY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    direction = 0;
    distanceInDirection = 0;
    header.classList.remove('topbar-scroll-hidden');
    // BFCache can restore the page while retaining the previous scroll/header state.
    if (event.persisted && (document.body.classList.contains('reviews-document') || document.body.classList.contains('proofs-document'))) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      lastY = 0;
    }
  });
})();
