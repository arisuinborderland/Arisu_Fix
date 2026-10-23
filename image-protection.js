// Keep preview and proof images consistent for both static and dynamically added content.
(() => {
  const protectedSelector = [
    ".social-profile-preview", ".tiktok-profile-preview", ".facebook-page-preview",
    ".recovery-proofs-preview", ".recovery-proof-preview-item", ".reviews-grid-featured",
    ".review-proof-image", ".proof-gallery", ".proof-image-link", ".proof-card",
    ".reviews-gallery", ".review-card", ".review-image-link", ".review-proof-card",
    ".review-lightbox-image", ".review-lightbox"
  ].join(", ");
  const inProtectedArea = (target) => target instanceof Element && Boolean(target.closest(protectedSelector));
  document.addEventListener("contextmenu", (event) => {
    if (inProtectedArea(event.target)) event.preventDefault();
  }, true);
  document.addEventListener("dragstart", (event) => {
    if (inProtectedArea(event.target)) event.preventDefault();
  }, true);
  document.addEventListener("touchstart", (event) => {
    if (inProtectedArea(event.target)) {
      const el = event.target.closest("img, .review-lightbox-image");
      if (el) el.style.webkitTouchCallout = "none";
    }
  }, { passive: true, capture: true });
  const protectImages = (root = document) => {
    root.querySelectorAll?.(`${protectedSelector} img`).forEach((img) => {
      img.draggable = false;
      img.style.webkitUserDrag = "none";
      img.style.webkitTouchCallout = "none";
      img.style.userSelect = "none";
      img.style.webkitUserSelect = "none";
    });
  };
  protectImages();
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) protectImages(node);
    }));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
