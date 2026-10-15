/* V_119: repeat-on-scroll reveals on desktop and mobile, including reduced-motion desktop configurations. */
(() => {
  "use strict";

  const start = () => {
    const header = document.querySelector(".topbar");
    const selectors = [
      "#daily-bible-verse",
      ".whatsapp-button",
      "#floatingWhatsApp",
      ".whatsapp-notice",
      ".contact-divider",
      ".social-collage > .social-card-link",
      ".social-collage > .social-feedback-card",
      ".social-collage > .recovery-proofs-showcase",
      "#reviewsGrid",
      ".how-section .section-heading",
      ".how-section .step-card",
      ".about-card",
      ".safety-panel",
      ".terms-card",
      ".site-footer > *"
    ];
    const targets = [...document.querySelectorAll(selectors.join(","))];
    if (!targets.length) return;

    targets.forEach((el, i) => {
      el.classList.add("arc-scroll-reveal");
      el.style.setProperty("--arc-reveal-delay", `${(i % 3) * 70}ms`);
      // Start hidden so first entry gets the same fade-up as later entries.
      el.classList.remove("arc-scroll-reveal-visible");
    });
    document.documentElement.classList.add("arc-scroll-reveal-enabled");

    // Keep the observer active on desktop too. Some desktop systems set
    // prefers-reduced-motion by default; that must not disable the requested
    // repeat-on-scroll effect for this site.

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("arc-scroll-reveal-visible"));
      return;
    }

    let observer = null;
    let lastHeaderHeight = -1;
    const observeTargets = () => {
      const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
      if (observer && headerHeight === lastHeaderHeight) return;
      if (observer) observer.disconnect();
      lastHeaderHeight = headerHeight;

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Toggle visibility each time the target enters/leaves the visible
          // band. This repeats in both scroll directions on desktop and mobile.
          const shouldShow = entry.isIntersecting && entry.intersectionRatio >= 0.06;
          entry.target.classList.toggle("arc-scroll-reveal-visible", shouldShow);
        });
      }, {
        threshold: [0, 0.06],
        // The topbar is sticky on small screens and can overlay content.
        rootMargin: `-${headerHeight}px 0px -4% 0px`
      });
      targets.forEach((el) => observer.observe(el));
    };

    observeTargets();
    window.addEventListener("resize", observeTargets, { passive: true });
    if (header && "ResizeObserver" in window) {
      const headerResizeObserver = new ResizeObserver(observeTargets);
      headerResizeObserver.observe(header);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
