/* V_116: local scroll reveal. Daily Bible Verse replays whenever it re-enters view. */
(() => {
  "use strict";
  const start = () => {
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
    if (!targets.length || !("IntersectionObserver" in window)) return;

    targets.forEach((el, i) => {
      el.classList.add("arc-scroll-reveal");
      el.style.setProperty("--arc-reveal-delay", `${(i % 3) * 85}ms`);
    });
    document.documentElement.classList.add("arc-scroll-reveal-enabled");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (el.id === "daily-bible-verse") {
          // Replay the fade-up every time the verse card leaves and re-enters view.
          el.classList.toggle("arc-scroll-reveal-visible", entry.isIntersecting);
        } else if (entry.isIntersecting) {
          // Keep other page sections stable after their first reveal.
          el.classList.add("arc-scroll-reveal-visible");
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
    targets.forEach((el) => observer.observe(el));
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
