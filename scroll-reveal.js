/* V_111: self-contained scroll reveal; no CDN dependency. */
(() => {
  "use strict";
  const start = () => {
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
    if (!targets.length || !("IntersectionObserver" in window)) return;

    targets.forEach((el, i) => {
      el.classList.add("arc-scroll-reveal");
      el.style.setProperty("--arc-reveal-delay", `${(i % 3) * 85}ms`);
    });
    document.documentElement.classList.add("arc-scroll-reveal-enabled");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("arc-scroll-reveal-visible");
        } else {
          entry.target.classList.remove("arc-scroll-reveal-visible");
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
