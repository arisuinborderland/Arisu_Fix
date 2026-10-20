/* Customer review lightbox. Loaded only on pages that contain the review viewer. */
(() => {
  "use strict";
  // Full-size image viewer for real screenshots added to the review slots.
  const reviewLightbox = document.getElementById("reviewLightbox");
  const reviewLightboxImage = document.getElementById("reviewLightboxImage");
  const reviewLightboxClose = document.getElementById("reviewLightboxClose");
  const closeReviewLightbox = () => {
    if (!reviewLightbox || reviewLightbox.hidden) return;
    reviewLightbox.hidden = true;
    if (reviewLightboxImage) {
      reviewLightboxImage.style.backgroundImage = "none";
      reviewLightboxImage.setAttribute("aria-label", "Enlarged customer review screenshot");
    }
    document.body.classList.remove("review-lightbox-open");
  };
  document.querySelectorAll(".review-proof-image:not(.is-placeholder) img").forEach((image) => {
    const button = image.closest(".review-proof-image");
    if (!button) return;
    button.addEventListener("click", () => {
      if (!reviewLightbox || !reviewLightboxImage) return;
      // Render the enlarged image as a CSS background rather than an <img> element,
      // so mobile browsers are less likely to expose their native image save menu.
      const imageUrl = image.currentSrc || image.src;
      reviewLightboxImage.style.backgroundImage = `url("${imageUrl.replace(/["\\]/g, "\\$&")}")`;
      reviewLightboxImage.setAttribute("aria-label", image.alt || "Customer review screenshot");
      reviewLightbox.hidden = false;
      document.body.classList.add("review-lightbox-open");
      if (reviewLightboxClose) reviewLightboxClose.focus();
    });
  });
  if (reviewLightboxClose) reviewLightboxClose.addEventListener("click", closeReviewLightbox);
  if (reviewLightbox) reviewLightbox.addEventListener("click", (event) => {
    if (event.target === reviewLightbox) closeReviewLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeReviewLightbox();
  });
})();
