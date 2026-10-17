/* ArisuV31 — reliable opening + repeat-on-scroll reveals for desktop and mobile.
   Uses the original V13 .arc-scroll-reveal CSS contract, with corrected targets.
   The global reduced-motion CSS rule is explicitly overridden for this requested effect. */
(() => {
  "use strict";

  const header = document.querySelector(".topbar");
  const selectors = [
    "main > #daily-bible-verse",
    "main > .compact-intro",
    "#contact > .whatsapp-feature-card",
    "#serviceStatus > .service-status-main",
    "#serviceStatus > .service-status-details",
    "#serviceStatus > .service-benefit-row > .service-benefit",
    "#contact > .contact-divider",
    ".social-collage > .social-card-link",
    ".social-collage > .social-feedback-card",
    ".social-collage > .recovery-proofs-showcase",
    ".services-section > .services-heading",
    ".services-section > .services-grid > *",
    ".how-section > .section-heading",
    ".how-section .steps-grid > .step-card",
    ".about-section > .about-card",
    ".safety-section > .safety-panel",
    ".terms-section > .terms-card",
    ".site-footer > *"
  ];
  const selectorText = selectors.join(",");
  const targets = new Set();
  let observer = null;
  let headerHeight = -1;

  // Keep the page naturally visible if the browser lacks IntersectionObserver.
  if (!("IntersectionObserver" in window)) return;

  const registerTargets = (scope = document) => {
    const found = [];
    if (scope.nodeType === 1 && scope.matches?.(selectorText)) found.push(scope);
    if (scope.querySelectorAll) found.push(...scope.querySelectorAll(selectorText));

    found.forEach((el) => {
      if (targets.has(el)) return;
      targets.add(el);
      el.classList.add("arc-scroll-reveal");
      // Brief, bounded stagger: no long cascading delay on desktop or mobile.
      el.style.setProperty("--arc-reveal-delay", `${((targets.size - 1) % 3) * 42}ms`);
      if (observer) observer.observe(el);
    });
  };

  const rebuildObserverIfNeeded = () => {
    const measuredHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    if (observer && measuredHeight === headerHeight) return;
    observer?.disconnect();
    headerHeight = measuredHeight;
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Reversible reveal state: entering the viewport reveals; leaving hides;
        // returning from either scroll direction triggers the same transition.
        const visibleEnough = entry.isIntersecting && entry.intersectionRatio >= 0.035;
        entry.target.classList.toggle("arc-scroll-reveal-visible", visibleEnough);
      });
    }, {
      threshold: [0, 0.035],
      rootMargin: `-${headerHeight}px 0px -4% 0px`
    });
    targets.forEach((el) => observer.observe(el));
  };

  // Add the reveal-enabled state only after the targets are known, so no content
  // is left hidden if initialization is interrupted.
  registerTargets(document);
  if (!targets.size) return;
  document.documentElement.classList.add("arc-scroll-reveal-enabled");
  rebuildObserverIfNeeded();

  window.addEventListener("resize", rebuildObserverIfNeeded, { passive: true });
  if (header && "ResizeObserver" in window) {
    const headerObserver = new ResizeObserver(rebuildObserverIfNeeded);
    headerObserver.observe(header);
  }

  // Handle sections/cards inserted or moved after initial load without needing
  // a reload (e.g. the desktop social/proofs layout and dynamically added cards).
  const mutations = new MutationObserver((records) => {
    let discovered = false;
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === 1 && (node.matches?.(selectorText) || node.querySelector?.(selectorText))) {
          registerTargets(node);
          discovered = true;
        }
      });
    });
    if (discovered && observer) rebuildObserverIfNeeded();
  });
  mutations.observe(document.body, { childList: true, subtree: true });
})();
