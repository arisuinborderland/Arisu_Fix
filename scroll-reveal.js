/* V_117: reliable repeat-on-scroll reveal, including the Daily Bible Verse below the sticky header. */
(() => {
  "use strict";

  const start = () => {
    const verse = document.querySelector("#daily-bible-verse");
    const header = document.querySelector(".topbar");
    const selectors = [
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
    if (!targets.length && !verse) return;

    targets.forEach((el, i) => {
      el.classList.add("arc-scroll-reveal");
      el.style.setProperty("--arc-reveal-delay", `${(i % 3) * 85}ms`);
    });
    if (verse) {
      verse.classList.add("arc-scroll-reveal");
      verse.style.setProperty("--arc-reveal-delay", "0ms");
    }
    document.documentElement.classList.add("arc-scroll-reveal-enabled");

    // General content is revealed once, so other sections don't repeatedly flicker.
    if (targets.length && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("arc-scroll-reveal-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
      targets.forEach((el) => observer.observe(el));
    } else {
      targets.forEach((el) => el.classList.add("arc-scroll-reveal-visible"));
    }

    if (!verse) return;
    if (!("IntersectionObserver" in window)) {
      verse.classList.add("arc-scroll-reveal-visible");
      return;
    }

    // The verse is immediately below a sticky header. Exclude the header area
    // from the observer's viewport so its animation starts when it is actually
    // visible below the header, not while it is hidden behind it during scroll.
    let verseObserver = null;
    let lastHeaderHeight = -1;
    const observeVerse = () => {
      const currentHeaderHeight = header
        ? Math.ceil(header.getBoundingClientRect().height)
        : 0;
      if (verseObserver && currentHeaderHeight === lastHeaderHeight) return;
      if (verseObserver) verseObserver.disconnect();
      lastHeaderHeight = currentHeaderHeight;

      verseObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== verse) return;
          // Toggle on every entry/exit, so both fade-up and fade-out replay.
          verse.classList.toggle("arc-scroll-reveal-visible", entry.isIntersecting);
        });
      }, {
        threshold: 0.05,
        rootMargin: `-${currentHeaderHeight}px 0px -4% 0px`
      });
      verseObserver.observe(verse);
    };

    observeVerse();
    // Header height can change across mobile breakpoints or device rotation.
    window.addEventListener("resize", observeVerse, { passive: true });
    if (header && "ResizeObserver" in window) {
      const headerResizeObserver = new ResizeObserver(observeVerse);
      headerResizeObserver.observe(header);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
