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
  if (lastY <= topThreshold) header.classList.remove('topbar-scroll-hidden');

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

  window.addEventListener('pageshow', () => {
    lastY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    direction = 0;
    distanceInDirection = 0;
    if (lastY <= topThreshold) header.classList.remove('topbar-scroll-hidden');
  });
})();
