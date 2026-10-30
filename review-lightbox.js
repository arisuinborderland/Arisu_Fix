/* Customer review screenshot viewer with accessible zoom and pan controls. */
(() => {
  "use strict";
  const lightbox = document.getElementById("reviewLightbox");
  const viewer = document.getElementById("reviewLightboxImage");
  const closeButton = document.getElementById("reviewLightboxClose");
  const zoomOutButton = document.getElementById("reviewLightboxZoomOut");
  const zoomResetButton = document.getElementById("reviewLightboxZoomReset");
  const zoomInButton = document.getElementById("reviewLightboxZoomIn");
  if (!lightbox || !viewer) return;

  let triggerBeforeOpen = null;
  let currentImage = null;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragStart = null;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const opened = () => !lightbox.hidden;

  function getFitSize() {
    if (!currentImage || !viewer.clientWidth || !viewer.clientHeight) return null;
    const fit = Math.min(viewer.clientWidth / currentImage.naturalWidth, viewer.clientHeight / currentImage.naturalHeight);
    return { width: currentImage.naturalWidth * fit, height: currentImage.naturalHeight * fit };
  }

  function renderZoom() {
    if (!currentImage) return;
    const fitSize = getFitSize();
    if (!fitSize) return;
    const width = fitSize.width * zoom;
    const height = fitSize.height * zoom;
    const maxX = Math.max(0, (width - viewer.clientWidth) / 2);
    const maxY = Math.max(0, (height - viewer.clientHeight) / 2);
    offsetX = clamp(offsetX, -maxX, maxX);
    offsetY = clamp(offsetY, -maxY, maxY);
    viewer.style.backgroundSize = `${width}px ${height}px`;
    viewer.style.backgroundPosition = `calc(50% + ${offsetX}px) calc(50% + ${offsetY}px)`;
    if (zoomResetButton) zoomResetButton.textContent = `${Math.round(zoom * 100)}%`;
    if (zoomOutButton) zoomOutButton.disabled = zoom <= MIN_ZOOM;
    if (zoomInButton) zoomInButton.disabled = zoom >= MAX_ZOOM;
  }

  function setZoom(nextZoom) {
    zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    if (zoom === MIN_ZOOM) { offsetX = 0; offsetY = 0; }
    renderZoom();
  }

  // The image is a CSS background, so use its rendered bounds to distinguish
  // taps on the image from taps on the empty space around it.
  function isPointInsideRenderedImage(clientX, clientY) {
    const fitSize = getFitSize();
    if (!fitSize || !currentImage) return false;
    const rect = viewer.getBoundingClientRect();
    const renderedWidth = fitSize.width * zoom;
    const renderedHeight = fitSize.height * zoom;
    const left = rect.left + (viewer.clientWidth - renderedWidth) / 2 + offsetX;
    const top = rect.top + (viewer.clientHeight - renderedHeight) / 2 + offsetY;
    return clientX >= left && clientX <= left + renderedWidth &&
      clientY >= top && clientY <= top + renderedHeight;
  }

  function openReviewImage(image, trigger) {
    if (!image) return;
    triggerBeforeOpen = trigger || image.closest("button") || null;
    const imageUrl = image.dataset.fullSrc || image.currentSrc || image.src;
    if (!imageUrl) return;
    viewer.style.backgroundImage = `url("${imageUrl.replace(/["\\]/g, "\\$&")}")`;
    viewer.style.backgroundSize = "contain";
    viewer.style.backgroundPosition = "center";
    viewer.setAttribute("aria-label", image.alt || "Enlarged customer review screenshot");
    lightbox.hidden = false;
    document.body.classList.add("review-lightbox-open");
    zoom = 1; offsetX = 0; offsetY = 0; currentImage = null;
    const preload = new Image();
    preload.onload = () => {
      currentImage = preload;
      renderZoom();
    };
    preload.src = imageUrl;
    if (closeButton) closeButton.focus();
  }

  function closeReviewLightbox() {
    if (!opened()) return;
    lightbox.hidden = true;
    viewer.style.backgroundImage = "none";
    viewer.style.backgroundSize = "contain";
    viewer.style.backgroundPosition = "center";
    viewer.setAttribute("aria-label", "Enlarged customer review screenshot");
    currentImage = null; dragStart = null; zoom = 1; offsetX = 0; offsetY = 0;
    document.body.classList.remove("review-lightbox-open");
    if (triggerBeforeOpen && typeof triggerBeforeOpen.focus === "function") triggerBeforeOpen.focus();
  }

  document.querySelectorAll(".review-proof-card .review-proof-image img").forEach((image) => {
    const button = image.closest(".review-proof-image");
    if (button) button.addEventListener("click", () => openReviewImage(image, button));
  });
  document.querySelectorAll(".review-proof-card [data-review-open]").forEach((details) => {
    const activate = () => {
      const image = details.closest(".review-proof-card")?.querySelector(".review-proof-image img");
      openReviewImage(image, details);
    };
    details.addEventListener("click", activate);
    details.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); activate();
      }
    });
  });

  // Close when the user taps the backdrop or the empty area inside the
  // viewer container, but keep the lightbox open when tapping the image itself.
  viewer.addEventListener("click", (event) => {
    if (event.target !== viewer) return;
    if (!isPointInsideRenderedImage(event.clientX, event.clientY)) closeReviewLightbox();
  });

  if (closeButton) closeButton.addEventListener("click", closeReviewLightbox);
  if (zoomOutButton) zoomOutButton.addEventListener("click", () => setZoom(zoom - 0.5));
  if (zoomInButton) zoomInButton.addEventListener("click", () => setZoom(zoom + 0.5));
  if (zoomResetButton) zoomResetButton.addEventListener("click", () => setZoom(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeReviewLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (!opened()) return;
    if (event.key === "Escape") closeReviewLightbox();
    else if (event.key === "+" || event.key === "=") setZoom(zoom + 0.5);
    else if (event.key === "-") setZoom(zoom - 0.5);
    else if (event.key === "0") setZoom(1);
  });

  // Drag to pan while zoomed. Mouse wheel can zoom; buttons provide the mobile-friendly fallback.
  viewer.addEventListener("pointerdown", (event) => {
    if (!opened() || zoom <= 1 || event.button !== 0) return;
    dragStart = { x: event.clientX, y: event.clientY, offsetX, offsetY, pointerId: event.pointerId };
    viewer.setPointerCapture?.(event.pointerId);
    viewer.classList.add("is-panning");
  });
  viewer.addEventListener("pointermove", (event) => {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;
    offsetX = dragStart.offsetX + event.clientX - dragStart.x;
    offsetY = dragStart.offsetY + event.clientY - dragStart.y;
    renderZoom();
  });
  const stopPan = (event) => {
    if (!dragStart || (event && dragStart.pointerId !== event.pointerId)) return;
    dragStart = null;
    viewer.classList.remove("is-panning");
  };
  viewer.addEventListener("pointerup", stopPan);
  viewer.addEventListener("pointercancel", stopPan);
  viewer.addEventListener("lostpointercapture", () => stopPan());
  viewer.addEventListener("wheel", (event) => {
    if (!opened()) return;
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? 0.25 : -0.25));
  }, { passive: false });
  window.addEventListener("resize", () => { if (opened()) renderZoom(); });
})();
