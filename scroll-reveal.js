/* Lightweight, responsive reveal animation for opening and both scroll directions. */
(() => {
  "use strict";

  const start = () => {
    const selectors = [
      "main > #daily-bible-verse",
      "main > .compact-intro",
      ".scam-awareness-card",
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
      ".services-section .service-platform",
      ".services-section .deletion-option",
      ".services-section .service-disclaimer",
      ".why-arisu-section > .why-arisu-card > .why-arisu-heading",
      ".why-arisu-section .why-history-card",
      ".why-arisu-section .why-arisu-grid > .why-arisu-item",
      ".why-arisu-section .why-arisu-note",
      ".why-arisu-section > .why-arisu-card > .process-heading-band",
      ".how-section .steps-grid > .step-card",
      ".about-section > .about-card",
      ".purpose-section > .purpose-card",
      ".safety-section > .safety-panel",
      ".terms-section > .terms-card",
      ".site-footer > *"
    ];
    const selectorText = selectors.join(",");
    const uniqueTargets = [...new Set(document.querySelectorAll(selectorText))];
    if (!uniqueTargets.length) return;

    // If observers are unavailable, leave everything visible rather than hiding page content.
    if (!("IntersectionObserver" in window)) return;

    uniqueTargets.forEach((el, index) => {
      el.classList.add("arc-scroll-reveal");
      el.classList.remove("arc-scroll-reveal-visible");
      // Very short stagger: enough depth without a slow cascade on desktop.
      el.style.setProperty("--arc-reveal-delay", `${(index % 3) * 28}ms`);
    });

    // The opening animation uses the same observer: anything in the first viewport
    // reveals immediately after initialization; later targets reveal on either scroll direction.
    requestAnimationFrame(() => {
      document.documentElement.classList.add("arc-scroll-reveal-enabled");
      const header = document.querySelector(".topbar");
      const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Threshold zero avoids missed triggers for tall desktop cards/sections.
          // Toggling on every enter/exit intentionally repeats for scroll-up and scroll-down.
          const visible = entry.isIntersecting && entry.intersectionRatio > 0;
          entry.target.classList.toggle("arc-scroll-reveal-visible", visible);
        });
      }, {
        threshold: 0,
        rootMargin: `-${Math.min(headerHeight, 90)}px 0px -4% 0px`
      });

      uniqueTargets.forEach((el) => observer.observe(el));

      // Observe only content insertions, not attribute/style changes, to keep this lightweight.
      const mutationObserver = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType !== 1) continue;
            const newlyFound = [];
            if (node.matches?.(selectorText)) newlyFound.push(node);
            if (node.querySelectorAll) newlyFound.push(...node.querySelectorAll(selectorText));
            for (const el of newlyFound) {
              if (el.classList.contains("arc-scroll-reveal")) continue;
              el.classList.add("arc-scroll-reveal");
              el.style.setProperty("--arc-reveal-delay", `${(uniqueTargets.length % 3) * 28}ms`);
              observer.observe(el);
            }
          }
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
